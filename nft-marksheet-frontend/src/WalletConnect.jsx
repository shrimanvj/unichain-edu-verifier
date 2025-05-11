import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "./contract";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        const contractInstance = getContract(signer);
        setContract(contractInstance);
        console.log("✅ Wallet connected:", address);
      } catch (err) {
        console.error("❌ Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  return (
    <div>
      <h2>Wallet Connection</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      {walletAddress && (
        <p>
          <strong>Connected Address:</strong> {walletAddress}
        </p>
      )}
    </div>
  );
};

export default WalletConnect;
