import React, { useState, useRef } from 'react';
import { bankTransferApi, type ReceiptData } from '../../services';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReceiptUploadProps {
  paymentReference: string;
  onUploadSuccess: (receiptData: ReceiptData) => void;
  onError: (error: string) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  paymentReference,
  onUploadSuccess,
  onError
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        onError('Please select a valid image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const uploadReceipt = async () => {
    if (!selectedFile) {
      onError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      const result = await bankTransferApi.uploadReceipt(paymentReference, selectedFile);

      if (result.success) {
        onUploadSuccess(result.data);
        toast.success('Receipt uploaded successfully');
      } else {
        onError(result.message || 'Failed to upload receipt');
      }
    } catch (error) {
      onError('Error uploading receipt');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Upload Payment Receipt</h4>
        <p className="text-blue-700 text-sm">
          Upload a clear photo or screenshot of your payment receipt for verification.
        </p>
      </div>

      {/* File Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) {
            const changeEvent = {
              target: {
                files: e.dataTransfer.files
              }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileSelect(changeEvent);
          }
        }}
      >
        {!selectedFile ? (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <label htmlFor="receipt-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                Click to upload receipt
              </label>
              <span> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, PDF up to 5MB
            </p>
            <input
              ref={fileInputRef}
              id="receipt-upload"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            {preview ? (
              <div className="text-center">
                <img src={preview} alt="Receipt preview" className="max-h-40 mx-auto rounded-lg" />
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="text-center text-sm text-gray-600">
              <p>File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={removeFile}
                variant="outline"
                className="px-4 py-2"
              >
                Remove
              </Button>
              <Button
                onClick={uploadReceipt}
                disabled={uploading}
                className="px-6 py-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : 'Upload Receipt'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Tips for a clear receipt:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Ensure all text is clearly visible</li>
          <li>Include the payment reference: <span className="font-mono">{paymentReference}</span></li>
          <li>Show the amount transferred</li>
          <li>Include bank name and account details</li>
          <li>Ensure good lighting and minimal shadows</li>
        </ul>
      </div>
    </div>
  );
};

export default ReceiptUpload;
