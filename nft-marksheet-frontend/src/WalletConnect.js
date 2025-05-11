import React from 'react';

function WalletConnect() {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected account:', accounts[0]);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className="wallet-connect">
      <button onClick={connectWallet} className="connect-button">
        Connect Wallet
      </button>
    </div>
  );
}

export default WalletConnect;
