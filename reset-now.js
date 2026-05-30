require('dotenv').config();

const PINATA_API_URL = "https://api.pinata.cloud";
const REGISTRY_NAME = "private-tube-registry-latest";

async function resetRegistry() {
  console.log("🔄 Resetting all data...");
  
  const emptyRegistry = {
    videos: [],
    updatedAt: new Date().toISOString()
  };

  const body = {
    pinataContent: emptyRegistry,
    pinataMetadata: { name: REGISTRY_NAME },
    pinataOptions: { cidVersion: 1 }
  };

  const res = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PINATA_JWT}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Reset failed:", err);
    return;
  }

  const result = await res.json();
  console.log("✅ ALL DATA RESET SUCCESSFULLY!");
  console.log("New empty registry CID:", result.IpfsHash);
  console.log("\nYour site now has fresh data!");
}

resetRegistry();
