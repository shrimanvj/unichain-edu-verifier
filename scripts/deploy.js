const hre = require("hardhat");

async function main() {
    const MarksheetNFT = await hre.ethers.getContractFactory("MarksheetNFT");
    const marksheetNFT = await MarksheetNFT.deploy();

    await marksheetNFT.waitForDeployment();

    console.log(`✅ Contract deployed at: ${marksheetNFT.target}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    // 0x5FbDB2315678afecb367f032d93F642f64180aa3

// const MarksheetNFT = await ethers.getContractFactory("MarksheetNFT");
// const marksheetNFT = await MarksheetNFT.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
