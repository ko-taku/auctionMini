import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;

if (!privateKey || !rpcUrl) {
  throw new Error("❌ .env에 PRIVATE_KEY 또는 RPC_URL 누락됨");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "kairos",
  networks: {
    kairos: {
      url: rpcUrl,
      accounts: [privateKey],
    },
  },
};

export default config;
