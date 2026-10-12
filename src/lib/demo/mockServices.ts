// TraumaNet - Deterministic Offline Fallback Services
// Used when Google Cloud AI credentials are mock, offline, or experiencing latency.

import { Vitals, SBARReport, BillAudit, HospitalRecommendation, FamilyPreRegistration } from "@/types";
import { MOCK_HOSPITALS } from "@/data/mockData";

export function generateMockSBAR(vitals: Vitals, notes?: string): SBARReport {
  const sys = vitals.bloodPressureSystolic || 120;
  const pulse = vitals.pulseBpm || 80;
  const spo2 = vitals.spO2Percent || 98;
  const gcs = vitals.gcsScore || 15;

  let score = 3.5;
  if (sys < 90) score += 2.5;
  if (pulse > 115) score += 1.5;
  if (spo2 < 90) score += 2.0;
  if (gcs < 13) score += 1.5;

  score = Math.min(10.0, Math.round(score * 10) / 10);

  const notesClean = notes && notes.trim().length > 0 
    ? notes 
    : "32yo male, high-speed motorcycle impact on Wardha Road, blunt chest trauma";

  return {
    situation: `Acute trauma handover: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg BP, ${vitals.pulseBpm} BPM pulse, ${vitals.spO2Percent}% SpO2. Field notes: "${notesClean}".`,
    background: "High-energy blunt trauma with rapid field triage. Immediate cervical collar placed, 15L O2 via NRB mask initiated.",
    assessment: `Trauma Score: ${score}/10 (${score >= 8 ? 'CRITICAL RESUSCITATION' : score >= 5 ? 'EMERGENT' : 'STABLE'}). Risk of tension pneumothorax or internal hemorrhage.`,
    recommendation: "Hold Level-1 Resuscitation Bay. Prepare 2 units O-Negative blood, chest tube tray (32 Fr), and notify on-call trauma surgeon.",
    traumaScore: score,
    generatedAt: new Date().toISOString(),
    suspectedInjuries: ["Thoracic blunt injury", "Hemopneumothorax", "Cervical hyperextension", "Extremity lacerations"],
    recommendedSpecialties: ["Trauma Surgery", "Critical Care", "Cardiothoracic", "Orthopedics"],
  };
}

export function generateMockBillAudit(hospitalName: string): BillAudit {
  return {
    id: `audit-cghs-${Date.now().toString().slice(-4)}`,
    hospitalId: "hosp-alexis",
    hospitalName: hospitalName || "Alexis / Max Super Speciality Hospital",
    patientName: "Sunil Deshmukh",
    date: new Date().toISOString().split("T")[0],
    totalCharged: 195000,
    cghsAllowed: 135000,
    disputedSavings: 60000,
    status: "FLAGGED",
    geminiAnalysisSummary: "AI audit detected 3 rate anomalies exceeding Maharashtra CGHS Package Caps (ICU Bed surcharge +118%, unbundled surgical tray fees, duplicated oxygen therapy lines). Dispute letter generated for cashless approval under Section 14.",
    items: [
      {
        code: "CGHS-ICU-01",
        description: "ICU Multi-Parametric Bed (Per 24h)",
        chargedAmount: 18500,
        cghsCapAmount: 8500,
        isOvercharged: true,
        variancePercentage: 117.6,
        notes: "Exceeds standard CGHS ceiling by ₹10,000/day without tier-3 authorization",
      },
      {
        code: "CGHS-VENT-02",
        description: "Mechanical Invasive Ventilation (Daily)",
        chargedAmount: 12000,
        cghsCapAmount: 4800,
        isOvercharged: true,
        variancePercentage: 150.0,
        notes: "Unbundled tariff: ventilator maintenance already included in NABH base",
      },
      {
        code: "CGHS-CT-09",
        description: "Contrast Enhanced Polytrauma CT (Torso)",
        chargedAmount: 14000,
        cghsCapAmount: 9200,
        isOvercharged: true,
        variancePercentage: 52.1,
        notes: "Charged above standard empanelled rates",
      },
      {
        code: "CGHS-PHARM-01",
        description: "Tranexamic Acid 1g IV + Ringers Lactate",
        chargedAmount: 1850,
        cghsCapAmount: 1850,
        isOvercharged: false,
        variancePercentage: 0,
      },
    ],
  };
}

export function calculateMockHospitalRankings(lat: number, lng: number): HospitalRecommendation[] {
  // Compute distance from coordinates to each hospital
  return MOCK_HOSPITALS.map((h) => {
    const dLat = (h.location.lat - lat) * 111;
    const dLng = (h.location.lng - lng) * 105;
    const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
    const eta = Math.max(3, Math.round(dist * 2.2));
    const match = Math.min(99, Math.round(h.dependabilityScore * 0.7 + (h.availableIcuBeds > 5 ? 25 : 15)));

    return {
      hospital: h,
      distanceKm: dist,
      etaMinutes: eta,
      matchScore: match,
      reason: h.availableIcuBeds >= 10 
        ? `${h.availableIcuBeds} open ICU beds available with verified trauma team on standby`
        : `Level-1 capabilities within ${eta} mins transit corridor`,
      isSoftLockable: h.availableIcuBeds > 0,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function generateMockDocumentData(): FamilyPreRegistration {
  return {
    patientName: "Rahul Sanjay Sharma",
    age: 32,
    gender: "MALE",
    emergencyContactName: "Pooja Sharma",
    emergencyContactPhone: "+91 98230 45678",
    abhaId: "14-8849-2041-9923",
    insuranceProvider: "Star Health Premier Care",
    policyNumber: "SH-NAG-2024-8890",
    preAuthAmount: 50000,
    status: "VERIFIED",
    preAuthStatus: "PRE_AUTHORIZED",
  };
}
