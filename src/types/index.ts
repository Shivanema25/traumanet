// TraumaNet - Core Domain TypeScript Types
// Emergency Medical Logistics Platform

export type EmergencyStatus = 
  | 'ROUTING' 
  | 'SOFT_LOCKED' 
  | 'EN_ROUTE' 
  | 'ARRIVED' 
  | 'RESOLVED' 
  | 'DIVERTED';

export type InsuranceStatus = 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'NOT_APPLICABLE';

export type PaymentStatus = 
  | 'UNPAID' 
  | 'PRE_AUTHORIZED' 
  | 'PAID';

export interface Vitals {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulseBpm: number;
  spO2Percent: number;
  respiratoryRate: number;
  recordedAt: string;
  gcsScore?: number;
}

export interface SBARReport {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  traumaScore: number; // 1.0 to 10.0 scale
  generatedAt: string;
  suspectedInjuries: string[];
  recommendedSpecialties: string[];
}

export interface FamilyPreRegistration {
  patientName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  emergencyContactName: string;
  emergencyContactPhone: string;
  abhaId?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  preAuthAmount?: number;
  status: InsuranceStatus;
  preAuthStatus?: PaymentStatus;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
  totalIcuBeds: number;
  availableIcuBeds: number;
  traumaLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  capabilities: string[];
  bloodBankStatus: 'AVAILABLE' | 'LOW' | 'CRITICAL';
  ctScannerStatus: 'OPERATIONAL' | 'OFFLINE';
  cathLabStatus: 'OPERATIONAL' | 'OFFLINE';
  dependabilityScore: number; // percentage (e.g., 96.5)
  currentWaitTimeMinutes: number;
  softLockExpiry?: string;
  verifiedBadge?: boolean;
}

export interface LiveTelemetry {
  lat: number;
  lng: number;
  heading?: number;
  speedKmh?: number;
}

export interface EmergencySession {
  id: string;
  incidentId: string;
  timestamp: string;
  status: EmergencyStatus;
  ambulanceId: string;
  paramedicId: string;
  paramedicNotes: string;
  paramedicAudioUrl?: string;
  injuryImageUrl?: string;
  vitals: Vitals;
  sbarReport?: SBARReport;
  targetHospitalId?: string;
  targetHospitalName?: string;
  softLockExpiresAt?: string;
  softLockVerified?: boolean;
  familyPreReg?: FamilyPreRegistration;
  liveCoordinates?: LiveTelemetry;
  etaMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillLineItem {
  code: string;
  description: string;
  chargedAmount: number;
  cghsCapAmount: number;
  isOvercharged: boolean;
  variancePercentage: number;
  notes?: string;
}

export interface BillAudit {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  date: string;
  totalCharged: number;
  cghsAllowed: number;
  disputedSavings: number;
  status: 'APPROVED' | 'DISPUTED' | 'FLAGGED';
  items: BillLineItem[];
  geminiAnalysisSummary: string;
}

export interface HospitalRecommendation {
  hospital: Hospital;
  etaMinutes: number;
  distanceKm: number;
  matchScore: number; // 0 - 100
  reason: string;
  isSoftLockable: boolean;
}
