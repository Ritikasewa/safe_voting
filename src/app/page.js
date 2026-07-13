"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export default function VotePage() {
  const [wallet, setWallet] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

  async function loadProposals() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const results = [];
    let i = 0;
    while (true) {
      try {
        const p = await contract.proposals(i);
        results.push({
          id: i,
          description: p[0],
          yesVotes: Number(p[1]),
          noVotes: Number(p[2]),
          isOpen: p[3],
        });
        i++;
      } catch {
        break;
      }
    }
    setProposals(results);
  }

  useEffect(() => {
    loadProposals();
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("MetaMask not found.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
  }

  async function castVote(proposalId, voteYes) {
    setLoading(true);
    setStatus("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.vote(proposalId, voteYes);
      setStatus("Transaction submitted, waiting for confirmation…");
      await tx.wait();
      setStatus("✅ Vote cast successfully!");
      loadProposals();
    } catch (err) {
      setStatus("❌ " + (err.reason || err.message || "Something went wrong."));
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center" style={{ backgroundColor: "var(--cream)" }}>
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              On-chain governance
            </p>
            <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--ink)" }}>
              Proposals
            </h1>
          </div>
          {!wallet ? (
            <button
              onClick={connectWallet}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Connect Wallet
            </button>
          ) : (
            <p
              className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
            >
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </p>
          )}
        </div>

        {status && (
          <p
            className="text-sm mb-6 px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}
          >
            {status}
          </p>
        )}

        <div className="space-y-4">
          {proposals.length === 0 && (
            <div
              className="text-center py-16 rounded-xl"
              style={{ backgroundColor: "var(--card)", border: "1px dashed var(--line)" }}
            >
              <p style={{ color: "var(--ink)", opacity: 0.5 }}>
                No proposals yet. Check back once one is opened for voting.
              </p>
            </div>
          )}

          {proposals.map((p) => {
            const total = p.yesVotes + p.noVotes;
            const yesPct = total > 0 ? (p.yesVotes / total) * 100 : 0;
            const noPct = total > 0 ? (p.noVotes / total) * 100 : 0;

            return (
              <div
                key={p.id}
                className="rounded-xl p-6"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-display text-lg font-medium" style={{ color: "var(--ink)" }}>
                    {p.description}
                  </p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-3"
                    style={{
                      backgroundColor: p.isOpen ? "rgba(107,143,113,0.12)" : "rgba(43,43,51,0.06)",
                      color: p.isOpen ? "var(--yes)" : "var(--ink)",
                    }}
                  >
                    {p.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--ink)", opacity: 0.5 }}>
                  Proposal #{p.id} &middot; {total} total vote{total !== 1 ? "s" : ""}
                </p>

                <div className="space-y-2 mb-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink)", opacity: 0.7 }}>
                      <span>Yes</span>
                      <span>{p.yesVotes}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--line)" }}>
                      <div className="h-full rounded-full" style={{ width: `${yesPct}%`, backgroundColor: "var(--yes)" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink)", opacity: 0.7 }}>
                      <span>No</span>
                      <span>{p.noVotes}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--line)" }}>
                      <div className="h-full rounded-full" style={{ width: `${noPct}%`, backgroundColor: "var(--no)" }} />
                    </div>
                  </div>
                </div>

                {p.isOpen && wallet && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => castVote(p.id, true)}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: "var(--yes)" }}
                    >
                      Vote yes
                    </button>
                    <button
                      onClick={() => castVote(p.id, false)}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: "var(--no)" }}
                    >
                      Vote no
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-6 mt-10 text-sm">
          <a href="/admin" className="underline" style={{ color: "var(--accent)" }}>Admin panel →</a>
          <a href="/results" className="underline" style={{ color: "var(--accent)" }}>View results →</a>
        </div>
      </div>
    </main>
  );
}
