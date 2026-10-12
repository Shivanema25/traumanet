import { NextRequest, NextResponse } from "next/server";
import { parseIdentityAndInsurance } from "@/services/docai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentBase64 } = body;

    const data = await parseIdentityAndInsurance(documentBase64 || "");
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API /api/docai/identity error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse document" }, { status: 500 });
  }
}
