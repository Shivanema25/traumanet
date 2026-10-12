// Google Cloud Gemini 1.5 Clinical Decision Support Service
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Vitals, SBARReport, BillAudit } from "@/types";
import { generateMockSBAR, generateMockBillAudit } from "@/lib/demo/mockServices";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function generateSBARHandover(
  vitals: Vitals,
  notes?: string,
  imageBase64?: string
): Promise<SBARReport> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("Mock")) {
    return generateMockSBAR(vitals, notes);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
      systemInstruction: `You are an emergency medical logistics and clinical decision support system for India TraumaNet.
Analyze patient vitals, regional notes (in English, Hindi, Marathi, or Hinglish), and optional wound photo.
Translate regional notes to clinical English.
Return strictly JSON matching this structure:
{
  "situation": "Concise situation string",
  "background": "Mechanisms and field interventions",
  "assessment": "Clinical assessment with vital instability",
  "recommendation": "ER trauma bay preparation steps",
  "traumaScore": 8.4, // number between 1.0 and 10.0
  "suspectedInjuries": ["Injury 1", "Injury 2"],
  "recommendedSpecialties": ["Specialty 1", "Specialty 2"]
}
This report serves as decision support for registered medical practitioners.`,
    });

    const parts: any[] = [
      {
        text: `Vitals: BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg, Pulse ${vitals.pulseBpm} bpm, SpO2 ${vitals.spO2Percent}%, RR ${vitals.respiratoryRate} rpm${vitals.gcsScore ? `, GCS ${vitals.gcsScore}/15` : ""}.\nField Notes: ${notes || "None provided"}`
      }
    ];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const response = await model.generateContent(parts);
    const text = response.response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      situation: parsed.situation || `Vitals unstable: BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, Pulse ${vitals.pulseBpm}.`,
      background: parsed.background || (notes || "High impact vehicular incident."),
      assessment: parsed.assessment || "Acute trauma priority patient.",
      recommendation: parsed.recommendation || "Activate Level-1 trauma bay with surgical standby.",
      traumaScore: Number(parsed.traumaScore) || 7.5,
      generatedAt: new Date().toISOString(),
      suspectedInjuries: parsed.suspectedInjuries || ["Polytrauma"],
      recommendedSpecialties: parsed.recommendedSpecialties || ["Trauma Surgery", "Critical Care"],
    };
  } catch (error) {
    console.warn("Gemini SBAR API error, falling back to deterministic decision engine:", error);
    return generateMockSBAR(vitals, notes);
  }
}

export async function auditHospitalBill(
  hospitalName: string,
  items: Array<{ description: string; chargedAmount: number }>
): Promise<BillAudit> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("Mock")) {
    return generateMockBillAudit(hospitalName);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
      systemInstruction: `You are an automated medical bill auditor for CGHS (Central Government Health Scheme) and private insurance regulations in India.
Analyze line items against standard CGHS package rates and identify inflated tariffs.
Output strictly JSON:
{
  "totalCharged": number,
  "cghsAllowed": number,
  "disputedSavings": number,
  "status": "APPROVED" | "DISPUTED" | "FLAGGED",
  "geminiAnalysisSummary": "Detailed forensic explanation",
  "items": [
    {
      "code": "CGHS-XXX",
      "description": "Item name",
      "chargedAmount": number,
      "cghsCapAmount": number,
      "isOvercharged": boolean,
      "variancePercentage": number,
      "notes": "Explanation"
    }
  ]
}`,
    });

    const prompt = `Hospital: ${hospitalName}\nBilled Line Items:\n${JSON.stringify(items, null, 2)}`;
    const response = await model.generateContent(prompt);
    const parsed = JSON.parse(response.response.text().replace(/```json\n?|\n?```/g, "").trim());

    return {
      id: `audit-cghs-${Date.now().toString().slice(-4)}`,
      hospitalId: "hosp-verified",
      hospitalName,
      patientName: "Patient Verified",
      date: new Date().toISOString().split("T")[0],
      totalCharged: parsed.totalCharged || items.reduce((acc, i) => acc + i.chargedAmount, 0),
      cghsAllowed: parsed.cghsAllowed || Math.round(parsed.totalCharged * 0.75),
      disputedSavings: parsed.disputedSavings || (parsed.totalCharged - parsed.cghsAllowed),
      status: parsed.status || "FLAGGED",
      geminiAnalysisSummary: parsed.geminiAnalysisSummary || "Audited against CGHS scheduled ceiling rates.",
      items: parsed.items || [],
    };
  } catch (error) {
    console.warn("Gemini Bill Audit error, using deterministic fallback:", error);
    return generateMockBillAudit(hospitalName);
  }
}
