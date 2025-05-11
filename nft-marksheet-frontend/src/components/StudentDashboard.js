import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import '../styles/main.css';

const contractABI = [
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function studentOwners(uint256) public view returns (address)",
  "function getStudentMarksheets(address student) public view returns (uint256[] memory)",
  "event MarksheetIssued(uint256 indexed tokenId, address indexed student, string ipfsHash, uint256 timestamp)"
];

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function StudentDashboard() {
  const { account, signer } = useWallet();
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (account && signer) {
      fetchMarksheets();
    }
  }, [account, signer]);

  const fetchMarksheets = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Get all token IDs owned by this student
      const tokenIds = await contract.getStudentMarksheets(account);
      
      const marksheetPromises = tokenIds.map(async (tokenId) => {
        try {
          const uri = await contract.tokenURI(tokenId);
          
          // Get the timestamp from the event
          const filter = contract.filters.MarksheetIssued(tokenId, account);
          const events = await contract.queryFilter(filter);
          const event = events[0];
          
          return {
            tokenId: tokenId.toString(),
            uri,
            timestamp: event ? new Date(event.args.timestamp.toNumber() * 1000) : null,
            verificationUrl: `${window.location.origin}/verify/${tokenId}`
          };
        } catch (error) {
          console.error('Error fetching marksheet details:', error);
          return null;
        }
      });

      const results = await Promise.all(marksheetPromises);
      const validMarksheets = results.filter(m => m !== null);
      setMarksheets(validMarksheets);
      
      if (validMarksheets.length > 0) {
        toast.success(`Found ${validMarksheets.length} marksheet(s)`);
      }

    } catch (error) {
      console.error('Error fetching marksheets:', error);
      toast.error('Failed to fetch marksheets');
    } finally {
      setLoading(false);
    }
  };

  const openIPFSLink = (uri) => {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      window.open(`https://gateway.pinata.cloud/ipfs/${hash}`, '_blank');
    } else {
      window.open(uri, '_blank');
    }
  };

  if (!account) {
    return (
      <div className="container text-center">
        <p className="mb-4">Please connect your wallet to view your marksheets</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="mb-0">My Marksheets</h1>
        <div className="card">
          <p className="text-secondary mb-0">Wallet: {account}</p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="spinner"></div>
            <p className="mb-0">Loading marksheets...</p>
          </div>
        </div>
      ) : marksheets.length === 0 ? (
        <div className="card text-center">
          <p className="text-secondary mb-0">No marksheets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 grid-cols-3 fade-in">
          {marksheets.map((marksheet) => (
            <div key={marksheet.tokenId} className="card">
              <div className="mb-3">
                <h3 className="mb-2">Marksheet #{marksheet.tokenId}</h3>
                {marksheet.timestamp && (
                  <p className="text-secondary mb-0">
                    Issued: {format(marksheet.timestamp, 'PPpp')}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openIPFSLink(marksheet.uri)}
                  className="btn btn-primary"
                >
                  View Marksheet
                </button>
                
                <button
                  onClick={() => {
                    setSelectedMarksheet(marksheet);
                    setShowQR(true);
                  }}
                  className="btn btn-secondary"
                >
                  Show QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showQR && selectedMarksheet && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Verification QR Code</h3>
            </div>
            <div className="text-center mb-4">
              <QRCodeSVG value={selectedMarksheet.verificationUrl} size={200} />
            </div>
            <p className="mb-4">
              <strong>Verification URL:</strong><br/>
              <span className="text-secondary">{selectedMarksheet.verificationUrl}</span>
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="btn btn-primary btn-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
