export const languagesTranslate = {
  en: 'English',
  es: 'Spanish',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  hi: 'Hindi',
  ar: 'Arabic',
  pt: 'Portuguese',
  bn: 'Bengali',
  ru: 'Russian',
  ja: 'Japanese',
  pa: 'Punjabi',
  de: 'German',
  jv: 'Javanese',
  vi: 'Vietnamese',
  ko: 'Korean',
  fr: 'French',
  tr: 'Turkish',
  it: 'Italian',
  te: 'Telugu',
  mr: 'Marathi',
};

export const languageOptionsHTML = Object.entries(languagesTranslate)
  .map(([code, name]) => `<option value="${code}">${name}</option>`)
  .join('');
