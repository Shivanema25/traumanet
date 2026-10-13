/**
 * Medical Translation Utility for TraumaNet Paramedic Voice & Field Notes
 * Converts spoken or typed Hindi, Marathi, Hinglish, and Devanagari trauma notes
 * into structured, clinical English notes suitable for receiving emergency doctors.
 */

// Common vocabulary dictionary for emergency trauma phrases
const PHRASE_REPLACEMENTS: [RegExp, string][] = [
  // Demographics (Age + Gender)
  [/(\d+)\s*(?:saal|sal|varsh|varshiy|साल|वर्ष|वर्षांचा|वर्षांची|वर्षांचे)\s*(?:ka|ki|चा|ची|चे)?\s*(?:purush|aadmi|male|पुरुष|माणूस)/gi, "$1yo male"],
  [/(\d+)\s*(?:saal|sal|varsh|varshiy|साल|वर्ष|वर्षांचा|वर्षांची|वर्षांचे)\s*(?:ka|ki|चा|ची|चे)?\s*(?:mahila|aurat|female|स्त्री|महिला)/gi, "$1yo female"],
  [/(\d+)\s*(?:saal|sal|varsh|साल|वर्ष|वर्षांचा|वर्षांची)\s*(?:ka|ki|चा|ची)?\s*(?:baccha|ladka|mulga|बच्चा|मुलगा)/gi, "$1yo male child"],
  [/(\d+)\s*(?:saal|sal|varsh|साल|वर्ष|वर्षांचा|वर्षांची)\s*(?:ka|ki|चा|ची)?\s*(?:ladki|mulgi|लड़की|मुलगी)/gi, "$1yo female child"],
  [/\b(?:purush|aadmi|पुरुष|माणूस)\b/gi, "male patient"],
  [/\b(?:mahila|aurat|स्त्री|महिला)\b/gi, "female patient"],
  [/\b(?:baccha|balak|बच्चा|बालक)\b/gi, "pediatric patient"],

  // Mechanism of Injury
  [/\b(?:bike\s*accident|bike\s*se\s*gira|motorcycle\s*accident|बाईक\s*अपघात|बाइक\s*एक्सीडेंट)\b/gi, "motorcycle crash"],
  [/\b(?:car\s*accident|gaadi\s*thuk\s*gayi|गाडी\s*अपघात|कार\s*अपघात|गाडी\s*धडक)\b/gi, "motor vehicle collision"],
  [/\b(?:sadak\s*durghatna|rasta\s*apghat|road\s*accident|सड़क\s*दुर्घटना|रस्ता\s*अपघात)\b/gi, "road traffic accident (RTA)"],
  [/\b(?:unchai\s*se\s*gira|gir\s*gaya|unchi\s*varun\s*padla|उंचावरून\s*पडला|गिर\s*गया)\b/gi, "fall from height"],
  [/\b(?:aag\s*se\s*jala|aag\s*lagli|jal\s*gaya|भाजला|जल\s*गया)\b/gi, "thermal burn trauma"],
  [/\b(?:goli\s*lagi|bullet\s*lagi|गोळी\s*लागली|गोली\s*लगी)\b/gi, "gunshot trauma"],
  [/\b(?:chaku\s*laga|chaku\s*mara|चाकू\s*लागला|चाकू\s*लगा)\b/gi, "penetrating stab wound"],
  [/\b(?:auto\s*hit|auto\s*se\s*takkar)\b/gi, "auto-rickshaw collision"],

  // Head & Neurological
  [/\b(?:sar\s*me\s*chot|sir\s*me\s*chot|matha\s*phoot\s*gaya|dokyala\s*mar|dokyala\s*dukhapat|सिर\s*में\s*चोट|डोक्याला\s*मार|डोक्याला\s*दुखापत)\b/gi, "severe head trauma"],
  [/\b(?:sar\s*me\s*dard|dokyala\s*vedna|सिर\s*दर्द)\b/gi, "severe headache / head injury"],
  [/\b(?:behosh\s*hai|behosh\s*ho\s*gaya|behosh|beshuddh|बेहोश|बेशुद्ध)\b/gi, "unresponsive / unconscious (low GCS)"],
  [/\b(?:hosh\s*me\s*nahi\s*hai|shuddhivar\s*nahi|शुद्धीवर\s*नाही)\b/gi, "altered mental status"],
  [/\b(?:chhatka|daura|jhatke|aakshyap|झटके|दौरा)\b/gi, "convulsions / seizure activity"],

  // Hemorrhage / Bleeding
  [/\b(?:bahut\s*khoon\s*beh\s*raha(?:\s*hai)?|khoon\s*bahut\s*beh\s*raha(?:\s*hai)?|khup\s*raktasrav|प्रचंड\s*रक्तस्राव)\b/gi, "active profuse hemorrhage"],
  [/\b(?:khoon\s*beh\s*raha(?:\s*hai)?|bleeding\s*ho\s*rahi(?:\s*hai)?|raktasrav|खून\s*बह\s*रहा(?:\s*है)?|रक्तस्राव)\b/gi, "active hemorrhage / bleeding"],
  [/\b(?:khoon\s*nikal\s*raha(?:\s*hai)?|rakt\s*vahat\s*ahe)\b/gi, "active bleeding"],
  [/\b(?:bahut\s*khoon|khoon|blood)\b/gi, "blood"],

  // Head & Neurological
  [/\b(?:sar\s*me\s*chot|sir\s*me\s*chot|matha\s*phoot\s*gaya|dokyala\s*mar|dokyala\s*dukhapat|सिर\s*में\s*चोट|डोक्याला\s*मार|डोक्याला\s*दुखापत)\b/gi, "severe head trauma"],
  [/\b(?:sar\s*me|sir\s*me|dokyat|सिर\s*में)\b/gi, "head"],
  [/\b(?:sar\s*me\s*dard|dokyala\s*vedna|सिर\s*दर्द)\b/gi, "severe headache / head injury"],
  [/\b(?:behosh\s*hai|behosh\s*ho\s*gaya|behosh|beshuddh|बेहोश|बेशुद्ध)\b/gi, "unresponsive / unconscious (low GCS)"],
  [/\b(?:hosh\s*me\s*nahi\s*hai|shuddhivar\s*nahi|शुद्धीवर\s*नाही)\b/gi, "altered mental status"],
  [/\b(?:chhatka|daura|jhatke|aakshyap|झटके|दौरा)\b/gi, "convulsions / seizure activity"],

  // Respiratory & Chest
  [/\b(?:saas\s*lene\s*me\s*taklif|saas\s*phool\s*rahi\s*hai|shwas\s*ghenyas\s*adchan|सांस\s*लेने\s*में\s*तकलीफ|श्वास\s*घेण्यास\s*अडचण)\b/gi, "acute respiratory distress / severe dyspnea"],
  [/\b(?:saas\s*nahi\s*aa\s*rahi|shwas\s*band)\b/gi, "respiratory arrest / severe apnea"],
  [/\b(?:seene\s*me\s*chot|seene\s*me\s*dard|chhati\s*pe\s*mar|chhativar\s*mar|छाती\s*में\s*दर्द|छातीवर\s*मार)\b/gi, "blunt chest trauma / chest pain"],
  [/\b(?:chhati\s*dab\s*gayi)\b/gi, "crush injury to thorax"],

  // Skeletal / Fractures
  [/\b(?:pair\s*toot\s*gaya|pair\s*tut\s*gaya|pay\s*modla|पैर\s*टूट\s*गया|पाय\s*मोडला)\b/gi, "lower extremity fracture"],
  [/\b(?:haath\s*toot\s*gaya|hath\s*tut\s*gaya|haat\s*modla|हाथ\s*टूट\s*गया|हात\s*मोडला)\b/gi, "upper extremity fracture"],
  [/\b(?:haddi\s*bahar\s*aa\s*gayi|haddi\s*tut\s*gayi|had\s*modle|हड्डी\s*टूट\s*गई|हाड\s*मोडले)\b/gi, "open compound bone fracture"],
  [/\b(?:soojan\s*hai|bahut\s*soojan|sujan|swelling|सूज|सूजन)\b/gi, "significant edema / soft-tissue swelling"],

  // Abdomen & Spine
  [/\b(?:pet\s*me\s*dard|pet\s*me\s*chot|potat\s*dukhne|potat\s*mar|पेट\s*में\s*दर्द|पोटात\s*दुखणे)\b/gi, "acute abdominal trauma"],
  [/\b(?:gardan\s*me\s*chot|gardan\s*dard|manela\s*dukhapat|गर्दन\s*में\s*चोट|मानेला\s*मार)\b/gi, "suspected cervical spine injury"],
  [/\b(?:kamar\s*me\s*dard|pathivar\s*mar|कमर\s*में\s*चोट)\b/gi, "pelvic / lumbar injury"],

  // Vitals & Systemic
  [/\b(?:pulse\s*kam\s*hai|pulse\s*kamzor|pulse\s*nahi\s*mil\s*rahi|नाडी\s*मंदावली|पल्स\s*कमजोर)\b/gi, "weak thready pulse / bradycardia"],
  [/\b(?:pulse\s*tez\s*hai|pulse\s*fast|dharkan\s*tez|पल्स\s*तेज)\b/gi, "tachycardia / rapid pulse"],
  [/\b(?:bp\s*gir\s*raha\s*hai|bp\s*low\s*hai|raktadaab\s*kami|बीपी\s*कम|बीपी\s*गिर\s*रहा)\b/gi, "hypotensive / crashing blood pressure"],
  [/\b(?:oxygen\s*kam\s*hai|spo2\s*kam|ऑक्सिजन\s*कमी)\b/gi, "hypoxic / low oxygen saturation"],
  [/\b(?:halat\s*gambhir\s*hai|gambhir\s*avastha|critical\s*hai|हालत\s*गंभीर|अवस्था\s*गंभीर)\b/gi, "critical unstable condition"],
  [/\b(?:ultiyan\s*ho\s*rahi|ulti|vomiting|उल्टी)\b/gi, "active vomiting / emesis"],
  [/\b(?:thanda\s*pad\s*raha\s*hai|shareer\s*thanda)\b/gi, "cold clammy peripheries (shock)"],

  // Connecting Words & Noise Cleanup
  [/\b(?:ke\s*paas|javall|च्या\s*जवळ)\b/gi, "near"],
  [/\b(?:bahut\s*jyada|khup\s*jaast|अत्यधिक|खूप)\b/gi, "severe"],
  [/\b(?:beh\s*raha(?:\s*hai)?|ho\s*rahi(?:\s*hai)?|hua\s*hai|ho\s*gaya|lag\s*gayi|झाला|झाली|लागला|लागली)\b/gi, " "],
  [/\b(?:se\s*hai|se\s*hua|ahe|ahet|hota|tha|hai|hoga|aahe|आहे|होता|था|है|अवस्था)\b/gi, " "],
  [/\b(?:aur|ani|tathaa|आणि|और|व)\b/gi, ","],
  [/\b(?:par|pe|var|वर|पर)\b/gi, "at"],
];

// Convert Devanagari numerals (०-९) to standard digits (0-9)
function normalizeDevanagariNumerals(str: string): string {
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  let res = str;
  devanagariDigits.forEach((digit, i) => {
    res = res.split(digit).join(i.toString());
  });
  return res;
}

/**
 * Translates regional words and Hinglish/Marathi/Hindi speech into clean medical English.
 */
export function translateRegionalToEnglish(input: string): string {
  if (!input || !input.trim()) return "";

  // Normalize numerals first (e.g. ४२ -> 42)
  let text = normalizeDevanagariNumerals(input.trim());

  // Apply all dictionary replacements
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // Clean up duplicate spaces, multiple commas, etc.
  text = text
    .replace(/\s*,\s*,+/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();

  // Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}
