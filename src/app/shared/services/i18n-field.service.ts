import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { I18nField, SupportedLanguage, isI18nField } from '../interfaces/i18n-field.interface';

/**
 * Service to handle internationalized fields (I18nField)
 * Provides utilities to extract values in the current language and create I18nField objects
 */
@Injectable({
  providedIn: 'root'
})
export class I18nFieldService {

  constructor(private translate: TranslateService) {}

  /**
   * Get the current language from TranslateService
   * @returns Current language as SupportedLanguage
   */
  getCurrentLanguage(): SupportedLanguage {
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    
    // Ensure it's one of our supported languages
    if (currentLang === 'es' || currentLang === 'en' || currentLang === 'pt') {
      return currentLang;
    }
    
    // Default to Spanish if not supported
    return 'es';
  }

  /**
   * Extract the value from an I18nField in the current language
   * Falls back to Spanish if the current language is not available
   * 
   * @param field - The I18nField object or a simple string
   * @returns The value in the current language or fallback
   */
  getValue(field: I18nField | string | null | undefined): string {
    // Handle null/undefined
    if (!field) {
      return '';
    }

    // If it's already a string, return it
    if (typeof field === 'string') {
      return field;
    }

    // If it's an I18nField object
    if (isI18nField(field)) {
      const currentLang = this.getCurrentLanguage();
      
      // Try to get value in current language
      const value = field[currentLang];
      if (value && value.trim() !== '') {
        return value;
      }

      // Fallback to Spanish
      if (field.es && field.es.trim() !== '') {
        return field.es;
      }

      // Fallback to English
      if (field.en && field.en.trim() !== '') {
        return field.en;
      }

      // Fallback to Portuguese
      if (field.pt && field.pt.trim() !== '') {
        return field.pt;
      }
    }

    return '';
  }

  /**
   * Create an I18nField object from a string value
   * The value will be set for the specified language (or current language if not specified)
   * Other languages will be empty strings
   * 
   * @param value - The string value to set
   * @param lang - Optional language to set the value for (defaults to current language)
   * @returns An I18nField object
   */
  createI18nField(value: string, lang?: SupportedLanguage): I18nField {
    const targetLang = lang || this.getCurrentLanguage();
    
    const field: I18nField = {
      es: '',
      en: '',
      pt: ''
    };

    field[targetLang] = value || '';

    return field;
  }

  /**
   * Create an I18nField object with values for all languages
   * 
   * @param es - Spanish value
   * @param en - English value
   * @param pt - Portuguese value
   * @returns An I18nField object
   */
  createI18nFieldMulti(es: string, en: string, pt: string): I18nField {
    return {
      es: es || '',
      en: en || '',
      pt: pt || ''
    };
  }

  /**
   * Update a specific language in an I18nField object
   * 
   * @param field - The existing I18nField object
   * @param lang - The language to update
   * @param value - The new value
   * @returns Updated I18nField object
   */
  updateLanguage(field: I18nField, lang: SupportedLanguage, value: string): I18nField {
    return {
      ...field,
      [lang]: value || ''
    };
  }

  /**
   * Check if an I18nField has any non-empty value
   * 
   * @param field - The I18nField to check
   * @returns true if at least one language has a value
   */
  hasValue(field: I18nField | null | undefined): boolean {
    if (!field || !isI18nField(field)) {
      return false;
    }

    return !!(
      (field.es && field.es.trim() !== '') ||
      (field.en && field.en.trim() !== '') ||
      (field.pt && field.pt.trim() !== '')
    );
  }
}
