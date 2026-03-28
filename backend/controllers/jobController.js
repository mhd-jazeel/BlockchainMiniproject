const Job = require("../models/Job");
const { web3, escrowContract } = require("../blockchain/escrow");

// POST /api/jobs/create  (client only)
const createJob = async (req, res) => {
    try {
        const { title, description, budget, freelancerAddress } = req.body;

        if (!title || !budget || !freelancerAddress) {
            return res.status(400).json({ message: "title, budget and freelancerAddress are required" });
        }

        const accounts = await web3.eth.getAccounts();
        const clientWallet = accounts[0]; // Ganache first account as client

        console.log("[Blockchain] Creating escrow job...");

        const tx = await escrowContract.methods
            .createJob(freelancerAddress)
            .send({
                from: clientWallet,
                value: web3.utils.toWei(budget.toString(), "ether"),
                gas: 3000000
            });

        const blockchainJobId = Number(await escrowContract.methods.jobCounter().call());

        const newJob = new Job({
            title,
            description: description || "",
            budget,
            client: req.user.id,
            freelancerAddress,
            blockchainJobId,
            transactionHash: tx.transactionHash,
            status: "open"
        });

        await newJob.save();

        res.status(201).json({
            message: "Job created and escrow funded",
            job: newJob,
            transactionHash: tx.transactionHash
        });

    } catch (error) {
        console.error("[createJob Error]", error.message);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/jobs/approve  (client only)
const approveJob = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "jobId is required" });
        }

        const accounts = await web3.eth.getAccounts();
        const clientWallet = accounts[0];

        console.log("[Blockchain] Approving work for job:", jobId);

        const tx = await escrowContract.methods
            .approveWork(jobId)
            .send({ from: clientWallet, gas: 3000000 });

        const job = await Job.findOneAndUpdate(
            { blockchainJobId: jobId },
            { status: "completed", transactionHash: tx.transactionHash },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found in database" });
        }

        res.json({
            message: "Work approved and payment released to freelancer",
            job,
            transactionHash: tx.transactionHash
        });

    } catch (error) {
        console.error("[approveJob Error]", error.message);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/jobs/submit  (freelancer only)
const submitWork = async (req, res) => {
    try {
        const { jobId } = req.body;

        const accounts = await web3.eth.getAccounts();
        const freelancerWallet = accounts[1]; // second Ganache account

        console.log("[Blockchain] Submitting work for job:", jobId);

        const tx = await escrowContract.methods
            .submitWork(jobId)
            .send({ from: freelancerWallet, gas: 3000000 });

        const job = await Job.findOneAndUpdate(
            { blockchainJobId: jobId },
            { status: "submitted" },
            { new: true }
        );

        res.json({
            message: "Work submitted successfully",
            job,
            transactionHash: tx.transactionHash
        });

    } catch (error) {
        console.error("[submitWork Error]", error.message);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/jobs  (all authenticated users)
const getJobs = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.status = status;

        const jobs = await Job.find(filter)
            .populate("client", "name email role")
            .populate("freelancer", "name email role")
            .sort({ createdAt: -1 });

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("client", "name email role walletAddress")
            .populate("freelancer", "name email role walletAddress");

        if (!job) return res.status(404).json({ message: "Job not found" });

        res.json(job);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createJob, approveJob, submitWork, getJobs, getJobById };
