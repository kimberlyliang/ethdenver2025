import React, { useState } from 'react';
// import { storageService } from '../services/StorageService';

interface FileMetadata {
  tokenId: string;
  ipId: string;
  licenseTermsId: string;
  ethStorageKey: string;
}

interface FileUploadProps {
  text?: string;
  accept?: string;
  description?: string;
  onFileSelect?: (files: File[], metadata?: FileMetadata) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  text = "Upload File",
  accept,
  description,
  onFileSelect
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setUploadedKey(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const generatedKey = `${Date.now()}-${file.name}`;
      console.log("Uploaded file with key:", generatedKey);
      setUploadedKey(generatedKey);
      
      if (onFileSelect) {
        onFileSelect([file], {
          tokenId: '0',
          ipId: generatedKey,
          licenseTermsId: '0',
          ethStorageKey: generatedKey
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      
      {error && <p className="error text-red-500">{error}</p>}
      
      <input 
        type="file"
        accept={accept}
        onChange={handleChange} 
        disabled={isUploading} 
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      {isUploading && <p>Uploading...</p>}
      
      {uploadedKey && (
        <div className="upload-success mt-2 p-2 bg-green-50 text-green-700 rounded">
          <p>Upload successful!</p>
          <p className="text-sm">Storage Key: {uploadedKey}</p>
        </div>
      )}
    </div>
  );
};
