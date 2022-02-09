const Wallet = artifacts.require("Wallet");

contract("Wallet", (accounts) => {
  let wallet;
  beforeEach(async () => {
    //where smart contract is deployed
    wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 3);
    web3.eth.sendTransaction({
      from: accounts[0],
      to: wallet.address,
      value: 10000,
    });
  });
  it("should have correct approvers and quorum", async () => {
    const approvers = await wallet.getApprovers();
    const quorum = await wallet.quorum();
    assert(approvers.length === 3);
    assert(approvers[0] === accounts[0]);
    assert(approvers[1] === accounts[1]);
    assert(approvers[2] === accounts[2]);
    assert(quorum.toNumber() === 3  );
  });
    it("should create transfer", async () => {
        await wallet.createTransfer(100, accounts[5], { from: accounts[0] })
        const transfers = await wallet.getTransfers();
        assert(transfers.length === 1);
        assert(transfers[0].id === '0');
        assert(transfers[0].amount === '100');
        assert(transfers[0].to === accounts[5]);
        assert(transfers[0].approver === '0');
        assert(transfers[0].sent === false);
    })
    it.only("shouldn't create transfers if sender is not approved", async () => {
        try {
            await wallet.createTransfer(100, accounts[5], {
              from: accounts[6],
            }); 
        } catch (error) {
            console.log(error)
            assert(e === "only approver allowed");
        }
       

    })
});
