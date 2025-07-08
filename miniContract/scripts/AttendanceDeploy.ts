import * as path from "path";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const forwarder = process.env.FORWARDER;
    const engageToken = process.env.ENGAGE_TOKEN;
    const auctionToken = process.env.AUCTION_TOKEN;

    if (!forwarder || !engageToken || !auctionToken) {
        throw new Error(".env에 주소가 누락됨");
    }

    const AttendanceReward = await ethers.getContractFactory("AttendanceRewardMeta");
    const attendanceReward = await AttendanceReward.deploy(engageToken, auctionToken, forwarder);

    await attendanceReward.waitForDeployment();

    console.log("AttendanceRewardMeta deployed at: ", attendanceReward.target);

}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
});