import 'dotenv/config';
import { uploadJsonToPinata } from '../lib/pinata.js';

const REGISTRY_NAME = "private-tube-registry-latest";

async function resetData() {
  console.log("⚠️  WARNING: This will delete ALL video data from the registry!");
  console.log("Creating empty registry...");

  const emptyRegistry = {
    videos: [],
    updatedAt: new Date().toISOString()
  };

  try {
    const cid = await uploadJsonToPinata(emptyRegistry, REGISTRY_NAME);
    console.log("✅ Success! Data reset complete!");
    console.log("New registry CID:", cid);
  } catch (err) {
    console.error("❌ Reset failed:", err);
  }
}

resetData();
