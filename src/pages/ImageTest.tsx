import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { getImageUrl } from '../lib/utils'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

/**
 * A component for testing image display
 * Use this to debug image URLs and display
 */
const ImageTest: React.FC = () => {
  const { imageUrl } = useParams<{ imageUrl: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [decodedUrl, setDecodedUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  
  useEffect(() => {
    if (imageUrl) {
      try {
        // Try to decode the URL
        const decoded = decodeURIComponent(imageUrl)
        setDecodedUrl(decoded)
        
        // Try to parse as JSON if it's a JSON string
        let jsonObject = null
        if (decoded.startsWith('{') && decoded.endsWith('}')) {
          try {
            jsonObject = JSON.parse(decoded)
            console.log('Successfully parsed as JSON:', jsonObject)
          } catch (e) {
            console.error('Failed to parse as JSON:', e)
          }
        }
        
        // Process through getImageUrl
        const processed = getImageUrl(decoded)
        setProcessedUrl(processed)
        
        console.log('Original URL:', imageUrl)
        console.log('Decoded URL:', decoded)
        console.log('JSON Object:', jsonObject)
        console.log('Processed URL:', processed)
      } catch (error) {
        console.error('Error processing URL:', error)
      }
    }
  }, [imageUrl])
  
  const handleImageLoad = () => {
    setStatus('success')
    console.log('Image loaded successfully!')
  }
  
  const handleImageError = () => {
    setStatus('error')
    console.error('Image failed to load')
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/wishlist" className="flex items-center text-purple-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> 
        Back to Wishlist
      </Link>
      
      <Card className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <ImageIcon className="w-6 h-6 mr-2 text-blue-500" />
          Image Test Component
        </h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Image URL Information</h2>
          <div className="bg-gray-50 p-4 rounded-md overflow-auto">
            <p><strong>Original URL:</strong> <code className="text-xs break-all">{imageUrl}</code></p>
            <p><strong>Decoded URL:</strong> <code className="text-xs break-all">{decodedUrl}</code></p>
            <p><strong>Processed URL:</strong> <code className="text-xs break-all">{processedUrl}</code></p>
            
            {decodedUrl && decodedUrl.startsWith('{') && decodedUrl.endsWith('}') && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p><strong>JSON Content:</strong></p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(decodedUrl), null, 2);
                    } catch (e) {
                      return "Invalid JSON";
                    }
                  })()}
                </pre>
              </div>
            )}
            
            {decodedUrl && decodedUrl.startsWith('{') && decodedUrl.endsWith('}') && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p><strong>Direct URL from JSON:</strong></p>
                {(() => {
                  try {
                    const json = JSON.parse(decodedUrl);
                    if (json.url) {
                      return (
                        <div>
                          <code className="text-xs break-all">{json.url}</code>
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              onClick={() => window.open(json.url, '_blank')}
                              size="sm"
                            >
                              Open Direct URL
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    return <p className="text-red-500 text-xs">No URL property found in JSON</p>;
                  } catch (e) {
                    return <p className="text-red-500 text-xs">Invalid JSON</p>;
                  }
                })()}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
          <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
            {status === 'loading' && (
              <div className="text-center text-gray-500 mb-2">Loading image...</div>
            )}
            
            <div className={`border border-gray-200 rounded-md overflow-hidden relative ${status === 'error' ? 'border-red-300' : ''}`}>
              <img 
                src={processedUrl} 
                alt="Test Image" 
                className="max-w-full h-auto max-h-[400px]"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80">
                  <div className="text-red-600 text-center p-4">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Failed to load image</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <p><strong>Status:</strong> {
                status === 'loading' ? 'Loading...' :
                status === 'success' ? 'Successfully loaded' :
                'Failed to load'
              }</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Button 
            variant="outline" 
            onClick={() => window.open(processedUrl, '_blank')}
          >
            Open Image in New Tab
          </Button>
          
          <Button 
            onClick={() => setStatus('loading')}
          >
            Reload Image
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ImageTest
