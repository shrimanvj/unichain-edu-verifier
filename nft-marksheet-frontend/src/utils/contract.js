import { ethers } from 'ethers';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractABI = [
  "function issueMarksheet(address student, string memory ipfsHash) public",
  "function verifyMarksheet(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function studentOwners(uint256) public view returns (address)",
  "event MarksheetIssued(uint256 tokenId, address student, string ipfsHash)",
  "event MarksheetRevoked(uint256 tokenId)"
];

export const getContract = (signer) => {
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const issueMarksheet = async (contract, studentAddress, ipfsHash) => {
  const tx = await contract.issueMarksheet(studentAddress, ipfsHash);
  await tx.wait();
  return tx;
};

export const getStudentMarksheets = async (contract, studentAddress) => {
  const balance = await contract.balanceOf(studentAddress);
  const marksheets = [];
  
  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(studentAddress, i);
    const uri = await contract.tokenURI(tokenId);
    marksheets.push({ id: tokenId.toString(), uri });
  }
  
  return marksheets;
};

export const verifyMarksheet = async (contract, tokenId) => {
  return await contract.verifyMarksheet(tokenId);
};
