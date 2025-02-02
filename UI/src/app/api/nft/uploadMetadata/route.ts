import { NextResponse } from "next/server";
import { addJSONToIPFS } from "@/common/ipfs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await addJSONToIPFS(body);

    return NextResponse.json({ cid: result?.cid.toString() }, { status: 200 });
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return NextResponse.json(
      { error: "Failed to upload metadata" },
      { status: 500 }
    );
  }
}
