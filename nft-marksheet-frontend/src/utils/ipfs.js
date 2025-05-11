import { create } from '@pinata/sdk';

const pinata = create({
  pinataApiKey: process.env.REACT_APP_PINATA_API_KEY,
  pinataSecretApiKey: process.env.REACT_APP_PINATA_SECRET_KEY
});

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await pinata.pinFileToIPFS(file);
    return 'ipfs://' + result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const getIPFSUrl = (ipfsHash) => {
  if (ipfsHash.startsWith('ipfs://')) {
    const hash = ipfsHash.replace('ipfs://', '');
    return 'https://gateway.pinata.cloud/ipfs/' + hash;
  }
  return ipfsHash;
};
