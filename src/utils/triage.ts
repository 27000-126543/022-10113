import type { Doctor, Questionnaire, RiskAlert, TriageRecord, Schedule } from '@/types';

export const getRiskLevel = (level: RiskAlert['level']): { label: string; color: string; bgColor: string } => {
  const levelMap = {
    low: { label: '低风险', color: 'text-mint-600', bgColor: 'bg-mint-100' },
    medium: { label: '中风险', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    high: { label: '高风险', color: 'text-coral-600', bgColor: 'bg-coral-100' },
  };
  return levelMap[level];
};

const departmentMapping: Record<string, string[]> = {
  皮肤美容科: [
    '痘痘', '痤疮', '痘印', '痘坑', '色斑', '肤色暗沉', '毛孔粗大',
    '细纹', '干纹', '皮肤松弛', '敏感肌', '红血丝', '疤痕',
    '黑头', '白头', '出油多', '光子嫩肤', '水光针', '热玛吉',
    '超声刀', '果酸换肤', '微针', '点阵激光', '祛斑', '祛痘',
  ],
  微整形科: [
    '玻尿酸', '填充', '瘦脸针', '除皱针', '肉毒素', '线雕',
    '面部年轻化', '私密整形', '咬肌大', '法令纹', '苹果肌',
    '太阳穴凹陷', '脸颊凹陷', '下巴短',
  ],
  整形外科: [
    '双眼皮', '眼袋', '隆鼻', '鼻梁低', '鼻头大', '隆胸',
    '吸脂', '腰腹', '大腿', '臀部', '肩颈', '妊娠纹',
    '面部不对称', '下颌线',
  ],
};

const concernDepartmentMap: Record<string, string> = {};
Object.entries(departmentMapping).forEach(([dept, concerns]) => {
  concerns.forEach((concern) => {
    concernDepartmentMap[concern] = dept;
  });
});

export const getSuggestedDepartment = (questionnaire: Questionnaire): string | null => {
  const allConcerns = [
    ...questionnaire.skinConcerns,
    ...questionnaire.facialConcerns,
    ...questionnaire.bodyConcerns,
  ];

  if (allConcerns.length === 0) return null;

  const deptCount: Record<string, number> = {};
  allConcerns.forEach((concern) => {
    const dept = concernDepartmentMap[concern];
    if (dept) {
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    }
  });

  if (Object.keys(deptCount).length === 0) return null;

  let maxDept = '';
  let maxCount = 0;
  Object.entries(deptCount).forEach(([dept, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDept = dept;
    }
  });

  return maxDept;
};

export const calculateMatchScore = (
  doctor: Doctor,
  questionnaire: Questionnaire,
  schedules?: Schedule[]
): number => {
  let score = 0;
  let matchDetails: string[] = [];

  const allConcerns = [
    ...questionnaire.skinConcerns,
    ...questionnaire.facialConcerns,
    ...questionnaire.bodyConcerns,
  ];

  const suggestedDept = getSuggestedDepartment(questionnaire);
  if (suggestedDept && doctor.departmentName === suggestedDept) {
    score += 50;
    matchDetails.push('科室匹配');
  }

  let specialtyMatchCount = 0;
  allConcerns.forEach((concern) => {
    const matched = doctor.specialties.some((s) => {
      return s.includes(concern) ||
        concern.includes(s) ||
        s.split('').some((c) => concern.includes(c) && c.length > 1);
    });
    if (matched) specialtyMatchCount++;
  });

  if (specialtyMatchCount > 0) {
    score += specialtyMatchCount * 15;
    matchDetails.push(`专长匹配x${specialtyMatchCount}`);
  }

  if (doctor.status === 'available') {
    score += 25;
    matchDetails.push('医生空闲');
  } else if (doctor.status === 'busy') {
    score += 10;
  }

  const highRiskCount = questionnaire.riskAlerts.filter((r) => r.level === 'high').length;
  const mediumRiskCount = questionnaire.riskAlerts.filter((r) => r.level === 'medium').length;

  if (highRiskCount > 0) {
    if (doctor.title.includes('主任') || doctor.title.includes('主任医师')) {
      score += 20;
      matchDetails.push('高风险-主任匹配');
    } else if (doctor.title.includes('副主任')) {
      score += 10;
    }
  }

  if (mediumRiskCount > 0 && doctor.title.includes('主治')) {
    score += 5;
  }

  const allAllergies = [...questionnaire.allergies];
  if (allAllergies.length > 0 && doctor.departmentName === '皮肤美容科') {
    score += 5;
  }

  return score;
};

export const suggestDoctor = (
  doctors: Doctor[],
  questionnaire: Questionnaire,
  triageRecords?: TriageRecord[]
): { doctor: Doctor; score: number; estimatedWait: number; matchReason: string } | null => {
  const activeDoctors = doctors.filter((d) => d.status !== 'offline');

  if (activeDoctors.length === 0) return null;

  const suggestedDept = getSuggestedDepartment(questionnaire);

  const scoredDoctors = activeDoctors.map((doctor) => {
    const score = calculateMatchScore(doctor, questionnaire);
    const estimatedWait = calculateEstimatedWait(doctor, triageRecords || []);

    let matchReason = '';
    if (suggestedDept && doctor.departmentName === suggestedDept) {
      matchReason = `主要诉求匹配${suggestedDept}`;
    } else {
      matchReason = `专长部分匹配`;
    }

    return { doctor, score, estimatedWait, matchReason };
  });

  scoredDoctors.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.estimatedWait - b.estimatedWait;
  });

  return scoredDoctors[0] || null;
};

