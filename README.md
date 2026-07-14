# On-Chain Voting DAO

A simple proposal and voting system built on Ethereum (Sepolia testnet). An admin creates proposals, registered voters vote yes/no, and results are public and impossible to quietly tamper with no wallet needed to check the results.

**Live app:** https://safe-voting-9oaa.vercel.app
**Contract (Sepolia):**
## Why I built this

After building an on-chain certificate registry (see my other repo), I wanted a second project that used a different part of Solidity — something with actual logic and computation instead of just storing and looking up data. Voting/DAO-style contracts are a pretty standard pattern in the space (Uniswap, MakerDAO, and a bunch of others use some version of this), so it felt like a good way to practice access control on two different roles at once (admin vs. registered voter), array-based storage instead of mappings, and nested mappings for tracking who's voted on what.

It's not meant to replace Google Forms for deciding where to order lunch from ,for something low-stakes like that, a form is genuinely fine. This is more about the pattern you'd actually want when the people voting don't fully trust whoever's running the vote, and want to verify the count themselves instead of taking someone's word for it.

## How it works

- An **admin** (whoever deployed the contract) creates proposals and registers which wallet addresses are allowed to vote.
- **Registered voters** connect their wallet and vote yes or no, once per proposal. Trying to vote twice, vote without being registered, or vote after the admin has closed a proposal all get rejected by the contract itself, not just the frontend.
- **Anyone** can check the live results on the `/results` page — no wallet, no login. It just reads directly from the contract.

Three pages:
- `/` — vote on open proposals (needs a wallet to actually vote)
- `/admin` — register voters, create and close proposals (only works if you're the actual admin address; the contract rejects anyone else)
- `/results` — public read-only results, same data anyone could also check on Etherscan

## Tech stack

Solidity + Foundry for the contract, tested with 5 passing tests (vote counting, blocking double votes, blocking non-registered voters, blocking non-admins from creating proposals, blocking votes on closed proposals). Deployed and verified on Sepolia. Frontend is Next.js + Tailwind, using ethers.js to talk to the contract ,reads go through a public Alchemy RPC endpoint (no wallet needed), writes go through MetaMask.

## An honest limitation — gas fees per vote

This is worth being upfront about: **every vote costs gas**, because voting changes data stored on the blockchain, and any state change requires a real transaction. On Sepolia this is free (fake test ETH), but on a mainnet deployment, every single voter would need to already hold crypto and pay a small fee just to cast a vote. For a real election with hundreds of voters who don't all have crypto wallets, that's a genuine adoption barrier, not a minor detail.

There are known ways around this  gasless "meta-transactions" where voters sign a message for free and a relayer (paid by the organization, not the voter) submits the actual transaction, or deploying to a cheaper Layer 2 network instead of Ethereum mainnet directly. I didn't build either of those here, mostly because it would have doubled the scope of this project, but it's the first thing I'd tackle if I took this further.

## Other things worth knowing

- Proposal creation is admin-only, which means "who gets to decide what's worth voting on" is still centralized, even though the actual vote-counting isn't. A more decentralized version would let any registered voter propose something, maybe with a small deposit to prevent spam.
- The frontend fetches proposals by looping through the array one index at a time until it hits one that doesn't exist. This is fine at the scale of a handful of proposals, but wouldn't hold up well with hundreds — a production version would use events or pagination instead.
- Voting weight is currently 1 person = 1 vote. The contract doesn't support weighted voting (e.g., based on tokens held or seniority), though that'd be a reasonable next feature.

## Running locally

```bash
# contract
cd voting-dao
forge build
forge test

# frontend
cd voting-frontend
npm install
npm run dev
```

You'll need a `.env.local` with:
```
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_alchemy_url
```

## Author

Built by Ritika, EE undergrad at IIT Mandi, as a second project after the certificate registry — mainly to practice a different kind of on-chain logic (voting/tallying) instead of just storage and access control.
