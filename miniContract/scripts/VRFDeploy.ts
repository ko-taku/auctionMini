import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    const forwarder = process.env.FORWARDER!;

    console.log("Deploying CustomVRF with:", deployer.address);

    const CustomVRF = await ethers.getContractFactory("CustomVRF");
    const vrf = await CustomVRF.deploy(forwarder);
    await vrf.waitForDeployment();

    console.log("✅ CustomVRF deployed to:", vrf.target);

    const deploymentDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) fs.mkdirSync(deploymentDir);

    const savePath = path.join(deploymentDir, "CustomVRF.json");
    fs.writeFileSync(
        savePath,
        JSON.stringify(
            {
                address: vrf.target,
                forwarder,
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
