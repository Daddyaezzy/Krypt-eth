// FFvWPeBNwc8Hny1TNcVv9yE66TUY68u2   https://eth-sepolia.g.alchemy.com/v2/FFvWPeBNwc8Hny1TNcVv9yE66TUY68u2

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/FFvWPeBNwc8Hny1TNcVv9yE66TUY68u2",
      accounts: [
        "62f1161f9bdf9a1219e7b98e4d8bd868e2731d45f6e7fe164efc4da836966989",
      ],
    },
  },
};
