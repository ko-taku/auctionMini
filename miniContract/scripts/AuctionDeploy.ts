import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const auctionTokenAddress = process.env.AUCTION_TOKEN!;
    const trustedForwarderAddress = process.env.FORWARDER!;
    const ownerAddress = deployer.address; // 또는 다른 지갑 주소 가능

    const AuctionManager = await ethers.getContractFactory("AuctionManager");

    console.log("Deploying AuctionManager...");
    const auctionManager = await AuctionManager.deploy(
        auctionTokenAddress,
        trustedForwarderAddress,
        ownerAddress
    );

    await auctionManager.waitForDeployment();

    console.log("AuctionManager deployed to:", auctionManager.target);

    const deploymentDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir);
    }

    const savePath = path.join(deploymentDir, "AuctionManager.json");
    fs.writeFileSync(
        savePath,
        JSON.stringify(
            {
                address: auctionManager.target,
                trustedForwarderAddress,
                network: process.env.RPC_URL || "unknown"
            },
            null,
            2
        )
    );
    console.log(`Address saved to ${savePath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
