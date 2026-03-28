const FreelanceEscrow = artifacts.require("FreelanceEscrow");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(FreelanceEscrow, accounts[1], {
    from: accounts[0],
    value: web3.utils.toWei("1", "ether")
  });
};
