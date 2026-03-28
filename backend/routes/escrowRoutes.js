const express = require("express");
const router = express.Router();
const { web3, escrowContract } = require("../blockchain/escrow");
const auth = require("../middleware/auth");

// POST /api/escrow/create
router.post("/create", auth, async (req, res) => {
    try {
        const { freelancerAddress, amount } = req.body;
        const accounts = await web3.eth.getAccounts();
        const clientAccount = accounts[0];

        const tx = await escrowContract.methods
            .createJob(freelancerAddress)
            .send({
                from: clientAccount,
                value: web3.utils.toWei(amount.toString(), "ether"),
                gas: 6000000
            });

        res.json({ message: "Job created on blockchain", transactionHash: tx.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/escrow/submit
router.post("/submit", auth, async (req, res) => {
    try {
        const { jobId } = req.body;
        const accounts = await web3.eth.getAccounts();
        const freelancerAccount = accounts[1];

        const tx = await escrowContract.methods
            .submitWork(jobId)
            .send({ from: freelancerAccount, gas: 3000000 });

        res.json({ message: "Work submitted successfully", transactionHash: tx.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/escrow/job/:id — read blockchain job data
router.get("/job/:id", auth, async (req, res) => {
    try {
        const jobData = await escrowContract.methods.jobs(req.params.id).call();
        res.json({
            jobId: jobData.jobId.toString(),
            client: jobData.client,
            freelancer: jobData.freelancer,
            amount: web3.utils.fromWei(jobData.amount.toString(), "ether"),
            status: ["Created", "WorkSubmitted", "Approved", "Paid"][Number(jobData.status)]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;