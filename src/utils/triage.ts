import type { Doctor, Questionnaire, RiskAlert } from '@/types';
import { mockQuestionnaire } from '@/mock';

export const getRiskLevel = (level: RiskAlert['level']): { label: string; color: string; bgColor: string } => {
  const levelMap = {
    low: { label: '低风险', color: 'text-mint-600', bgColor: 'bg-mint-100' },
    medium: { label: '中风险', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    high: { label: '高风险', color: 'text-coral-600', bgColor: 'bg-coral-100' },
  };
  return levelMap[level];
};

export const calculateMatchScore = (doctor: Doctor, questionnaire: Questionnaire): number => {
  let score = 0;

  const allConcerns = [
    ...questionnaire.skinConcerns,
    ...questionnaire.facialConcerns,
    ...questionnaire.bodyConcerns,
  ];

  allConcerns.forEach((concern) => {
    if (doctor.specialties.some((s) => s.includes(concern) || concern.includes(s))) {
      score += 10;
    }
  });

  if (doctor.status === 'available') {
    score += 20;
  } else if (doctor.status === 'busy') {
    score += 5;
  }

  const highRiskCount = questionnaire.riskAlerts.filter((r) => r.level === 'high').length;
  if (highRiskCount > 0 && doctor.title.includes('主任')) {
    score += 15;
  }

  return score;
};

export const suggestDoctor = (doctors: Doctor[], customerId: string): Doctor | null => {
  const questionnaire = mockQuestionnaire[customerId];
  if (!questionnaire) {
    const available = doctors.filter((d) => d.status !== 'offline');
    return available[0] || null;
  }

  const scoredDoctors = doctors
    .filter((d) => d.status !== 'offline')
    .map((doctor) => ({
      doctor,
      score: calculateMatchScore(doctor, questionnaire),
    }))
    .sort((a, b) => b.score - a.score);

  return scoredDoctors[0]?.doctor || null;
};

export const generateRiskAlerts = (
  pastProcedures: string[],
  allergies: string[],
  contraindications: string
): RiskAlert[] => {
  const alerts: RiskAlert[] = [];
  let idCounter = 1;

  if (allergies.includes('青霉素')) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'low',
      title: '青霉素过敏史',
      description: '顾客有青霉素过敏史，治疗前需确认麻醉方式',
      suggestion: '建议使用非青霉素类麻醉药物，术前详细告知医生',
    });
  }

  if (allergies.includes('利多卡因')) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'medium',
      title: '利多卡因过敏',
      description: '顾客对利多卡因过敏，影响麻醉方式选择',
      suggestion: '需更换其他麻醉药物，术前进行过敏测试',
    });
  }

  if (contraindications.includes('高血压') || contraindications.includes('血压')) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'medium',
      title: '高血压病史',
      description: '顾客有高血压病史，部分治疗可能有一定风险',
      suggestion: '建议术前测量血压，确认血压控制良好，必要时咨询内科医生',
    });
  }

  if (contraindications.includes('疤痕') || contraindications.includes('瘢痕')) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'high',
      title: '疤痕体质',
      description: '顾客自述为疤痕体质，手术类项目需谨慎评估',
      suggestion: '建议先做疤痕体质检测，优先考虑非手术方案',
    });
  }

  if (contraindications.includes('糖尿病')) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'high',
      title: '糖尿病史',
      description: '顾客有糖尿病史，伤口愈合可能受影响',
      suggestion: '建议术前检查血糖水平，手术类项目需特别谨慎',
    });
  }

  if (pastProcedures.length >= 5) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'low',
      title: '多次治疗史',
      description: '顾客有多次医美治疗史，皮肤状态需仔细评估',
      suggestion: '建议先做详细皮肤检测，确认皮肤状态，选择合适的治疗方案',
    });
  }

  return alerts;
};
