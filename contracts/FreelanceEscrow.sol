// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FreelanceEscrow {

    uint public jobCounter = 0;

    enum JobStatus { Created, WorkSubmitted, Approved, Paid }

    struct Job {
        uint jobId;
        address client;
        address freelancer;
        uint amount;
        JobStatus status;
    }

    mapping(uint => Job) public jobs;

    function createJob(address _freelancer) public payable {
        require(msg.value > 0, "Payment must be greater than 0");

        jobCounter++;

        jobs[jobCounter] = Job({
            jobId: jobCounter,
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            status: JobStatus.Created
        });
    }

    function submitWork(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.freelancer, "Only freelancer can submit");
        require(job.status == JobStatus.Created, "Invalid job state");

        job.status = JobStatus.WorkSubmitted;
    }

    function approveWork(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can approve");
        require(job.status == JobStatus.WorkSubmitted, "Work not submitted");

        job.status = JobStatus.Approved;

        payable(job.freelancer).transfer(job.amount);

        job.status = JobStatus.Paid;
    }
}