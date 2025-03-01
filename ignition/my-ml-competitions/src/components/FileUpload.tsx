import React, { useEffect, useState } from 'react';
import { storageService } from '../services/StorageService';

export const FileUpload: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        const success = await storageService.initialize();
        setIsInitialized(success);
        setIsMock(storageService.isUsingMock());
        
        if (!success) {
          setError("Failed to initialize storage service. Please check your wallet connection.");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    init();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setUploadedKey(null);
    
    try {
      // Service will auto-initialize if needed
      const key = await storageService.uploadToEthStorage(file);
      console.log("Uploaded file with key:", key);
      setUploadedKey(key);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Dataset</h2>
      {isMock && (
        <div className="mock-warning">
          <p><strong>Note:</strong> Using mock storage implementation for development.</p>
          <p>Files will be stored in memory and not on EthStorage.</p>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      
      <input 
        type="file" 
        onChange={handleChange} 
        disabled={isUploading} 
      />
      
      {isUploading && <p>Uploading...</p>}
      
      {!isInitialized && !error && <p>Initializing storage service...</p>}
      
      {!isInitialized && (
        <button onClick={() => storageService.reinitialize()}>
          Reconnect Wallet
        </button>
      )}
      
      {uploadedKey && (
        <div className="upload-success">
          <p>Upload successful!</p>
          <p>Storage Key: {uploadedKey}</p>
        </div>
      )}
    </div>
  );
};
