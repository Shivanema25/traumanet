export interface HospitalRankingV2 {
  dependability_score: number; // e.g. 94.2
  ranking_grade: string; // e.g. "Grade A+"
  communication_freshness_sec: number; // e.g. 14
  equipment_readiness_pct: number; // e.g. 98.5
  icu_hold_reliability_pct: number; // e.g. 96.0
}

export interface Hospital {
  hospital_id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  icu_beds_free: number;
  total_icu_beds: number;
  active_specialists: string[];
  base_deposit_inr: number;
  is_soft_locked: boolean;
  soft_locked_session_id?: string;
  distance_km?: number;
  eta_minutes?: number;
  trauma_level: string; // "Level 1 Trauma Center", "Level 2"
  emergency_contact: string;
  blood_bank_o_neg_units: number;
  ct_mri_available: boolean;
  ranking_v2?: HospitalRankingV2;
}

export interface BillGuardAuditItem {
  item_name: string;
  billed_amount_inr: number;
  cghs_cap_inr: number;
  is_overcharged: boolean;
  excess_amount_inr: number;
  package_reference: string;
}

export interface BillGuardReport {
  hospital_name: string;
  total_billed_inr: number;
  cghs_capped_total_inr: number;
  total_overcharge_inr: number;
  items: BillGuardAuditItem[];
  legal_notice: string;
}

export interface PatientVitals {
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  pulse_rate: number;
  spo2: number;
  respiratory_rate: number;
  gcs_score: number; // Glasgow Coma Scale 3-15
  temperature_c?: number;
}

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PaymentStatus = "PENDING" | "PAID";

export type BedLockStatus = "HOLD" | "SOFT_LOCKED" | "ACCEPTED_LOCKED" | "DECLINED_REROUTED" | "ADMITTED";

export interface PreReservations {
  blood_bank_units: number;
  ct_scan_reserved: boolean;
  mri_reserved: boolean;
  or_theater_ready: boolean;
  neurosurgery_called: boolean;
  ortho_called: boolean;
  vascular_called: boolean;
  icu_team_notified: boolean;
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  blood_group?: string;
  abha_id?: string;
  insurance_provider?: string;
  policy_number?: string;
  coverage_amount_inr?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface CostBreakdownItem {
  item: string;
  cost_inr: number;
  covered_by_insurance_pct: number;
}

export interface CostBreakdown {
  items: CostBreakdownItem[];
  subtotal_inr: number;
  abha_subsidy_inr: number;
  insurance_deductible_inr: number;
  final_patient_deposit_inr: number;
}

export interface SbarReport {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface EmergencySession {
  session_id: string;
  incident_title: string;
  timestamp: string; // ISO string
  patient_info: PatientInfo;
  vitals: PatientVitals;
  trauma_score: number; // 1.0 - 10.0
  severity: SeverityLevel;
  urgency?: SeverityLevel;
  sbar?: SbarReport;
  ai_pre_report: string; // 2-sentence clinical summary
  required_specialists: string[];
  stabilization_steps: string[];
  assigned_hospital_id: string;
  ambulance_id: string;
  ambulance_lat: number;
  ambulance_lng: number;
  eta_minutes: number;
  speed_kmh: number;
  payment_status: PaymentStatus;
  deposit_amount_inr: number;
  bed_status: BedLockStatus;
  soft_lock_expires_at: string; // ISO string (15 mins from creation)
  pre_reservations: PreReservations;
  injury_image_url?: string;
  voice_notes?: string;
  raw_paramedic_notes?: string;
  cost_breakdown?: CostBreakdown;
  upi_ref_id?: string;
  rerouted_to_hospital_id?: string;
  is_synced: boolean;
}

export interface GeminiTriageResponse {
  trauma_score: number; // 1.0 - 10.0
  urgency?: SeverityLevel;
  severity: SeverityLevel;
  sbar?: SbarReport;
  required_specialists: string[];
  ai_pre_report: string;
  stabilization_steps: string[];
  estimated_deposit_inr: number;
}
