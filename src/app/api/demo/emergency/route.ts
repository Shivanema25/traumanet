import { NextRequest, NextResponse } from "next/server";
import { getEmergencySession, updateEmergencySession, createEmergencySession } from "@/lib/firestore";
import { MOCK_ACTIVE_SESSION } from "@/data/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || MOCK_ACTIVE_SESSION.id;

  let session = await getEmergencySession(id);
  if (!session) {
    session = await createEmergencySession(MOCK_ACTIVE_SESSION);
  }
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || MOCK_ACTIVE_SESSION.id;

    if (body.stage) {
      // Demo stage scenario injector
      let updates: any = {};
      if (body.stage === 1) {
        updates = {
          status: "ROUTING",
          softLockVerified: false,
          targetHospitalId: undefined,
          targetHospitalName: undefined,
          etaMinutes: 12,
        };
      } else if (body.stage === 2) {
        updates = {
          status: "SOFT_LOCKED",
          targetHospitalId: "hosp-aiims",
          targetHospitalName: "AIIMS Nagpur (MIHAN Hub)",
          softLockVerified: true,
          softLockExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          etaMinutes: 8,
        };
      } else if (body.stage === 3) {
        updates = {
          status: "EN_ROUTE",
          etaMinutes: 4,
          liveCoordinates: { lat: 21.0500, lng: 79.0350, speedKmh: 72 },
        };
      } else if (body.stage === 4) {
        updates = {
          status: "ARRIVED",
          etaMinutes: 0,
          liveCoordinates: { lat: 21.0396, lng: 79.0278, speedKmh: 0 },
        };
      } else if (body.stage === 5) {
        updates = {
          status: "RESOLVED",
        };
      }
      await updateEmergencySession(id, updates);
      const updated = await getEmergencySession(id);
      return NextResponse.json({ success: true, session: updated });
    }

    await updateEmergencySession(id, body);
    const updated = await getEmergencySession(id);
    return NextResponse.json({ success: true, session: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update emergency session" }, { status: 500 });
  }
}
