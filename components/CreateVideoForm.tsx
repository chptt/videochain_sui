"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallets, useWalletConnection, useDAppKit } from "@mysten/dapp-kit-react";
import { dAppKit } from "./SuiProviders";
import { Transaction } from "@mysten/sui/transactions";
import { v4 as uuidv4 } from "uuid";

const DURATION_OPTIONS = [
  { label: "1 Hour", value: 1 },
  { label: "24 Hours", value: 24 },
  { label: "7 Days", value: 168 },
  { label: "30 Days", value: 720 },
];

interface CreatedVideo {
  videoId: string;
  cid: string;
  title: string;
}

export function CreateVideoForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceSui: "1",
    durationHours: "24",
  });
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [created, setCreated] = useState<CreatedVideo | null>(null);
  const [ipfsVideo, setIpfsVideo] = useState<CreatedVideo | null>(null);

  const wallets = useWallets({ dAppKit });
  const connection = useWalletConnection({ dAppKit: dAppKit as any });
  const kit = useDAppKit(dAppKit);

  const isConnected = connection.isConnected;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      let wallet = wallets[0];
      if (!wallet) {
        for (let i = 0; i < 4; i++) {
          await new Promise((r) => setTimeout(r, 500));
          const fresh = kit.stores.$wallets.get();
          wallet = fresh[0];
          if (wallet) break;
        }
      }

      if (!wallet) {
        alert("No wallet found");
        return;
      }

      await kit.connectWallet({ wallet });
      alert("Wallet connected!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("reject")) {
        alert("Failed to connect wallet: " + msg);
      }
    } finally {
      setConnecting(false);
    }
  };

  const createCampaignOnChain = async (videoId: string, priceSui: number, durationHours: number) => {
    setCreatingCampaign(true);
    try {
      const priceMist = BigInt(Math.floor(priceSui * 1_000_000_000));
      const tx = new Transaction();

      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID || ""}::private_tube::create_campaign`,
        arguments: [
          tx.pure.string(videoId),
          tx.pure.u64(priceMist),
          tx.pure.u64(BigInt(durationHours)),
        ],
      });

      const result = await kit.signAndExecuteTransaction({ transaction: tx });
      const digest =
        result.$kind === "Transaction"
          ? result.Transaction.digest
          : (result as unknown as { digest: string }).digest;

      alert("Campaign created! Digest: " + digest);
      return digest;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject")) {
        alert("Campaign creation cancelled.");
      } else {
        console.error("[CreateVideoForm] create campaign error:", err);
        alert("Failed to create campaign on-chain: " + msg);
      }
      throw err;
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pinata/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create video");
        return;
      }
      setIpfsVideo(data.video);
    } catch (err) {
      alert("Error creating video: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!ipfsVideo) return;
    try {
      await createCampaignOnChain(ipfsVideo.videoId, parseFloat(form.priceSui), parseFloat(form.durationHours));
      setCreated(ipfsVideo);
      setIpfsVideo(null);
    } catch {}
  };

  if (ipfsVideo) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-3xl mx-auto">
          📦
        </div>
        <div>
          <h2 className="text-2xl font-bold">Video Uploaded to IPFS!</h2>
          <p className="text-muted-foreground mt-2">Now create the campaign on-chain!</p>
        </div>
        <div className="space-y-3 text-left">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Title</p>
            <p className="font-medium">{ipfsVideo.title}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
            <code className="mono text-sm block break-all">{ipfsVideo.cid}</code>
          </div>
        </div>
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn btn-primary btn-full"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <button
            onClick={handleCreateCampaign}
            disabled={creatingCampaign}
            className="btn btn-primary btn-full"
          >
            {creatingCampaign ? "Creating Campaign..." : "Create Campaign On-Chain"}
          </button>
        )}
      </div>
    );
  }

  if (created) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-3xl mx-auto">
          ✅
        </div>
        <div>
          <h2 className="text-2xl font-bold">Campaign Created!</h2>
          <p className="text-muted-foreground mt-2">Video uploaded to IPFS and campaign created on-chain!</p>
        </div>
        <div className="space-y-3 text-left">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Title</p>
            <p className="font-medium">{created.title}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Video ID</p>
            <code className="mono text-sm block">{created.videoId}</code>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
            <code className="mono text-sm block break-all">{created.cid}</code>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCreated(null); setForm({ title: "", description: "", priceSui: "1", durationHours: "24" }); }}
            className="btn btn-outline flex-1"
          >
            Create Another
          </button>
          <button
            onClick={() => router.push("/")}
            className="btn btn-secondary flex-1"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label" htmlFor="title">Video Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your campaign"
            rows={3}
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="priceSui">Price (SUI)</label>
            <input
              id="priceSui"
              name="priceSui"
              type="number"
              value={form.priceSui}
              onChange={handleChange}
              min="0.001"
              step="0.001"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="durationHours">Access Duration</label>
            <select
              id="durationHours"
              name="durationHours"
              value={form.durationHours}
              onChange={handleChange}
              className="input"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
          {loading ? (
            <div className="spinner spinner-sm" />
          ) : (
            "Upload to IPFS"
          )}
        </button>
      </form>
    </div>
  );
}
