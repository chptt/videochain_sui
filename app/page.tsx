import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Video Sui Fresh</h1>
        <div className="flex gap-4">
          <Link href="/create" className="btn btn-primary">
            Create Campaign
          </Link>
          <Link href="/marketplace" className="btn btn-outline">
            Marketplace
          </Link>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Decentralized Video Platform on Sui
          </h2>
          <p className="text-muted-foreground mb-8">
            Launch time-limited campaigns, accept SUI tokens, and manage your
            content with smart contracts
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/create" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/marketplace" className="btn btn-outline btn-lg">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