export const calculateEstimatedWait = (
  doctor: Doctor,
  triageRecords: TriageRecord[],
  queuePosition: number = 0
): number => {
  const doctorQueue = triageRecords.filter(
    (r) => r.doctorId === doctor.id && (r.status === 'queued' || r.status === 'calling')
  );

  if (doctor.status === 'offline') return 999;

  let baseTime = 0;
  if (doctor.status === 'busy') {
    baseTime = 15;
  } else if (doctor.status === 'available') {
    baseTime = 0;
  }

  const avgConsultTime = 20;

  return baseTime + queuePosition * avgConsultTime;
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

  if (allergies.length >= 3) {
    alerts.push({
      id: `risk_${idCounter++}`,
      level: 'medium',
      title: '多种过敏源',
      description: '顾客有多种过敏史，治疗药物选择受限',
      suggestion: '建议术前详细排查过敏源，谨慎选择治疗方案',
    });
  }

  return alerts;
};

export const getDoctorRecommendations = (
  doctors: Doctor[],
  questionnaire: Questionnaire,
  triageRecords: TriageRecord[]
): Array<{ doctor: Doctor; score: number; estimatedWait: number; isRecommended: boolean; matchReason: string }> => {
  const results = doctors
    .filter((d) => d.status !== 'offline')
    .map((doctor) => {
      const score = calculateMatchScore(doctor, questionnaire);
      const estimatedWait = calculateEstimatedWait(doctor, triageRecords);

      let matchReason = '';
      const suggestedDept = getSuggestedDepartment(questionnaire);
      if (suggestedDept && doctor.departmentName === suggestedDept) {
        matchReason = '科室精准匹配';
      } else {
        const matchCount = doctor.specialties.filter((s) => {
          const allConcerns = [
            ...questionnaire.skinConcerns,
            ...questionnaire.facialConcerns,
            ...questionnaire.bodyConcerns,
          ];
          return allConcerns.some((c) => c.includes(s) || s.includes(c));
        }).length;
        matchReason = `匹配 ${matchCount} 项专长`;
      }

      return { doctor, score, estimatedWait, isRecommended: false, matchReason };
    })
    .sort((a, b) => b.score - a.score || a.estimatedWait - b.estimatedWait);

  if (results.length > 0) {
    results[0].isRecommended = true;
  }

  return results;
};
