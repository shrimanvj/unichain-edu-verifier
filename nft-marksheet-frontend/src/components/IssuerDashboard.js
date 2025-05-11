import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import '../styles/main.css';

const contractABI = [
  "function issueMarksheet(address student, string memory ipfsHash) public",
  "function revokeMarksheet(uint256 tokenId) public",
  "function verifyMarksheet(uint256 tokenId) public view returns (string memory)",
  "function getStudentMarksheets(address student) public view returns (uint256[] memory)",
  "function getIssuerMarksheets(address issuer) public view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function addInstitution(address institution) public",
  "function removeInstitution(address institution) public",
  "function studentOwners(uint256) public view returns (address)",
  "function ISSUER_ROLE() public view returns (bytes32)",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
  "event MarksheetIssued(uint256 indexed tokenId, address indexed student, string ipfsHash, uint256 timestamp)",
  "event MarksheetRevoked(uint256 indexed tokenId)"
];

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;

export default function IssuerDashboard() {
  const { account, signer, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [studentAddress, setStudentAddress] = useState('');
  const [marksheetFile, setMarksheetFile] = useState(null);
  const [issuedMarksheets, setIssuedMarksheets] = useState([]);
  const [newIssuerAddress, setNewIssuerAddress] = useState('');
  const [activeTab, setActiveTab] = useState('issue');
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (account && signer) {
      checkIssuerRole();
    }
  }, [account, signer]);

  const checkIssuerRole = async () => {
    if (!account || !signer || !contractAddress) return false;
    
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const issuerRole = await contract.ISSUER_ROLE();
      const hasRole = await contract.hasRole(issuerRole, account);
      return hasRole;
    } catch (error) {
      console.error('Error checking issuer role:', error);
      return false;
    }
  };

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload to IPFS');
      }

      const result = await response.json();
      return 'ipfs://' + result.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS: ' + error.message);
    }
  };

  const fetchIssuedMarksheets = async () => {
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Get all marksheets issued by this issuer
      const tokenIds = await contract.getIssuerMarksheets(account);
      
      const marksheetPromises = tokenIds.map(async (tokenId) => {
        try {
          // Get the IPFS hash
          const uri = await contract.tokenURI(tokenId);
          
          // Get the student address
          const student = await contract.studentOwners(tokenId);
          
          // Get the timestamp from the event
          const filter = contract.filters.MarksheetIssued(tokenId);
          const events = await contract.queryFilter(filter);
          const event = events[0];
          
          return {
            tokenId: tokenId.toString(),
            student,
            ipfsHash: uri,
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
      setIssuedMarksheets(validMarksheets);
      
      if (validMarksheets.length > 0) {
        toast.success(`Found ${validMarksheets.length} marksheet(s)`);
      }

    } catch (error) {
      console.error('Error fetching marksheets:', error);
      toast.error('Failed to fetch issued marksheets');
    }
  };

  const handleIssuerRoleChange = async (address, action) => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract[action === 'grant' ? 'addInstitution' : 'removeInstitution'](address);
      await tx.wait();
      
      toast.success(`Successfully ${action === 'grant' ? 'granted' : 'revoked'} issuer role`);
      setNewIssuerAddress('');
    } catch (error) {
      console.error('Error managing issuer role:', error);
      toast.error('Failed to manage issuer role');
    } finally {
      setLoading(false);
    }
  };

  const renderIssueForm = () => (
    <form onSubmit={issueMarksheet} className="card fade-in">
      <div className="form-group">
        <label className="form-label">Student Wallet Address</label>
        <input
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          className="form-input"
          placeholder="0x..."
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Marksheet PDF</label>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
              setMarksheetFile(file);
            } else {
              toast.error('Please select a PDF file');
              e.target.value = '';
            }
          }}
          accept=".pdf,application/pdf"
          className="form-input"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !studentAddress || !marksheetFile}
        className="btn btn-primary btn-full"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        ) : (
          'Issue Marksheet'
        )}
      </button>
    </form>
  );

  const issueMarksheet = async (e) => {
    e.preventDefault();
    
    if (!studentAddress || !marksheetFile) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate student address
    if (!ethers.isAddress(studentAddress)) {
      toast.error('Invalid student wallet address');
      return;
    }

    try {
      setLoading(true);
      
      // Create contract instance first
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Upload to IPFS
      const uploadingToast = toast.loading('Uploading to IPFS...');
      let ipfsHash;
      try {
        ipfsHash = await uploadToIPFS(marksheetFile);
        toast.dismiss(uploadingToast);
        toast.success('File uploaded to IPFS');
      } catch (error) {
        toast.dismiss(uploadingToast);
        throw new Error('Failed to upload to IPFS: ' + error.message);
      }

      // Estimate gas for the transaction
      let gasEstimate;
      try {
        gasEstimate = await contract.issueMarksheet.estimateGas(studentAddress, ipfsHash);
      } catch (error) {
        throw new Error('Failed to estimate gas: ' + error.message);
      }

      // Show MetaMask prompt
      const metamaskToast = toast.loading('Please confirm the transaction in MetaMask...');
      const tx = await contract.issueMarksheet(studentAddress, ipfsHash, {
        gasLimit: Math.ceil(gasEstimate * 1.2) // Add 20% buffer
      });
      toast.dismiss(metamaskToast);

      // Wait for confirmation
      const confirmingToast = toast.loading('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      toast.dismiss(confirmingToast);

      // Get token ID from event
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'MarksheetIssued');

      if (event) {
        const tokenId = event.args.tokenId;
        const verificationUrl = `${window.location.origin}/verify/${tokenId}`;
        
        // Show success message with details
        toast.success('Marksheet issued successfully!', {
          duration: 5000,
          icon: '🎓'
        });

        // Set QR code data and show modal
        setSelectedMarksheet({
          tokenId: tokenId.toString(),
          verificationUrl,
          ipfsHash,
          student: studentAddress,
          timestamp: new Date()
        });
        setShowQR(true);

        // Reset form
        setStudentAddress('');
        setMarksheetFile(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        // Refresh lists
        await fetchIssuedMarksheets();
      } else {
        throw new Error('Could not find MarksheetIssued event in transaction receipt');
      }

    } catch (error) {
      console.error('Error issuing marksheet:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected in MetaMask');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected in MetaMask');
      } else {
        toast.error(error.message || 'Failed to issue marksheet');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMarksheetList = () => (
    <div className="fade-in">
      <h2 className="mb-4">Issued Marksheets</h2>
      <div className="grid grid-cols-2 grid-cols-3">
        {issuedMarksheets.map((marksheet) => (
          <div key={marksheet.tokenId} className="card">
            <div className="mb-3">
              <h3 className="mb-2">Marksheet #{marksheet.tokenId}</h3>
              <p className="text-secondary mb-1">
                Student: {marksheet.student}
              </p>
              {marksheet.timestamp && (
                <p className="text-secondary">
                  Issued: {format(marksheet.timestamp, 'PPpp')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${marksheet.ipfsHash.replace('ipfs://', '')}`, '_blank')}
                className="btn btn-primary"
              >
                View PDF
              </button>
              <button
                onClick={() => {
                  setSelectedMarksheet(marksheet);
                  setShowQR(true);
                }}
                className="btn btn-secondary"
              >
                Show QR
              </button>
            </div>
          </div>
        ))}
      </div>
      {issuedMarksheets.length === 0 && (
        <div className="card text-center">
          <p className="text-secondary">No marksheets issued yet</p>
        </div>
      )}
    </div>
  );

  const renderRoleManagement = () => (
    <div className="card fade-in">
      <h2 className="mb-4">Manage Issuer Roles</h2>
      <div className="form-group">
        <label className="form-label">Wallet Address</label>
        <input
          type="text"
          value={newIssuerAddress}
          onChange={(e) => setNewIssuerAddress(e.target.value)}
          className="form-input"
          placeholder="0x..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleIssuerRoleChange(newIssuerAddress, 'grant')}
          disabled={loading || !newIssuerAddress}
          className="btn btn-primary"
        >
          Grant Role
        </button>
        <button
          onClick={() => handleIssuerRoleChange(newIssuerAddress, 'revoke')}
          disabled={loading || !newIssuerAddress}
          className="btn btn-danger"
        >
          Revoke Role
        </button>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="container text-center">
        <p className="mb-4">Please connect your wallet to continue</p>
      </div>
    );
  }

  if (!checkIssuerRole()) {
    return (
      <div className="container text-center">
        <p className="text-danger mb-4">Only authorized issuers can access this page</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('issue')}
            className={`tab ${activeTab === 'issue' ? 'active' : ''}`}
          >
            Issue Marksheet
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
          >
            View Issued
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          >
            Manage Roles
          </button>
        </div>
      </div>

      {activeTab === 'issue' && renderIssueForm()}
      {activeTab === 'view' && renderMarksheetList()}
      {activeTab === 'manage' && renderRoleManagement()}

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
