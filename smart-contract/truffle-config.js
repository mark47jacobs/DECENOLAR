// const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
// const privateKey = "52a56ac0b855cd6dd9042e2a3759c954b57769c2ec9300eb3f80c61d8c1dae12";
// const endpointUrl = "https://ropsten.infura.io/v3/5a7f0321da3a457dbbb2b8a57b30b1f0";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    // ropsten: {
    //   provider: function () {
    //     return new HDWalletProvider(
    //       [privateKey],
    //       endpointUrl
    //     )
    //   },
    //   gas: 5000000,
    //   gasPrice: 25000000000,
    //   network_id: 3
    // }
  },
  contracts_directory: './contracts/',
  contracts_build_directory: '../front-end/src/assets/abis',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
