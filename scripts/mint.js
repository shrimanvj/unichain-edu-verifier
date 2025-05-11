const hre = require("hardhat");

async function main() {
    const [deployer, student] = await hre.ethers.getSigners();  // Get accounts

    // Replace with your deployed contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const MarksheetNFT = await hre.ethers.getContractFactory("MarksheetNFT");
    const marksheetNFT = MarksheetNFT.attach(contractAddress);

    const studentAddress = student.address;  // Assign NFT to this student
    const ipfsHash = "ipfs://bafkreif6bs2cb7qvbcbjlh3dbwv22idklbgafkba5c7t2nyza5cx56gvs4"; 

    console.log("🛠️ Minting NFT...");

    const txn = await marksheetNFT.issueMarksheet(studentAddress, ipfsHash);
    await txn.wait();  // Wait for confirmation

    console.log(`✅ NFT Minted Successfully to: ${studentAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
// ✅ NFT Minted Successfully to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8