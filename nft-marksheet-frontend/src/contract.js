import { ethers } from "ethers";
import MarksheetNFT from "./abi/MarksheetNFT.json";

// Replace this with your **actual deployed contract address**
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(contractAddress, MarksheetNFT.abi, signerOrProvider);
};
