import type { AppLanguage } from "../types/language";

const dictionary: Record<Exclude<AppLanguage, "en">, Record<string, string>> = {
  ar: {
    "This is not a medical diagnosis.": "هذه ليست تشخيصا طبيا.",
    "If symptoms are severe, sudden, worsening, or you are worried, seek medical advice.": "إذا كانت الأعراض شديدة أو مفاجئة أو تزداد سوءا أو كنت قلقا، فاطلب المشورة الطبية.",
    "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.": "اتصل بالرقم 999 أو اذهب إلى قسم الطوارئ الآن إذا كانت الأعراض شديدة أو مفاجئة أو تزداد سوءا.",
    "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen.": "فكر في التواصل مع طبيبك العام أو NHS 111، خاصة إذا استمرت الأعراض أو ساءت.",
    "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.": "راقب أعراضك وفكر في استشارة صيدلي أو طبيب عام أو NHS 111 إذا لم تكن متأكدا أو تغيرت الأعراض.",
  },
  fr: {
    "This is not a medical diagnosis.": "Ceci n'est pas un diagnostic médical.",
    "If symptoms are severe, sudden, worsening, or you are worried, seek medical advice.": "Si les symptômes sont graves, soudains, s'aggravent ou vous inquiètent, demandez un avis médical.",
    "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.": "Appelez le 999 ou allez aux urgences maintenant si les symptômes sont graves, soudains ou s'aggravent.",
    "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen.": "Envisagez de contacter votre médecin généraliste ou NHS 111, surtout si les symptômes persistent ou s'aggravent.",
    "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.": "Surveillez vos symptômes et envisagez un pharmacien, un médecin généraliste ou NHS 111 si vous avez un doute ou si les symptômes changent.",
  },
  es: {
    "This is not a medical diagnosis.": "Esto no es un diagnóstico médico.",
    "If symptoms are severe, sudden, worsening, or you are worried, seek medical advice.": "Si los síntomas son graves, repentinos, empeoran o te preocupan, busca consejo médico.",
    "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.": "Llama al 999 o acude a urgencias ahora si los síntomas son graves, repentinos o empeoran.",
    "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen.": "Considera contactar con tu médico de cabecera o NHS 111, especialmente si los síntomas continúan o empeoran.",
    "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.": "Controla tus síntomas y considera consultar a un farmacéutico, médico de cabecera o NHS 111 si no estás seguro o los síntomas cambian.",
  },
  zh: {
    "This is not a medical diagnosis.": "这不是医学诊断。",
    "If symptoms are severe, sudden, worsening, or you are worried, seek medical advice.": "如果症状严重、突然、恶化，或你感到担心，请寻求医疗建议。",
    "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.": "如果症状严重、突然或恶化，请立即拨打999或前往急诊。",
    "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen.": "如果症状持续或恶化，请考虑联系全科医生或NHS 111。",
    "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.": "请观察症状；如果不确定或症状变化，可咨询药剂师、全科医生或NHS 111。",
  },
  pa: {
    "This is not a medical diagnosis.": "ਇਹ ਕੋਈ ਡਾਕਟਰੀ ਤਸ਼ਖੀਸ ਨਹੀਂ ਹੈ।",
    "If symptoms are severe, sudden, worsening, or you are worried, seek medical advice.": "ਜੇ ਲੱਛਣ ਗੰਭੀਰ, ਅਚਾਨਕ, ਵਧ ਰਹੇ ਹਨ ਜਾਂ ਤੁਸੀਂ ਚਿੰਤਤ ਹੋ, ਤਾਂ ਡਾਕਟਰੀ ਸਲਾਹ ਲਵੋ।",
    "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.": "ਜੇ ਲੱਛਣ ਗੰਭੀਰ, ਅਚਾਨਕ ਜਾਂ ਵਧ ਰਹੇ ਹਨ, ਤਾਂ ਹੁਣੇ 999 ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ A&E ਜਾਓ।",
    "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen.": "ਆਪਣੇ GP ਜਾਂ NHS 111 ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਬਾਰੇ ਸੋਚੋ, ਖਾਸ ਕਰਕੇ ਜੇ ਲੱਛਣ ਜਾਰੀ ਰਹਿੰਦੇ ਜਾਂ ਵਧਦੇ ਹਨ।",
    "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.": "ਆਪਣੇ ਲੱਛਣਾਂ ਤੇ ਨਜ਼ਰ ਰੱਖੋ ਅਤੇ ਜੇ ਤੁਸੀਂ ਅਣਸ਼ਚਿਤ ਹੋ ਜਾਂ ਲੱਛਣ ਬਦਲਦੇ ਹਨ ਤਾਂ ਫਾਰਮਾਸਿਸਟ, GP ਜਾਂ NHS 111 ਬਾਰੇ ਸੋਚੋ।",
  },
};

export function translateText(text: string, language: AppLanguage): string {
  if (language === "en") return text;
  const exact = dictionary[language][text.trim()];
  if (exact) return exact;

  const safety = dictionary[language]["This is not a medical diagnosis."];
  return `${text}\n[${language.toUpperCase()} translation pending for dynamic clinical wording. ${safety}]`;
}

export function localisedPromptSuffix(language: AppLanguage) {
  if (language === "en") return "Reply in English unless the user writes in another supported language.";
  return `Reply primarily in ${language}, but you may switch language to match the user's message. Keep NHS terms such as GP, NHS 111, 999, and A&E recognizable.`;
}
