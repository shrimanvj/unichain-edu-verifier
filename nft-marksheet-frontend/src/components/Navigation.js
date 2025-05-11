import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Navigation() {
  const { account, isIssuer, loading, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-left">
            <div className="nav-brand">
              <Link to="/" className="nav-title">
                NFT Marksheet
              </Link>
            </div>
            <div className="nav-links">
              <div className="nav-links-group">
                <Link
                  to="/"
                  className="nav-link"
                >
                  Student Dashboard
                </Link>
                {isIssuer && (
                  <Link
                    to="/issuer"
                    className="nav-link"
                  >
                    Issuer Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="nav-right">
            {!loading && (
              <>
                {account ? (
                  <div className="nav-wallet">
                    <span className="wallet-address">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                      onClick={disconnectWallet}
                      className="button button-danger"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="button button-primary"
                  >
                    Connect Wallet
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
