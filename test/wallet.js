const Wallet = artifacts.require("Wallet");
const { expectRevert } = require("@openzeppelin/test-helpers");
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
    assert(quorum.toNumber() === 3);
  });
  it("should create transfer", async () => {
    await wallet.createTransfer(100, accounts[5], { from: accounts[0] });
    const transfers = await wallet.getTransfers();
    assert(transfers.length === 1);
    assert(transfers[0].id === "0");
    assert(transfers[0].amount === "100");
    assert(transfers[0].to === accounts[5]);
    assert(transfers[0].approver === "0");
    assert(transfers[0].sent === false);
  });
  it("shouldn't create transfers if sender is not approved", async () => {
    await expectRevert(
      wallet.createTransfer(100, accounts[5], {
        from: accounts[6],
      }),
      "only approver allowed"
    );
  });
  it("should increment approval", async () => {
    wallet.createTransfer(100, accounts[5], {
      from: accounts[0],
    });
    await wallet.approveTransfer(0, { from: accounts[0] });
    const transfers = await wallet.getTransfers();
    const balance = await web3.eth.getBalance(wallet.address);
    assert(transfers[0].approvals === "1");
    assert(transfers[0].sent === false);
    assert(balance === "10000");
  });
  it("should transfer if quorum reached", async () => {
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(account[6])
    );
    wallet.createTransfer(100, accounts[6], {
      from: accounts[0],
    });
    await wallet.approveTransfer(0, { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[1] });
    await wallet.approveTransfer(0, { from: accounts[2] });
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(account[6]));
    assert(balanceAfter.sub(balanceBefore).toNumber() === 100);
    // assert(transfers[0].approvals === "1");
    // assert(transfers[0].sent === false);
    // assert(balance === "10000");
  });
  it("should NOT approve transfer if sender is not approved", async () => {
    await expectRevert(
      wallet.approveTransfer(0, {
        from: accounts[4],
      }),
      "only approver allowed"
    );
  });
    it("should NOT approve transfer if transfer is already sent", async () => {
       wallet.createTransfer(100, accounts[6], {
         from: accounts[0],
       });
       await wallet.approveTransfer(0, { from: accounts[0] });
       await wallet.approveTransfer(0, { from: accounts[1] });
        await wallet.approveTransfer(0, { from: accounts[2] });
        await expectRevert(
          wallet.approveTransfer(0, {
            from: accounts[4],
          }),
          "transfer has already been sent"
        );
    });

     it("should NOT approve transfer twice", async () => {
       wallet.createTransfer(100, accounts[6], {
         from: accounts[0],
       });
       await wallet.approveTransfer(0, { from: accounts[0] });
       await expectRevert(
         wallet.approveTransfer(0, {
           from: accounts[0],
         }),
         "cannot approve transfer twice"
       );
     });
});
