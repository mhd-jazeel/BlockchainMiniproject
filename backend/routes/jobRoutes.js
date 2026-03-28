const express = require("express");
const router = express.Router();
const { createJob, approveJob, submitWork, getJobs, getJobById } = require("../controllers/jobController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// All job routes require authentication
router.get("/", auth, getJobs);
router.get("/:id", auth, getJobById);
router.post("/create", auth, role("client"), createJob);
router.post("/approve", auth, role("client"), approveJob);
router.post("/submit", auth, role("freelancer"), submitWork);

module.exports = router;