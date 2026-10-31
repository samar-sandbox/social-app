import { LANG } from "../enums/index.js";

type TTranslation = Record<LANG, string>;

type TValidationMessage = {
  name: TTranslation;
  email: TTranslation;
  password: {
    format: TTranslation;
    required: TTranslation;
  };
  age: {
    min: TTranslation;
    max: TTranslation;
  };
  phone: TTranslation;
  googleId: TTranslation;
  otp: TTranslation;
};

export const validationMessages: TValidationMessage = {
  name: {
    [LANG.EN]: "Name must be at least 3 characters long",
    [LANG.AR]: "يجب ألا يقل الاسم عن 3 أحرف",
  },
  email: {
    [LANG.EN]: "Email must be a valid email address",
    [LANG.AR]: "يجب إدخال عنوان بريد إلكتروني صالح",
  },
  password: {
    format: {
      [LANG.EN]:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      [LANG.AR]:
        "يجب ألا تقل كلمة المرور عن 6 أحرف وتحتوي على حرف كبير وحرف صغير ورقم وحرف خاص",
    },
    required: {
      [LANG.EN]: "Password is required",
      [LANG.AR]: "كلمة المرور مطلوبة",
    },
  },
  phone: {
    [LANG.EN]:
      "Phone number must be a valid Egyptian number starting with 010, 011, 012, or 015 and followed by 8 digits",
    [LANG.AR]:
      "يجب إدخال رقم هاتف مصري صالح يبدأ بـ 010 أو 011 أو 012 أو 015 ويتبعه 8 أرقام",
  },
  age: {
    min: {
      [LANG.EN]: "Age must be at least 18 years old",
      [LANG.AR]: "يجب ألا يقل العمر عن 18 عامًا",
    },
    max: {
      [LANG.EN]: "Age must be less than 60 years old",
      [LANG.AR]: "يجب أن يقل العمر عن 60 عامًا",
    },
  },
  googleId: {
    [LANG.EN]: "Google ID token is required",
    [LANG.AR]: "رمز Google مطلوب",
  },
  otp: {
    [LANG.EN]: "Invalid OTP",
    [LANG.AR]: "رمز OTP غير صالح",
  },
};

export const invalidEnumValue = (
  enumName: string,
  validValues: string[],
): TTranslation => ({
  [LANG.EN]: `Invalid enum value for path \`${enumName}\`: ${validValues.join(
    ", ",
  )}`,
  [LANG.AR]: `قيمة ${enumName} غير صالحة، يجب أن تكون واحدة من: ${validValues.join(
    ", ",
  )}`,
});
