import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);

    // ✅ 수동으로 세팅할 기존 배포된 컨트랙트 주소
    const engageTokenAddress = process.env.ENGAGE_TOKEN!;
    const auctionTokenAddress = process.env.AUCTION_TOKEN!;
    const attendanceAddress = process.env.ATTENDANCE_ADDRESS!;

    const bigAmount = ethers.parseUnits("1000000000", 18);

    // ✅ Attach to already deployed contracts
    const engageToken = await ethers.getContractAt("EngageToken", engageTokenAddress);
    const auctionToken = await ethers.getContractAt("AuctionToken", auctionTokenAddress);

    // ✅ Approve EngageToken
    console.log("✅ Approving EngageToken...");
    const tx1 = await engageToken.approve(attendanceAddress, bigAmount);
    await tx1.wait();
    console.log(`✅ EngageToken approve TxHash: ${tx1.hash}`);

    // ✅ Approve AuctionToken
    console.log("✅ Approving AuctionToken...");
    const tx2 = await auctionToken.approve(attendanceAddress, bigAmount);
    await tx2.wait();
    console.log(`✅ AuctionToken approve TxHash: ${tx2.hash}`);

    console.log("✅ ✅ ✅ Approve Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
