import { post } from './apiClient';

// File upload types based on the API documentation
export interface UploadResponse {
  files: Array<{
    originalName: string;
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
}

export interface SingleUploadResponse {
  originalName: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

const uploadApi = {
  /**
   * Upload multiple files
   * POST /api/v1/upload
   */
  uploadFiles: async (
    files: File[],
    folder?: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Add files (max 10 files)
    const maxFiles = Math.min(files.length, 10);
    for (let i = 0; i < maxFiles; i++) {
      formData.append('files', files[i]);
    }
    
    // Add optional folder
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  /**
   * Upload single file
   * POST /api/v1/upload/single
   */
  uploadSingleFile: async (
    file: File,
    folder?: string
  ): Promise<SingleUploadResponse> => {
    const formData = new FormData();
    
    formData.append('file', file);
    
    // Add optional folder
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await post<SingleUploadResponse>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  /**
   * Validate files before upload
   */
  validateFiles: (files: File[], maxFiles: number = 10): FileValidationResult => {
    const errors: string[] = [];
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
      'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 
      'image/avif'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Supported: JPEG, JPG, PNG, WebP, GIF, SVG, BMP, TIFF, AVIF`);
      }

      if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File too large. Maximum size: 5MB`);
      }

      if (file.size === 0) {
        errors.push(`File ${index + 1}: File is empty`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate single file before upload
   */
  validateSingleFile: (file: File): FileValidationResult => {
    return uploadApi.validateFiles([file], 1);
  },

  /**
   * Get file size in human readable format
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Check if file type is image
   */
  isImageFile: (file: File): boolean => {
    return file.type.startsWith('image/');
  },

  /**
   * Create preview URL for uploaded image
   */
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file);
  },

  /**
   * Cleanup preview URL
   */
  cleanupPreviewUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  /**
   * Prepare files for upload with preview URLs
   */
  prepareFilesWithPreviews: (files: File[]): Array<{
    file: File;
    previewUrl: string;
    name: string;
    size: string;
    type: string;
  }> => {
    return files.map(file => ({
      file,
      previewUrl: uploadApi.isImageFile(file) ? uploadApi.createPreviewUrl(file) : '',
      name: file.name,
      size: uploadApi.formatFileSize(file.size),
      type: file.type
    }));
  }
};

export default uploadApi;
