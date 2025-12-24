/**
 * Interface for internationalized fields that support multiple languages
 */
export interface I18nField {
  es: string;
  en: string;
  pt: string;
}

/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'es' | 'en' | 'pt';

/**
 * Type guard to check if a value is an I18nField object
 */
export function isI18nField(value: any): value is I18nField {
  return (
    value !== null &&
    typeof value === 'object' &&
    'es' in value &&
    'en' in value &&
    'pt' in value
  );
}
