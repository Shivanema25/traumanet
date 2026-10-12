import { NextRequest, NextResponse } from "next/server";
import { auditHospitalBill } from "@/services/gemini";
import { createBillAudit } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalName, items } = body;

    const audit = await auditHospitalBill(hospitalName || "Partner Hospital", items || []);
    // Save to firestore/memory
    const saved = await createBillAudit(audit);

    return NextResponse.json(saved);
  } catch (err: any) {
    console.error("API /api/ai/bill-audit error:", err);
    return NextResponse.json({ error: err.message || "Failed to audit bill" }, { status: 500 });
  }
}
