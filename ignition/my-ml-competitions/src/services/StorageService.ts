import { EthStorage } from "ethstorage-sdk";
import { ethers } from "ethers";
import { DataMarketAbi } from "../contracts";

const DATA_MARKET_ADDRESS = import.meta.env.VITE_DATA_MARKET_ADDRESS;
const ETHSTORAGE_RPC = import.meta.env.VITE_ETHSTORAGE_RPC;

export class StorageService {
  private ethStorage: any;
  private dataMarketContract: ethers.Contract | null = null;

  constructor() {
    this.initializeEthStorage();
  }

  private async initializeEthStorage() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      this.ethStorage = await EthStorage.create({
        rpc: provider,
        ethStorageRpc: ETHSTORAGE_RPC,
        signer: signer
      });

      this.dataMarketContract = new ethers.Contract(
        DATA_MARKET_ADDRESS!,
        DataMarketAbi,
        signer
      );
    }
  }

  async uploadToEthStorage(file: File): Promise<string> {
    if (!this.ethStorage) {
      throw new Error("EthStorage not initialized");
    }

    const buffer = await file.arrayBuffer();
    const key = `${Date.now()}-${file.name}`;
    
    await this.ethStorage.write(key, Buffer.from(buffer));
    return key;
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
    if (!this.dataMarketContract) {
      throw new Error("DataMarket contract not initialized");
    }

    const metadataString = JSON.stringify(metadata);
    
    const tx = await this.dataMarketContract.uploadDataset(metadataString);
    const receipt = await tx.wait();

    // Get tokenId, ipId, and licenseTermsId from event logs
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
  }
}

export const storageService = new StorageService();
