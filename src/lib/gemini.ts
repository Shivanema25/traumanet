import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiTriageResponse, PatientVitals, SbarReport } from "./types";

export const GEMINI_SBAR_SYSTEM_PROMPT = `You are an expert clinical emergency triage assistant in India.
Analyze the provided injury image (if attached), manual patient vitals, and paramedic notes (which may be in Hindi, Marathi, English, or Hinglish).

Instructions:
1. Translate any regional language (Hindi, Marathi, Hinglish) notes to English internally for clinical comprehension.
2. Formulate a structured SBAR (Situation, Background, Assessment, Recommendation) clinical handover report for the receiving trauma ER team.
3. Output strictly valid JSON matching this exact structure:
{
  "trauma_score": number (1.0 to 10.0),
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "sbar": {
    "situation": "Brief 1-sentence situation summary",
    "background": "Observed background / mechanism of injury and field status",
    "assessment": "Clinical assessment based on image & vitals",
    "recommendation": "Actionable ER prep (e.g. pre-fetch blood, prepare CT scan, intubation kit)"
  },
  "required_specialists": ["Trauma Surgeon", "Orthopedic"],
  "ai_pre_report": "Concise 2-sentence doctor summary",
  "stabilization_steps": ["Action 1", "Action 2", "Action 3"],
  "estimated_deposit_inr": 15000
}
Output ONLY valid JSON, with NO surrounding markdown backticks or fences.`;

export async function triageWithGemini(
  vitals: PatientVitals,
  notes?: string,
  imageBase64?: string,
  apiKey?: string
): Promise<GeminiTriageResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!key || key === "your_gemini_api_key_here") {
    return generateDeterministicSbarTriage(vitals, notes);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
      systemInstruction: GEMINI_SBAR_SYSTEM_PROMPT,
    });

    const promptText = `
Emergency Patient Triage Data:
- Blood Pressure: ${vitals.blood_pressure_sys}/${vitals.blood_pressure_dia} mmHg
- Pulse Rate: ${vitals.pulse_rate} bpm
- SpO2 (Oxygen Saturation): ${vitals.spo2}%
- Respiratory Rate: ${vitals.respiratory_rate} breaths/min
- Glasgow Coma Scale (GCS): ${vitals.gcs_score} / 15
${vitals.temperature_c ? `- Temperature: ${vitals.temperature_c}°C` : ""}
${notes ? `- Paramedic Notes (Local Language/English): ${notes}` : "- Paramedic Notes: None provided"}

Analyze and generate the structured SBAR clinical report.
`;

    const parts: any[] = [{ text: promptText }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const urgency = (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.urgency)
      ? parsed.urgency
      : ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.severity)
      ? parsed.severity
      : "HIGH") as any;

    const sbar: SbarReport = {
      situation:
        parsed.sbar?.situation ||
        `Acute trauma patient presenting with vital instability (BP ${vitals.blood_pressure_sys}/${vitals.blood_pressure_dia}, Pulse ${vitals.pulse_rate}).`,
      background:
        parsed.sbar?.background ||
        (notes ? `Reported field notes: ${notes}` : "Suspected vehicular or high-energy trauma injury in transit."),
      assessment:
        parsed.sbar?.assessment ||
        `Clinical score ${parsed.trauma_score || 7.5}/10. Patient exhibits physiologic distress requiring monitored trauma bay.`,
      recommendation:
        parsed.sbar?.recommendation ||
        "Prepare Level 1 trauma resuscitation bay, crossmatch blood units, and alert trauma surgery team.",
    };

    return {
      trauma_score: Number(parsed.trauma_score) || 7.5,
      urgency,
      severity: urgency,
      sbar,
      required_specialists: Array.isArray(parsed.required_specialists) && parsed.required_specialists.length > 0
        ? parsed.required_specialists
        : ["Trauma Surgeon", "Critical Care"],
      ai_pre_report:
        parsed.ai_pre_report || `${sbar.situation} ${sbar.assessment}`,
      stabilization_steps: Array.isArray(parsed.stabilization_steps) && parsed.stabilization_steps.length > 0
        ? parsed.stabilization_steps
        : [
            "Maintain high-flow supplemental oxygen via non-rebreather mask.",
            "Establish dual wide-bore (14/16G) IV access with warmed crystalloid.",
            "Serial vitals monitoring every 3 minutes & maintain spinal precautions.",
          ],
      estimated_deposit_inr: Number(parsed.estimated_deposit_inr) || (urgency === "CRITICAL" ? 25000 : 15000),
    };
  } catch (err: any) {
    console.warn("Live Gemini API call failed or unavailable, using clinical SBAR fallback engine:", err?.message);
    return generateDeterministicSbarTriage(vitals, notes);
  }
}

