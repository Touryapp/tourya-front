import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() {}

  /**
   * Detecta el código de país desde la configuración del navegador
   * Usa navigator.language que retorna el locale en formato "es-CO", "en-US", etc.
   * @returns Código de país de 2 letras (ISO 3166-1 alpha-2) o 'US' como fallback
   */
  getCountryFromBrowser(): string {
    const locale = navigator.language; // Ejemplo: "es-CO", "en-US", "pt-BR"
    const parts = locale.split('-');
    
    // Si el locale tiene el formato "idioma-PAÍS", retornar el país
    if (parts.length > 1) {
      return parts[1].toUpperCase(); // "CO", "US", "BR"
    }
    
    // Si solo tiene idioma (ej: "es", "en"), retornar fallback
    return 'US';
  }

  /**
   * Mapea un código de país a un idioma soportado por la aplicación
   * @param countryCode Código de país de 2 letras
   * @returns Código de idioma ('en', 'es', 'pt')
   */
  mapCountryToLanguage(countryCode: string): string {
    const countryToLang: { [key: string]: string } = {
      // Países de habla hispana
      'CO': 'es',  // Colombia
      'ES': 'es',  // España
      'MX': 'es',  // México
      'AR': 'es',  // Argentina
      'CL': 'es',  // Chile
      'PE': 'es',  // Perú
      'VE': 'es',  // Venezuela
      'EC': 'es',  // Ecuador
      'GT': 'es',  // Guatemala
      'CU': 'es',  // Cuba
      'BO': 'es',  // Bolivia
      'DO': 'es',  // República Dominicana
      'HN': 'es',  // Honduras
      'PY': 'es',  // Paraguay
      'SV': 'es',  // El Salvador
      'NI': 'es',  // Nicaragua
      'CR': 'es',  // Costa Rica
      'PA': 'es',  // Panamá
      'UY': 'es',  // Uruguay
      
      // Países de habla portuguesa
      'BR': 'pt',  // Brasil
      'PT': 'pt',  // Portugal
      
      // Países de habla inglesa (y otros)
      'US': 'en',  // Estados Unidos
      'GB': 'en',  // Reino Unido
      'CA': 'en',  // Canadá
      'AU': 'en',  // Australia
      'NZ': 'en',  // Nueva Zelanda
      'IE': 'en',  // Irlanda
    };
    
    return countryToLang[countryCode] || 'en'; // Fallback a inglés
  }
}
