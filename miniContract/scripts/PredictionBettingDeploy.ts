import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying PredictionBetting with:", deployer.address);

    const engageToken = process.env.ENGAGE_TOKEN!;
    const auctionToken = process.env.AUCTION_TOKEN!;
    const forwarder = process.env.FORWARDER!;
    const auctinManager = process.env.AUCTION_MANAGER_ADDRESS!;
    const vrf = process.env.VRF_ADDRESS!;

    const PredictionBetting = await ethers.getContractFactory("PredictionBetting");
    const betting = await PredictionBetting.deploy(
        engageToken,
        auctionToken,
        auctinManager,
        vrf,
        forwarder
    );
    await betting.waitForDeployment();

    console.log("✅ PredictionBetting deployed to:", betting.target);

    const deploymentDir = path.resolve(__dirname, "../deployments");
    const savePath = path.join(deploymentDir, "PredictionBetting.json");
    fs.writeFileSync(
        savePath,
        JSON.stringify(
            {
                address: betting.target,
                forwarder,
                auctionManager: auctinManager,
                customVRF: vrf,
                network: process.env.RPC_URL || "unknown"
            },
            null,
            2
        )
    );

    console.log(`✅ Address saved to ${savePath}`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
