import { NextRequest, NextResponse } from "next/server";
import { rankHospitalsAndRoute } from "@/services/maps";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, traumaScore } = body;

    const coords = origin || { lat: 21.0850, lng: 79.0600 }; // Default Nagpur Wardha Road corridor
    const score = traumaScore || 7.5;

    const ranked = await rankHospitalsAndRoute(coords, score);
    return NextResponse.json({ rankings: ranked });
  } catch (err: any) {
    console.error("API /api/maps/rank error:", err);
    return NextResponse.json({ error: err.message || "Failed to calculate hospital rankings" }, { status: 500 });
  }
}
