export async function pinJSONToPinata(json: any, name?: string) {
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) throw new Error("PINATA_JWT not set");

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: name ? { name } : undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata pin failed: ${res.status} - ${text}`);
  }

  return res.json();
}

export async function fetchFromPinata(cid: string) {
  const gateway = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
  const res = await fetch(`${gateway}/ipfs/${cid}`);
  if (!res.ok) throw new Error(`Failed to fetch ${cid} from Pinata`);
  return res.json();
}
