import { ethers } from "hardhat";
import * as dotenv from "dotenv";

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
    console.log("AuctionToken deployed at:", userNft.target);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});