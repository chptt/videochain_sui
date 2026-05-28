import Link from "next/link";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Video Sui Fresh
        </Link>
        <Link href="/create" className="btn btn-primary">
          Create Campaign
        </Link>
      </nav>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8">Marketplace</h2>
        <div className="text-muted-foreground">
          Campaigns will appear here once created on-chain
        </div>
      </main>
    </div>
  );
}
