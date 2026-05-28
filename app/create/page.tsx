import { CreateVideoForm } from "@/components/CreateVideoForm";
import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Video Sui Fresh
        </Link>
        <Link href="/marketplace" className="btn btn-outline">
          Marketplace
        </Link>
      </nav>
      <main className="flex-1">
        <CreateVideoForm />
      </main>
    </div>
  );
}
