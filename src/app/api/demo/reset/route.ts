import { NextResponse } from "next/server";
import { resetDemoState } from "@/lib/firestore";

export async function POST() {
  try {
    resetDemoState();
    return NextResponse.json({ success: true, message: "Nagpur Emergency Network demo state reset successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to reset demo state" }, { status: 500 });
  }
}
