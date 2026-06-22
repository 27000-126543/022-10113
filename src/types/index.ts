export interface Customer {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  sourceChannel: string;
  appointmentItem: string;
  tags: string[];
  photoUrls?: string[];
  createdAt: string;
}

export interface Questionnaire {
  id: string;
  customerId: string;
  skinConcerns: string[];
  facialConcerns: string[];
  bodyConcerns: string[];
  pastProcedures: string[];
  allergies: string[];
  contraindications: string;
  consultantNotes: string;
  consultantTags: string[];
  riskAlerts: RiskAlert[];
  photoUrls: string[];
  createdAt: string;
}

export interface RiskAlert {
  id: string;
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  specialties: string[];
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  room: string;
  currentPatient?: string;
  todayPatientCount: number;
}

export interface Department {
  id: string;
  name: string;
  room: string;
  doctorCount: number;
}

export type TriageStatus = 'queued' | 'calling' | 'consulting' | 'completed';

export interface TriageRecord {
  id: string;
  customerId: string;
  customerName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  room: string;
  status: TriageStatus;
  priority: number;
  waitTime: number;
  estimatedWait: number;
  suggestedDoctorId: string;
  isManualAdjusted: boolean;
  adjustReason?: string;
  queuedAt: string;
  calledAt?: string;
  completedAt?: string;
  hasHighRisk: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'morning' | 'afternoon' | 'full';
}

export interface DailyStats {
  totalArrivals: number;
  queuedCount: number;
  consultingCount: number;
  completedCount: number;
  avgWaitTime: number;
  avgConsultTime: number;
}

export interface ChannelData {
  name: string;
  count: number;
  percentage: number;
}

export interface ConcernData {
  category: string;
  count: number;
}
