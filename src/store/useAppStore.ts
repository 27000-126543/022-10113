import { create } from 'zustand';
import type { Customer, Doctor, TriageRecord, Questionnaire, Schedule } from '@/types';
import {
  mockCustomers,
  mockDoctors,
  mockTriageRecords,
  mockQuestionnaire,
  mockSchedules,
} from '@/mock';

interface AppState {
  customers: Customer[];
  doctors: Doctor[];
  triageRecords: TriageRecord[];
  questionnaires: Record<string, Questionnaire>;
  schedules: Schedule[];
  currentUser: { name: string; role: string; avatar: string } | null;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  getCustomer: (id: string) => Customer | undefined;

  addQuestionnaire: (questionnaire: Questionnaire) => void;
  getQuestionnaire: (customerId: string) => Questionnaire | undefined;

  addTriageRecord: (record: Omit<TriageRecord, 'id' | 'queuedAt'>) => TriageRecord;
  updateTriageStatus: (id: string, status: TriageRecord['status']) => void;
  callNextPatient: (doctorId: string) => TriageRecord | null;

  getTodayStats: () => {
    totalArrivals: number;
    queuedCount: number;
    consultingCount: number;
    completedCount: number;
  };
}

const generateId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  customers: mockCustomers,
  doctors: mockDoctors,
  triageRecords: mockTriageRecords,
  questionnaires: mockQuestionnaire,
  schedules: mockSchedules,
  currentUser: {
    name: '林小美',
    role: '前台咨询师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linxiaomei',
  },

  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId('c'),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      customers: [newCustomer, ...state.customers],
    }));
    return newCustomer;
  },

  updateCustomer: (id, data) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }));
  },

  getCustomer: (id) => {
    return get().customers.find((c) => c.id === id);
  },

  addQuestionnaire: (questionnaire) => {
    set((state) => ({
      questionnaires: {
        ...state.questionnaires,
        [questionnaire.customerId]: questionnaire,
      },
    }));
  },

  getQuestionnaire: (customerId) => {
    return get().questionnaires[customerId];
  },

  addTriageRecord: (record) => {
    const newRecord: TriageRecord = {
      ...record,
      id: generateId('t'),
      queuedAt: new Date().toISOString(),
    };
    set((state) => ({
      triageRecords: [newRecord, ...state.triageRecords],
    }));
    return newRecord;
  },

  updateTriageStatus: (id, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      triageRecords: state.triageRecords.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, status };
        if (status === 'calling') {
          updated.calledAt = now;
        }
        if (status === 'completed') {
          updated.completedAt = now;
        }
        return updated;
      }),
    }));
  },

  callNextPatient: (doctorId) => {
    const state = get();
    const queuedRecords = state.triageRecords
      .filter((r) => r.status === 'queued' && r.doctorId === doctorId)
      .sort((a, b) => b.priority - a.priority || a.waitTime - b.waitTime);

    if (queuedRecords.length === 0) return null;

    const nextRecord = queuedRecords[0];
    get().updateTriageStatus(nextRecord.id, 'calling');
    return nextRecord;
  },

  getTodayStats: () => {
    const records = get().triageRecords;
    const today = new Date().toDateString();

    const todayRecords = records.filter((r) => {
      const recordDate = new Date(r.queuedAt).toDateString();
      return recordDate === today;
    });

    return {
      totalArrivals: todayRecords.length,
      queuedCount: todayRecords.filter((r) => r.status === 'queued').length,
      consultingCount: todayRecords.filter(
        (r) => r.status === 'calling' || r.status === 'consulting'
      ).length,
      completedCount: todayRecords.filter((r) => r.status === 'completed').length,
    };
  },
}));
