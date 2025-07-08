import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const AuctionToken = await ethers.getContractFactory("AuctionToken");
    const auctionToken = await AuctionToken.deploy();
    await auctionToken.waitForDeployment();
    console.log("AuctionToken deployed at:", auctionToken.target);

    const EngageToken = await ethers.getContractFactory("EngageToken");
    const engageToken = await EngageToken.deploy();
    await engageToken.waitForDeployment();
    console.log("EngageToken deployed at:", engageToken.target);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});