/**
 * Deterministic Clinical SBAR Engine (ATLS & RTS Guidelines)
 * Supports multilingual notes (Hindi / Marathi / Hinglish / English)
 */
export function generateDeterministicSbarTriage(
  vitals: PatientVitals,
  notes?: string
): GeminiTriageResponse {
  const gcs = vitals.gcs_score || 15;
  const sys = vitals.blood_pressure_sys || 120;
  const dia = vitals.blood_pressure_dia || 80;
  const rr = vitals.respiratory_rate || 16;
  const pulse = vitals.pulse_rate || 75;
  const spo2 = vitals.spo2 || 98;

  let penalty = 0;

  // GCS Score penalties
  if (gcs <= 5) penalty += 4.5;
  else if (gcs <= 8) penalty += 3.8;
  else if (gcs <= 12) penalty += 2.2;
  else if (gcs <= 14) penalty += 1.0;

  // SBP penalties
  if (sys < 70) penalty += 3.5;
  else if (sys < 90) penalty += 2.8;
  else if (sys > 180) penalty += 2.0;

  // Pulse penalties
  if (pulse > 130 || pulse < 50) penalty += 2.0;
  else if (pulse > 110) penalty += 1.2;

  // SpO2 penalties
  if (spo2 < 85) penalty += 3.0;
  else if (spo2 < 92) penalty += 1.8;

  // Respiratory rate penalties
  if (rr < 10 || rr > 30) penalty += 2.2;

  // Multilingual text keyword recognition (Hindi / Marathi / Hinglish / English)
  const notesLower = (notes || "").toLowerCase();
  
  const hasHead =
    notesLower.includes("head") ||
    notesLower.includes("brain") ||
    notesLower.includes("skull") ||
    notesLower.includes("sar") ||
    notesLower.includes("sir") ||
    notesLower.includes("डोके") ||
    notesLower.includes("डोक्याला") ||
    notesLower.includes("सिर");

  const hasBleeding =
    notesLower.includes("blood") ||
    notesLower.includes("bleed") ||
    notesLower.includes("hemorrhag") ||
    notesLower.includes("khun") ||
    notesLower.includes("khoon") ||
    notesLower.includes("रक्त") ||
    notesLower.includes("रक्तस्राव") ||
    notesLower.includes("खून");

  const hasFracture =
    notesLower.includes("fracture") ||
    notesLower.includes("bone") ||
    notesLower.includes("crush") ||
    notesLower.includes("haddi") ||
    notesLower.includes("tut") ||
    notesLower.includes("हाड") ||
    notesLower.includes("फ्रॅक्चर") ||
    notesLower.includes("हड्डी");

  const hasChest =
    notesLower.includes("chest") ||
    notesLower.includes("lung") ||
    notesLower.includes("breath") ||
    notesLower.includes("saans") ||
    notesLower.includes("chhati") ||
    notesLower.includes("छाती") ||
    notesLower.includes("श्वास");

  const hasUnconscious =
    notesLower.includes("unconscious") ||
    notesLower.includes("coma") ||
    notesLower.includes("behos") ||
    notesLower.includes("beheosh") ||
    notesLower.includes("बेहोश") ||
    notesLower.includes("शुद्ध हरपली");

  if (hasHead) penalty += 1.5;
  if (hasBleeding) penalty += 1.2;
  if (hasChest) penalty += 1.0;
  if (hasUnconscious) penalty += 1.8;
  if (hasFracture) penalty += 0.8;

  let calculatedScore = Math.min(10.0, Math.max(1.0, 1.5 + penalty));
  calculatedScore = Math.round(calculatedScore * 10) / 10;

  let urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  let deposit = 5000;

  if (calculatedScore >= 8.0) {
    urgency = "CRITICAL";
    deposit = 25000;
  } else if (calculatedScore >= 6.0) {
    urgency = "HIGH";
    deposit = 18000;
  } else if (calculatedScore >= 4.0) {
    urgency = "MEDIUM";
    deposit = 10000;
  } else {
    urgency = "LOW";
    deposit = 5000;
  }

  // Required specialists based on clinical findings
  const specialists: string[] = ["Trauma Surgeon"];
  if (hasHead || gcs <= 12) specialists.push("Neurosurgery");
  if (hasFracture) specialists.push("Orthopedics");
  if (hasChest || spo2 < 90) specialists.push("Thoracic Surgery", "Pulmonologist");
  if (sys < 90 || hasBleeding || urgency === "CRITICAL") specialists.push("Critical Care / Intensivist");
  if (specialists.length < 2) specialists.push("Emergency Medicine");

  // Construct SBAR Elements
  let situationText = "";
  if (urgency === "CRITICAL") {
    situationText = `Critical emergency: Patient in acute hemorrhagic/physiological shock with trauma index ${calculatedScore}/10 and GCS ${gcs}.`;
  } else if (urgency === "HIGH") {
    situationText = `High acuity trauma patient presenting with tachycardia (Pulse ${pulse} bpm) and hemodynamic compromise.`;
  } else if (urgency === "MEDIUM") {
    situationText = `Moderate trauma presentation: Stable airway with localized orthopedic/soft tissue trauma.`;
  } else {
    situationText = `Low acuity trauma: Hemodynamically stable patient requiring primary wound closure and observation.`;
  }

  let backgroundText = "";
  if (notes && notes.trim().length > 0) {
    backgroundText = `Field Paramedic Report: "${notes.trim()}". Mechanism indicative of high-energy kinetic impact with active stabilization in transit.`;
  } else {
    backgroundText = `Patient transferred via ALS ambulance with suspected polytrauma following traffic/fall incident. No prior medical history available.`;
  }

  let assessmentText = `Objective Vitals: BP ${sys}/${dia} mmHg, Pulse ${pulse} bpm, SpO2 ${spo2}%, RR ${rr} rpm, GCS ${gcs}/15. Clinical risk category: ${urgency}.`;
  if (hasBleeding) assessmentText += ` Active ongoing blood loss suspected.`;
  if (hasHead) assessmentText += ` High suspicion of closed head injury / intracranial pathology.`;

  let recommendationText = "";
  if (urgency === "CRITICAL") {
    recommendationText = `Immediate Level 1 Trauma resuscitation bay standby. Pre-crossmatch 4 units O-negative PRBCs, alert ${specialists.slice(0, 2).join(" & ")}, and prepare immediate Pan-Scan CT.`;
  } else if (urgency === "HIGH") {
    recommendationText = `Hold monitored ICU bed. Request STAT emergency trauma CT protocol, rapid orthopedic evaluation, and 2 units packed red blood cells on standby.`;
  } else {
    recommendationText = `Standard trauma bay intake. FAST ultrasound on arrival, secondary survey, and baseline biochemical / radiological workup.`;
  }

  const sbar: SbarReport = {
    situation: situationText,
    background: backgroundText,
    assessment: assessmentText,
    recommendation: recommendationText,
  };

  const steps = [
    spo2 < 92
      ? "Administer high-flow 100% O2 via non-rebreather mask at 15 L/min; monitor pulse oximetry continuously."
      : "Maintain supplemental O2 via nasal cannula (4L/min); ensure cervical collar neutrality.",
    sys < 90
      ? "Establish dual wide-bore (14/16G) peripheral IV access; initiate rapid bolus of warmed balanced crystalloid."
      : "Establish patent 18G peripheral IV access; run normal saline at keep-vein-open rate.",
    gcs <= 8
      ? "Protect airway immediately: prepare for RSI (Rapid Sequence Intubation); elevate head 30° if spine cleared."
      : "Perform serial neurological checks (pupils & motor response every 5 min); splint injured extremities.",
  ];

  return {
    trauma_score: calculatedScore,
    urgency,
    severity: urgency,
    sbar,
    required_specialists: specialists.slice(0, 4),
    ai_pre_report: `${situationText} ${assessmentText}`,
    stabilization_steps: steps,
    estimated_deposit_inr: deposit,
  };
}
