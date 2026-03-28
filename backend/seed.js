/**
 * FreelanceX Seed Script
 * Run: node seed.js
 * Creates 6 clients, 6 freelancers, and 35 realistic jobs.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("./models/User");
const Job      = require("./models/Job");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Blockchain";

// ── Sample Users ─────────────────────────────────────────────────────────────
const clients = [
  { name: "Alice Chen",      email: "alice@freelancex.io",   role: "client",     walletAddress: "0xABCdef1234567890ABCdef1234567890ABCdef12" },
  { name: "Bob Martinez",    email: "bob@freelancex.io",     role: "client",     walletAddress: "0x1111222233334444555566667777888899990000" },
  { name: "Carol Williams",  email: "carol@freelancex.io",   role: "client",     walletAddress: "0x2222333344445555666677778888999900001111" },
  { name: "David Kim",       email: "david@freelancex.io",   role: "client",     walletAddress: "0x3333444455556666777788889999000011112222" },
  { name: "Eva Patel",       email: "eva@freelancex.io",     role: "client",     walletAddress: "0x4444555566667777888899990000111122223333" },
  { name: "Frank Nguyen",    email: "frank@freelancex.io",   role: "client",     walletAddress: "0x5555666677778888999900001111222233334444" },
];

const freelancers = [
  { name: "Grace Lee",       email: "grace@freelancex.io",   role: "freelancer", walletAddress: "0xaaaa1111bbbb2222cccc3333dddd4444eeee5555" },
  { name: "Henry Park",      email: "henry@freelancex.io",   role: "freelancer", walletAddress: "0xbbbb2222cccc3333dddd4444eeee5555ffff6666" },
  { name: "Iris Kowalski",   email: "iris@freelancex.io",    role: "freelancer", walletAddress: "0xcccc3333dddd4444eeee5555ffff66660000aaaa" },
  { name: "James Okafor",    email: "james@freelancex.io",   role: "freelancer", walletAddress: "0xdddd4444eeee5555ffff660000aaaa1111bbbb22" },
  { name: "Kira Santos",     email: "kira@freelancex.io",    role: "freelancer", walletAddress: "0xeeee5555ffff66660000aaaa1111bbbb2222cccc" },
  { name: "Liam Zhang",      email: "liam@freelancex.io",    role: "freelancer", walletAddress: "0xffff66660000aaaa1111bbbb2222cccc3333dddd" },
];

// ── Sample Jobs ───────────────────────────────────────────────────────────────
const jobTemplates = [
  // Blockchain / Web3
  { title: "Build a DeFi Yield Aggregator",           description: "Develop a smart contract-based yield aggregator that auto-compounds rewards across multiple protocols. Must support ERC-20 tokens.",        budget: 2.5,  status: "open" },
  { title: "NFT Marketplace Smart Contract",          description: "Create a gas-optimised ERC-721 marketplace with auction support, royalties, and IPFS metadata storage.",                                   budget: 1.8,  status: "in_progress" },
  { title: "DAO Governance Module",                   description: "Implement a Compound-style governance module with proposal creation, voting, time-lock, and execution.",                                    budget: 3.0,  status: "open" },
  { title: "Cross-Chain Bridge Integration",          description: "Build a token bridge between Ethereum and Polygon using a lock-and-mint mechanism via the existing backend API.",                           budget: 4.2,  status: "completed" },
  { title: "Token Vesting Contract",                  description: "Solidity vesting contract with cliff and linear release schedule, admin revoke, and cliff acceleration clauses.",                          budget: 0.8,  status: "open" },
  { title: "Crypto Portfolio Tracker",                description: "React + Web3.js app that reads on-chain balances, transaction history, and PnL across multiple wallets.",                                  budget: 1.2,  status: "submitted" },
  { title: "Whitelist Presale System",                description: "Build a whitelist-based presale dApp with Merkle proof verification and a price oracle integration.",                                      budget: 0.9,  status: "open" },
  { title: "On-chain Lending Protocol",               description: "Minimal AAVE-like lending contract supporting collateral, borrow, repay, and liquidation logic with interest rate model.",                  budget: 5.0,  status: "open" },

  // Frontend / React
  { title: "React Dashboard for Analytics SaaS",     description: "Build a modern admin dashboard with charts, KPI cards, date pickers, and dark mode using React and Recharts.",                             budget: 0.6,  status: "open" },
  { title: "Next.js E-commerce Storefront",          description: "Full Next.js storefront with SSR product pages, cart, Stripe checkout, and Prisma/Postgres backend.",                                      budget: 1.1,  status: "in_progress" },
  { title: "Real-time Chat App UI",                  description: "React + Socket.IO chat interface with rooms, typing indicators, file uploads, and read receipts.",                                          budget: 0.7,  status: "open" },
  { title: "Figma to React Conversion",              description: "Convert 12 Figma screens into pixel-perfect responsive React components using Tailwind CSS.",                                               budget: 0.4,  status: "completed" },
  { title: "3D Product Viewer in Three.js",          description: "Integrate a Three.js 3D viewer into an existing React product page — support rotation, zoom, and multiple textures.",                       budget: 0.9,  status: "open" },

  // Backend / Node.js
  { title: "REST API for Freelance Marketplace",     description: "Build a Node.js/Express API with JWT auth, role-based access, pagination, and full CRUD for jobs and users.",                              budget: 0.8,  status: "submitted" },
  { title: "GraphQL API with Subscriptions",         description: "Design and implement a GraphQL API (Apollo Server) with real-time subscriptions for a messaging feature.",                                  budget: 1.0,  status: "open" },
  { title: "Microservices with Docker & RabbitMQ",   description: "Decompose a monolith into 4 microservices communicating via RabbitMQ, containerised with Docker Compose.",                                 budget: 2.0,  status: "open" },
  { title: "PDF Report Generation Service",          description: "Node.js service that generates styled PDF reports from JSON data using Puppeteer and a Handlebars template.",                              budget: 0.35, status: "completed" },
  { title: "OAuth2 Integration (Google + GitHub)",   description: "Add Passport.js Google and GitHub OAuth2 strategies to existing Express app with session management.",                                      budget: 0.3,  status: "open" },

  // AI / ML
  { title: "AI-Powered Code Review Bot",             description: "Build a GitHub Actions bot that uses OpenAI GPT-4 to review PRs, flag issues, and suggest improvements automatically.",                     budget: 1.5,  status: "open" },
  { title: "Image Classification Microservice",      description: "Wrap a pre-trained ResNet model into a FastAPI microservice with base64 image input and confidence score output.",                           budget: 0.7,  status: "in_progress" },
  { title: "LLM Chatbot with RAG Pipeline",          description: "Implement a Retrieval-Augmented Generation chatbot using LangChain, ChromaDB, and a custom knowledge base.",                               budget: 2.2,  status: "open" },
  { title: "Sentiment Analysis Dashboard",           description: "Python + Streamlit dashboard that scrapes Twitter/X, runs VADER sentiment, and displays trend charts in real time.",                        budget: 0.6,  status: "open" },

  // Mobile
  { title: "React Native Wallet App",                description: "Mobile crypto wallet (React Native) with seed phrase generation, ETH/ERC-20 sending, and QR code scanning.",                               budget: 1.8,  status: "open" },
  { title: "Flutter Fitness Tracker",                description: "Flutter app with workout logging, streak tracking, and BLE sensor integration for heart rate monitors.",                                    budget: 1.0,  status: "open" },
  { title: "Push Notifications System (FCM)",        description: "Integrate Firebase Cloud Messaging into an existing React Native app with topic subscriptions and deep links.",                              budget: 0.4,  status: "completed" },

  // DevOps / Cloud
  { title: "CI/CD Pipeline on GitHub Actions",       description: "Set up end-to-end CI/CD pipeline: lint, test, Docker build, push to ECR, and deploy to ECS Fargate.",                                      budget: 0.5,  status: "open" },
  { title: "Kubernetes Cluster Setup (EKS)",         description: "Provision an EKS cluster with Helm charts, HPA, ingress controller, cert-manager, and monitoring stack.",                                  budget: 1.5,  status: "open" },
  { title: "Terraform Infrastructure as Code",       description: "Write Terraform modules for a multi-region AWS setup with VPC, RDS, ElastiCache, ALB, and WAF.",                                           budget: 1.2,  status: "in_progress" },

  // Design / QA
  { title: "UI/UX Redesign for Web3 App",            description: "Redesign the interface of an existing DeFi app — deliver Figma prototypes, design system, and handoff documentation.",                      budget: 0.8,  status: "open" },
  { title: "End-to-End Testing with Cypress",        description: "Write a comprehensive Cypress test suite covering auth, job flow, and escrow interactions in the FreelanceX app.",                          budget: 0.45, status: "open" },
  { title: "Security Audit for Smart Contracts",     description: "Perform a manual and automated (Slither/Mythril) security audit of the escrow and governance contracts, deliver report.",                   budget: 3.5,  status: "open" },

  // Misc
  { title: "Technical Documentation Writing",        description: "Write user-facing docs, developer API reference, and architecture diagrams for a DeFi protocol using Docusaurus.",                         budget: 0.4,  status: "completed" },
  { title: "Web Scraper for Job Boards",             description: "Python Scrapy spider that aggregates Web3 jobs from 10+ job boards, deduplicates, and stores in PostgreSQL.",                              budget: 0.5,  status: "open" },
  { title: "Discord Bot for DAO Notifications",      description: "Discord.js bot that listens to on-chain events and posts governance proposals, votes, and treasury updates to Discord.",                    budget: 0.6,  status: "open" },
  { title: "Decentralised Voting App",               description: "End-to-end dApp: Solidity voting contract + React frontend. Supports snapshot voting and on-chain tallying.",                               budget: 1.3,  status: "submitted" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clean existing seed data (keep manually registered users)
  await User.deleteMany({ email: { $regex: /@freelancex\.io$/ } });
  await Job.deleteMany({});
  console.log("🗑  Cleared old seed data");

  const password = await bcrypt.hash("password123", 10);

  // Insert clients
  const clientDocs = await User.insertMany(
    clients.map(u => ({ ...u, password }))
  );
  console.log(`👤 Created ${clientDocs.length} clients`);

  // Insert freelancers
  const freelancerDocs = await User.insertMany(
    freelancers.map(u => ({ ...u, password }))
  );
  console.log(`👤 Created ${freelancerDocs.length} freelancers`);

  // Insert jobs — round-robin across clients
  const jobs = jobTemplates.map((job, i) => ({
    ...job,
    client: clientDocs[i % clientDocs.length]._id,
    freelancer: job.status !== "open"
      ? freelancerDocs[i % freelancerDocs.length]._id
      : null,
    freelancerAddress: job.status !== "open"
      ? freelancerDocs[i % freelancerDocs.length].walletAddress
      : null,
    transactionHash: ["submitted","completed"].includes(job.status)
      ? `0x${Math.random().toString(16).slice(2).padEnd(64,"0")}`
      : null,
    blockchainJobId: ["submitted","completed"].includes(job.status)
      ? i
      : null,
  }));

  const jobDocs = await Job.insertMany(jobs);
  console.log(`💼 Created ${jobDocs.length} jobs`);

  console.log("\n🎉 Seed complete! Login credentials for all seed users:");
  console.log("   Password: password123");
  console.log("\nClients:");
  clients.forEach(c => console.log(`  ${c.name.padEnd(18)} — ${c.email}`));
  console.log("\nFreelancers:");
  freelancers.forEach(f => console.log(`  ${f.name.padEnd(18)} — ${f.email}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
