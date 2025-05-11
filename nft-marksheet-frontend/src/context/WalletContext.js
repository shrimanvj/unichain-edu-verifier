import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext();

const contractABI = [
  "function ISSUER_ROLE() public view returns (bytes32)",
  "function hasRole(bytes32 role, address account) public view returns (bool)"
];

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export function useWallet() {
  return useContext(WalletContext);
}

export default function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
    }
    setLoading(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Initial connection check
      checkWalletConnection();

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]); // Add provider as dependency

  useEffect(() => {
    if (account && signer) {
      checkIssuerRole();
    }
  }, [account, signer, chainId]);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setIsIssuer(false);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (provider) {
        try {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
        } catch (error) {
          console.error('Error getting signer:', error);
        }
      }
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        try {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          
          // Get chain ID
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          
          toast.success('Wallet connected successfully!');
        } catch (error) {
          console.error('Error getting signer:', error);
          toast.error('Error connecting wallet');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const checkIssuerRole = async () => {
    if (!account || !signer || !contractAddress) return false;
    
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const issuerRole = await contract.ISSUER_ROLE();
      const hasRole = await contract.hasRole(issuerRole, account);
      setIsIssuer(hasRole);
      return hasRole;
    } catch (error) {
      console.error('Error checking issuer role:', error);
      setIsIssuer(false);
      return false;
    }
  };

  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum || !provider) {
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        try {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          
          // Get chain ID
          const network = await provider.getNetwork();
          setChainId(network.chainId);
        } catch (error) {
          console.error('Error getting signer:', error);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setAccount(null);
      setSigner(null);
      setIsIssuer(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsIssuer(false);
    setLoading(false);
    toast.success('Wallet disconnected');
  };

  const value = {
    account,
    provider,
    signer,
    isIssuer,
    chainId,
    loading,
    connectWallet,
    disconnectWallet,
    checkIssuerRole
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
