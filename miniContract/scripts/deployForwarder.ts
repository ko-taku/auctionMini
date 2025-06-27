import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function main() {
    const Forwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();

    console.log("✅ MinimalForwarder deployed at:", forwarder.target);

    const deploymentDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir);
    }

    const savePath = path.join(deploymentDir, "deployForwarder.json");
    fs.writeFileSync(
        savePath,
        JSON.stringify(
            {
                address: forwarder.target,
                forwarder,
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