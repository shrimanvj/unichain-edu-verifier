// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MarksheetNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    uint256 private _tokenIdCounter;

    mapping(uint256 => address) public studentOwners;
    mapping(address => uint256[]) private studentMarksheets;
    mapping(address => uint256[]) private issuerMarksheets;

    event MarksheetIssued(uint256 tokenId, address student, string ipfsHash, uint256 timestamp);
    event MarksheetRevoked(uint256 tokenId);

    constructor() ERC721("MarksheetNFT", "MSNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);  // Deployer is admin
        _grantRole(ISSUER_ROLE, msg.sender);         // Deployer can issue
    }

    /// @notice Grants an institution permission to issue mark sheets
    function addInstitution(address institution) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, institution);
    }

    /// @notice Removes an institution's permission to issue mark sheets
    function removeInstitution(address institution) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ISSUER_ROLE, institution);
    }

    /// @notice Issues a mark sheet NFT to a student with an IPFS link
    function issueMarksheet(address student, string memory ipfsHash) public onlyRole(ISSUER_ROLE) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, ipfsHash);
        studentOwners[newTokenId] = student;
        
        // Add to student's marksheets
        studentMarksheets[student].push(newTokenId);
        // Add to issuer's marksheets
        issuerMarksheets[msg.sender].push(newTokenId);

        emit MarksheetIssued(newTokenId, student, ipfsHash, block.timestamp);
    }

    /// @notice Allows institutions to revoke a mark sheet
    function revokeMarksheet(uint256 tokenId) public onlyRole(ISSUER_ROLE) {
        require(_existsCheck(tokenId), "Marksheet does not exist");
        address student = studentOwners[tokenId];
        
        _burn(tokenId);
        delete studentOwners[tokenId];
        
        // Remove from student's marksheets
        _removeFromArray(studentMarksheets[student], tokenId);
        // Remove from issuer's marksheets
        _removeFromArray(issuerMarksheets[msg.sender], tokenId);

        emit MarksheetRevoked(tokenId);
    }

    /// @notice Allows anyone to verify a mark sheet
    function verifyMarksheet(uint256 tokenId) public view returns (string memory) {
        require(_existsCheck(tokenId), "Marksheet does not exist");
        return tokenURI(tokenId);
    }

    /// @notice Get all marksheets owned by a student
    function getStudentMarksheets(address student) public view returns (uint256[] memory) {
        return studentMarksheets[student];
    }

    /// @notice Get all marksheets issued by an issuer
    function getIssuerMarksheets(address issuer) public view returns (uint256[] memory) {
        return issuerMarksheets[issuer];
    }

    /// @notice Custom function to check if a token exists
    function _existsCheck(uint256 tokenId) internal view returns (bool) {
        return studentOwners[tokenId] != address(0);
    }

    /// @notice Helper function to remove an item from an array
    function _removeFromArray(uint256[] storage array, uint256 value) private {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    /// @notice Fix for multiple inheritance issue
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721URIStorage, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
