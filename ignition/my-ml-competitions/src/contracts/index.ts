import { ethers } from "ethers";

// Hardcoded ABI for now - this should be replaced with actual ABI from contract compilation
export const DataMarketAbi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      }
    ],
    "name": "uploadDataset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const contractAddresses = {
  DataMarket: "0x83f7330E42987B636359a16e0C50813f014a35A5",
};

export function getDataMarketContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(contractAddresses.DataMarket, DataMarketAbi, signerOrProvider);
}
