const { getblock } = require("./getblock.config.js");

module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: getblock.shared.eth.sepolia.rpc[0].go(), // https://go.getblock.io/<ACCESS-TOKEN>/
    },
    goerli: {
      url: `https://go.getblock.io/${getblock.shared.eth.goerli.rpc[0].token()}`, // <ACCESS-TOKEN>
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
