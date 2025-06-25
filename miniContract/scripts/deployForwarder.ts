import { ethers } from "hardhat";

async function main() {
    const Forwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();

    console.log("✅ MinimalForwarder deployed at:", forwarder.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});