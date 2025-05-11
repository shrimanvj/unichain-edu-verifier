import { ethers } from "ethers";

export const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      return { provider, signer, userAddress };
    } catch (error) {
      console.error("User denied account access", error);
      return null;
    }
  } else {
    alert("Please install MetaMask!");
    return null;
  }
};
