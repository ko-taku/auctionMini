import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

if (!process.env.FORWARDER) {
    throw new Error("FORWARDER address is not set in .env file");
}
const forwarder = process.env.FORWARDER as string;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const UserNft = await ethers.getContractFactory("UserMintedNFT");
    const userNft = await UserNft.deploy(forwarder);
    await userNft.waitForDeployment();
    console.log("userMintedNFT deployed at:", userNft.target);

    const deploymentDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir);
    }

    const savePath = path.join(deploymentDir, "UserMintedNFT.json");
    fs.writeFileSync(
        savePath,
        JSON.stringify(
            {
                address: userNft.target,
                deployer: deployer.address,
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