import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function DashboardRouter() {
  const navigate = useNavigate();
  const { account, connectWallet, checkIssuerRole, loading } = useWallet();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAndRoute() {
      if (account) {
        try {
          const isIssuer = await checkIssuerRole();
          if (isIssuer) {
            navigate('/issuer');
          } else {
            navigate('/student');
          }
        } catch (error) {
          console.error('Error checking role:', error);
          navigate('/student'); // Default to student if role check fails
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    }

    if (!loading) {
      checkAndRoute();
    }
  }, [account, checkIssuerRole, navigate, loading]);

  if (loading || checking) {
    return (
      <div className="container text-center">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container text-center">
        <p className="mb-4">Please connect your wallet to continue</p>
        <button onClick={connectWallet} className="btn btn-primary">
          Connect Wallet
        </button>
      </div>
    );
  }

  return null; // Will redirect before reaching here
}
