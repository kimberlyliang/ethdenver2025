import React, { ChangeEvent, useState } from "react";
import { storageService } from "../services/StorageService";

interface FileUploadProps {
  text?: string;
  onFileSelect: (files: File[], metadata?: { 
    tokenId: string;
    ipId: string;
    licenseTermsId: string;
    ethStorageKey: string;
  }) => void;
  accept?: string;
  multiple?: boolean;
  description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  text = "Upload File",
  onFileSelect,
  accept,
  multiple = false,
  description = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploading(true);
      setError(null);

      try {
        // Upload file to ETHStorage
        const ethStorageKey = await storageService.uploadToEthStorage(filesArray[0]);

        // Register dataset and mint NFT
        const metadata = await storageService.registerDataset({
          name: filesArray[0].name,
          description: description || `Dataset uploaded at ${new Date().toISOString()}`,
          ethStorageKey
        });

        onFileSelect(filesArray, {
          ...metadata,
          ethStorageKey
        });

      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
          className={`relative z-10 opacity-0 cursor-pointer h-full w-full`}
        />
        <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            {uploading ? (
              <div className="animate-pulse">Uploading...</div>
            ) : (
              <div>{text}</div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default FileUpload;
