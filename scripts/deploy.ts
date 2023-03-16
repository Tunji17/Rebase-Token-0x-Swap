import { ethers } from "hardhat";

async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();
  await mockToken.deployed();
  console.log("MockToken deployed to:", mockToken.address);

  const RebaseToken = await ethers.getContractFactory("RebaseToken");
  const rebaseToken = await RebaseToken.deploy('RebaseToken', 'RBT');
  await rebaseToken.deployed();
  console.log("RebaseToken deployed to:", rebaseToken.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
