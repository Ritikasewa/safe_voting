"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export default function AdminPage() {
  const [wallet, setWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [voterAddress, setVoterAddress] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [proposalText, setProposalText] = useState("");
  const [proposalStatus, setProposalStatus] = useState("");
  const [proposalLoading, setProposalLoading] = useState(false);

  const [closeId, setCloseId] = useState("");
  const [closeStatus, setCloseStatus] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      setRegisterStatus("MetaMask not found.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const adminAddress = await contract.admin();
    setIsAdmin(adminAddress.toLowerCase() === accounts[0].toLowerCase());
  }

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  async function handleRegisterVoter() {
    setRegisterLoading(true);
    setRegisterStatus("");
    try {
      const contract = await getContract();
      const tx = await contract.registerVoter(voterAddress);
      setRegisterStatus("Transaction submitted, waiting for confirmation…");
      await tx.wait();
      setRegisterStatus("✅ Voter registered successfully!");
      setVoterAddress("");
    } catch (err) {
      setRegisterStatus("❌ " + (err.reason || err.message || "Something went wrong."));
    }
    setRegisterLoading(false);
  }

  async function handleCreateProposal() {
    setProposalLoading(true);
    setProposalStatus("");
    try {
      const contract = await getContract();
      const tx = await contract.createProposal(proposalText);
      setProposalStatus("Transaction submitted, waiting for confirmation…");
      await tx.wait();
      setProposalStatus("✅ Proposal created successfully!");
      setProposalText("");
    } catch (err) {
      setProposalStatus("❌ " + (err.reason || err.message || "Something went wrong."));
    }
    setProposalLoading(false);
  }

  async function handleCloseProposal() {
    setCloseLoading(true);
    setCloseStatus("");
    try {
      const contract = await getContract();
      const tx = await contract.closeProposal(closeId);
      setCloseStatus("Transaction submitted, waiting for confirmation…");
      await tx.wait();
      setCloseStatus("✅ Proposal closed successfully!");
      setCloseId("");
    } catch (err) {
      setCloseStatus("❌ " + (err.reason || err.message || "Something went wrong."));
    }
    setCloseLoading(false);
  }

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center" style={{ backgroundColor: "var(--cream)" }}>
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              On-chain governance
            </p>
            <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--ink)" }}>
              Admin panel
            </h1>
          </div>

          {wallet && (
            <p
              className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
            >
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </p>
          )}
        </div>

        {!wallet ? (
          <button
            onClick={connectWallet}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Connect Wallet
          </button>
        ) : !isAdmin ? (
          <p className="text-sm" style={{ color: "var(--ink)", opacity: 0.6 }}>
            Connected wallet is not the admin. Admin actions are unavailable.
          </p>
        ) : (
          <div className="space-y-6">

            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}>
              <p className="font-display text-lg font-medium mb-3" style={{ color: "var(--ink)" }}>Register a voter</p>
              <div className="flex gap-2">
                <input
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 font-mono text-sm border rounded-lg px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                />
                <button
                  onClick={handleRegisterVoter}
                  disabled={registerLoading || !voterAddress}
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {registerLoading ? "Registering…" : "Register"}
                </button>
              </div>
              {registerStatus && <p className="text-xs mt-2" style={{ color: "var(--ink)", opacity: 0.7 }}>{registerStatus}</p>}
            </div>

            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}>
              <p className="font-display text-lg font-medium mb-3" style={{ color: "var(--ink)" }}>Create a proposal</p>
              <div className="flex gap-2">
                <input
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="e.g. Should we buy a 3D printer?"
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                />
                <button
                  onClick={handleCreateProposal}
                  disabled={proposalLoading || !proposalText}
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {proposalLoading ? "Creating…" : "Create"}
                </button>
              </div>
              {proposalStatus && <p className="text-xs mt-2" style={{ color: "var(--ink)", opacity: 0.7 }}>{proposalStatus}</p>}
            </div>

            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}>
              <p className="font-display text-lg font-medium mb-3" style={{ color: "var(--ink)" }}>Close a proposal</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={closeId}
                  onChange={(e) => setCloseId(e.target.value)}
                  placeholder="Proposal ID"
                  className="flex-1 font-mono text-sm border rounded-lg px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                />
                <button
                  onClick={handleCloseProposal}
                  disabled={closeLoading || closeId === ""}
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: "var(--no)" }}
                >
                  {closeLoading ? "Closing…" : "Close"}
                </button>
              </div>
              {closeStatus && <p className="text-xs mt-2" style={{ color: "var(--ink)", opacity: 0.7 }}>{closeStatus}</p>}
            </div>

          </div>
        )}

        <a href="/" className="block text-center mt-10 text-sm underline" style={{ color: "var(--accent)" }}>
          ← Back to proposals
        </a>
      </div>
    </main>
  );
}