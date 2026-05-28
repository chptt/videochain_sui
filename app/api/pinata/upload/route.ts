import { NextResponse } from "next/server";
import { pinJSONToPinata } from "@/lib/pinata";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const videoId = uuidv4();
    const data = {
      videoId,
      title,
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    const result = await pinJSONToPinata(data, `video-${videoId}`);

    return NextResponse.json({
      success: true,
      video: {
        videoId,
        cid: result.IpfsHash,
        title,
      },
    });
  } catch (error) {
    console.error("[Pinata Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}
