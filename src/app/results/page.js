"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export default function ResultsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

  async function loadProposals() {
    setLoading(true);
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
    setLoading(false);
  }

  useEffect(() => {
    loadProposals();
  }, []);

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center" style={{ backgroundColor: "var(--cream)" }}>
      <div className="w-full max-w-xl">
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
          On-chain governance &middot; Public record
        </p>
        <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Results
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--ink)", opacity: 0.6 }}>
          Read directly from the blockchain. No wallet needed to view.
        </p>

        {loading && (
          <p className="text-sm" style={{ color: "var(--ink)", opacity: 0.5 }}>Loading proposals…</p>
        )}

        <div className="space-y-4">
          {!loading && proposals.length === 0 && (
            <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px dashed var(--line)" }}>
              <p style={{ color: "var(--ink)", opacity: 0.5 }}>No proposals have been created yet.</p>
            </div>
          )}

          {proposals.map((p) => {
            const total = p.yesVotes + p.noVotes;
            const yesPct = total > 0 ? (p.yesVotes / total) * 100 : 0;
            const noPct = total > 0 ? (p.noVotes / total) * 100 : 0;
            const winner = p.yesVotes === p.noVotes ? "Tied" : p.yesVotes > p.noVotes ? "Yes is ahead" : "No is ahead";

            return (
              <div key={p.id} className="rounded-xl p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--line)" }}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-display text-lg font-medium" style={{ color: "var(--ink)" }}>{p.description}</p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-3"
                    style={{
                      backgroundColor: p.isOpen ? "rgba(107,143,113,0.12)" : "rgba(43,43,51,0.06)",
                      color: p.isOpen ? "var(--yes)" : "var(--ink)",
                    }}
                  >
                    {p.isOpen ? "Voting open" : "Final"}
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--ink)", opacity: 0.5 }}>Proposal #{p.id} &middot; {total} total vote{total !== 1 ? "s" : ""}</p>

                <div className="space-y-2 mb-3">
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

                {total > 0 && (
                  <p className="text-xs font-medium" style={{ color: "var(--ink)", opacity: 0.6 }}>{winner}</p>
                )}
              </div>
            );
          })}
        </div>

        <a href="/" className="block text-center mt-10 text-sm underline" style={{ color: "var(--accent)" }}>
          ← Back to voting
        </a>
      </div>
    </main>
  );
}
