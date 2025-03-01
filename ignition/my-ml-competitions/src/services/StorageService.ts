import { ethers } from "ethers";
import { DataMarketAbi } from "../contracts";
import { Buffer } from 'buffer';

// Add polyfills needed for ethstorage-sdk
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = { env: {} } as any;
}

const DATA_MARKET_ADDRESS = import.meta.env.VITE_DATA_MARKET_ADDRESS;
const ETHSTORAGE_RPC = import.meta.env.VITE_ETHSTORAGE_RPC;

// Mock EthStorage for development if real one doesn't work
class MockEthStorage {
  private storedFiles = new Map<string, ArrayBuffer>();
  
  async write(key: string, data: Buffer): Promise<void> {
    console.log(`[MOCK] Writing data to key: ${key}, size: ${data.length} bytes`);
    this.storedFiles.set(key, data.buffer);
    return Promise.resolve();
  }
  
  async read(key: string): Promise<Buffer> {
    console.log(`[MOCK] Reading data from key: ${key}`);
    const data = this.storedFiles.get(key);
    if (!data) {
      throw new Error(`File with key ${key} not found`);
    }
    return Buffer.from(data);
  }
}

export class StorageService {
  private ethStorage: any = null;
  private dataMarketContract: ethers.Contract | null = null;
  private initialized = false;
  private initializing = false;
  private useMock = false;

  constructor() {
    // Don't initialize in the constructor
    // Wait for explicit initialization call
  }

  /**
   * Initialize the storage service - must be called before using other methods
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    if (this.initializing) {
      // Wait until initialization completes if already in progress
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.initialized;
    }

    this.initializing = true;

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        console.error("Ethereum provider not found. Please install MetaMask.");
        this.initializing = false;
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Try to initialize EthStorage
        try {
          // Attempt dynamic import 
          const ethStorageModule = await import('ethstorage-sdk').catch(e => null);
          
          if (ethStorageModule?.EthStorage) {
            try {
              this.ethStorage = new ethStorageModule.EthStorage({
                rpc: provider,
                ethStorageRpc: ETHSTORAGE_RPC,
                signer: signer
              });
            } catch (constructorError) {
              console.error("EthStorage constructor failed:", constructorError);
              // Try alternative approaches here if needed
              this.useMock = true;
              this.ethStorage = new MockEthStorage();
              console.warn("[MOCK] Using mock EthStorage implementation for development");
            }
          } else {
            console.warn("EthStorage module not available. Using mock implementation.");
            this.useMock = true;
            this.ethStorage = new MockEthStorage();
            console.warn("[MOCK] Using mock EthStorage implementation for development");
          }
        } catch (importError) {
          console.error("Error importing EthStorage:", importError);
          this.useMock = true;
          this.ethStorage = new MockEthStorage();
          console.warn("[MOCK] Using mock EthStorage implementation for development");
        }

        // Initialize the DataMarket contract
        this.dataMarketContract = new ethers.Contract(
          DATA_MARKET_ADDRESS!,
          DataMarketAbi,
          signer
        );
        
        this.initialized = true;
        console.log("StorageService initialized. Using mock:", this.useMock);
      } catch (error) {
        console.error("Failed to initialize storage service:", error);
      }
    } finally {
      this.initializing = false;
    }
    
    return this.initialized;
  }

  async uploadToEthStorage(file: File): Promise<string> {
    // Try to initialize if not already done
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error("Failed to initialize EthStorage. Please check your wallet connection.");
      }
    }
    
    if (!this.ethStorage) {
      throw new Error("EthStorage not initialized");
    }

    const buffer = await file.arrayBuffer();
    const key = `${Date.now()}-${file.name}`;
    
    try {
      await this.ethStorage.write(key, Buffer.from(buffer));
      if (this.useMock) {
        console.log("[MOCK] File uploaded successfully with key:", key);
      }
      return key;
    } catch (error) {
      console.error("Error uploading to EthStorage:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async registerDataset(metadata: {
    name: string;
    description: string;
    ethStorageKey: string;
  }): Promise<{
    tokenId: string;
    ipId: string;
    licenseTermsId: string;
  }> {
    // Try to initialize if not already done
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error("Failed to initialize contracts. Please check your wallet connection.");
      }
    }
    
    if (!this.dataMarketContract) {
      throw new Error("DataMarket contract not initialized");
    }

    const metadataString = JSON.stringify(metadata);
    
    try {
      const tx = await this.dataMarketContract.uploadDataset(metadataString);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) => log.eventName === 'DatasetUploaded'
      );

      if (!event) {
        throw new Error("Dataset upload event not found");
      }

      return {
        tokenId: event.args.tokenId.toString(),
        ipId: event.args.ipId,
        licenseTermsId: event.args.licenseTermsId?.toString() || '0'
      };
    } catch (error) {
      console.error("Error registering dataset:", error);
      throw new Error(`Failed to register dataset: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.initialized && !!this.ethStorage;
  }

  // Check if using mock implementation
  isUsingMock(): boolean {
    return this.useMock;
  }

  // Explicit re-initialization method for UI
  async reinitialize(): Promise<boolean> {
    this.initialized = false;
    this.ethStorage = null;
    this.dataMarketContract = null;
    this.useMock = false;
    return await this.initialize();
  }
}

const storageServiceInstance = new StorageService();
export { storageServiceInstance as storageService };

// In FileUpload.tsx component
import React, { useEffect, useState, JSX } from 'react';
import { storageService } from '../services/StorageService';

export const FileUpload: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        const success = await storageService.initialize();
        setIsInitialized(success);
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
    
    try {
      // Service will auto-initialize if needed
      const key = await storageService.uploadToEthStorage(file);
      console.log("Uploaded file with key:", key);
      // Handle successful upload...
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
      {error && <p className="error">{error}</p>}
      <input 
        type="file" 
        onChange={handleChange} 
        disabled={isUploading || !isInitialized || error} 
      />
      {isUploading && <p>Uploading...</p>}
      {!isInitialized && !error && <p>Initializing storage service...</p>}
      {!isInitialized && <button onClick={() => storageService.reinitialize()}>Reconnect Wallet</button>}
    </div>
  );
};