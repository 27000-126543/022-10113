export const validateIdCard = (idCard: string): { valid: boolean; error?: string; age?: number; gender?: 'male' | 'female' } => {
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!reg.test(idCard)) {
    return { valid: false, error: '身份证格式不正确' };
  }

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }

  const checkCode = checkCodes[sum % 11];
  if (checkCode !== idCard[17].toUpperCase()) {
    return { valid: false, error: '身份证校验码错误' };
  }

  const birthYear = parseInt(idCard.substring(6, 10));
  const birthMonth = parseInt(idCard.substring(10, 12));
  const birthDay = parseInt(idCard.substring(12, 14));
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const genderCode = parseInt(idCard[16]);
  const gender = genderCode % 2 === 1 ? 'male' : 'female';

  return { valid: true, age, gender };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(phone)) {
    return { valid: false, error: '手机号格式不正确' };
  }
  return { valid: true };
};

export const maskIdCard = (idCard: string): string => {
  if (idCard.length !== 18) return idCard;
  return idCard.substring(0, 6) + '********' + idCard.substring(14);
};

export const maskPhone = (phone: string): string => {
  if (phone.length !== 11) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(7);
};
