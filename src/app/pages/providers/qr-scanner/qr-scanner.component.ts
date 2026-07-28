import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserQRCodeReader } from '@zxing/browser';

@Component({
  selector: 'app-qr-scanner',
  standalone: false,
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.scss'
})
export class QrScannerComponent implements OnInit, OnDestroy {
  
  // Datos del booking
  bookingId: string = '';
  bookingData: any = null;
  
  // Configuración del escáner
  allowedFormats = [BarcodeFormat.QR_CODE];
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;
  currentDeviceIndex: number = 0;
  
  // Estados
  isScanning: boolean = true;
  isProcessing: boolean = false;
  errorMessage: string = '';
  cameraError: boolean = false;
  scanAttempts: number = 0;
  maxAttempts: number = 3;
  
  private customStream: MediaStream | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener el bookingId de la ruta (opcional ahora)
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
    
    // Si hay bookingId, cargar datos del booking
    if (this.bookingId) {
      this.loadBookingData();
    }
    
    // Inicializar cámara con getUserMedia personalizado
    setTimeout(() => {
      this.initializeCustomCamera();
    }, 500);
  }

  ngOnDestroy(): void {
    // Detener el escaneo primero
    this.isScanning = false;
    
    // Detener el stream personalizado si existe
    if (this.customStream) {
      this.customStream.getTracks().forEach(track => {
        track.stop();
        console.log('Track detenido:', track.label);
      });
      this.customStream = null;
    }
  }

  /**
   * Inicializa la cámara usando getUserMedia directamente (como Google Meet)
   */
  private async initializeCustomCamera(): Promise<void> {
    try {
      console.log('🎥 Iniciando cámara con getUserMedia personalizado...');
      
      // Constraints flexibles como Google Meet
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.customStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Stream de cámara obtenido exitosamente');
      console.log('Tracks de video:', this.customStream.getVideoTracks().map(t => t.label));
      
      // Aplicar el stream al elemento video
      setTimeout(() => {
        const videoElement = document.querySelector('zxing-scanner video') as HTMLVideoElement;
        if (videoElement && this.customStream) {
          videoElement.srcObject = this.customStream;
          videoElement.play().then(() => {
            console.log('✅ Video reproduciéndose correctamente');
            // Iniciar escaneo manual
            this.startManualScanning(videoElement);
          }).catch(err => {
            console.error('Error al reproducir video:', err);
          });
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Error al inicializar cámara personalizada:', error);
      this.cameraError = true;
      this.isScanning = false;
    }
  }

  /**
   * Escanea QR manualmente usando BrowserQRCodeReader
   */
  private startManualScanning(videoElement: HTMLVideoElement): void {
    const codeReader = new BrowserQRCodeReader();
    
    const scan = async () => {
      if (!this.isScanning || this.isProcessing) {
        return;
      }
      
      try {
        const result = await codeReader.decodeOnceFromVideoElement(videoElement);
        if (result) {
          this.onCodeResult(result.getText());
        }
      } catch (error) {
        // Ignorar errores de escaneo (normal cuando no hay QR)
      }
      
      // Continuar escaneando
      if (this.isScanning) {
        setTimeout(() => scan(), 300);
      }
    };
    
    scan();
  }

  /**
   * Carga los datos del booking para mostrar contexto
   */
  private loadBookingData(): void {
    // Aquí cargarías desde tu servicio
    // Por ahora, datos mock basados en el ID
    this.bookingData = {
      id: this.bookingId,
      tourName: 'Tour Example',
      customerName: 'Cliente Example'
    };
  }

  /**
   * Maneja el resultado del escaneo
   */
  onCodeResult(resultString: string): void {
    if (this.isProcessing) return; // Evitar múltiples escaneos
    
    this.isProcessing = true;
    this.errorMessage = '';
    
    // ========== LOGS DE DEBUGGING ==========
    console.log('========================================');
    console.log('🔍 QR CODE ESCANEADO:');
    console.log('========================================');
    console.log('📄 Contenido completo:', resultString);
    console.log('📏 Longitud:', resultString.length);
    console.log('🔤 Tipo:', typeof resultString);
    console.log('🌐 ¿Es una URL?:', resultString.startsWith('http://') || resultString.startsWith('https://'));
    console.log('========================================');
    // ========================================
    
    // Validar el código QR
    this.validateAndConfirmBooking(resultString);
  }

  /**
   * Valida el QR y confirma la reserva
   */
  private validateAndConfirmBooking(qrCode: string): void {
    console.log('🔄 validateAndConfirmBooking - Iniciando...');
    
    try {
      const validationResult = this.validateQRCode(qrCode);
      console.log('📊 Resultado de validación:', validationResult);
      
      if (validationResult.isValid) {
        console.log('✅ QR válido, procesando...');
        
        // Si el QR contiene una URL completa, extraer parámetros y navegar al panel
        if (validationResult.redirectUrl) {
          console.log('🌐 URL del QR detectada:', validationResult.redirectUrl);
          
          try {
            // Extraer todos los parámetros de la URL
            const url = new URL(validationResult.redirectUrl);
            const queryParams: any = {};
            
            // Copiar todos los parámetros
            url.searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });
            
            console.log('📋 Query params extraídos:', queryParams);
            
            // Agregar flag para abrir el modal automáticamente
            queryParams['openModal'] = 'true';
            
            console.log('🚀 Navegando a /providers/provider-panel con params:', queryParams);
            
            // Navegar al provider panel con los parámetros
            this.router.navigate(['/providers/provider-panel'], {
              queryParams: queryParams
            }).then(success => {
              console.log('✅ Navegación completada:', success);
            }).catch(error => {
              console.error('❌ Error en la navegación:', error);
            });
            
          } catch (error) {
            console.error('❌ Error al procesar la URL:', error);
            this.errorMessage = 'Error al procesar el código QR';
            this.isProcessing = false;
          }
          
        } else if (validationResult.bookingId) {
          console.log('📝 Usando bookingId (formato antiguo):', validationResult.bookingId);
          
          // Fallback: Si solo hay bookingId (formato antiguo)
          this.bookingId = validationResult.bookingId;
          
          this.snackBar.open(`✓ Reserva ${this.bookingId} confirmada exitosamente`, 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          this.router.navigate(['/providers/provider-panel'], {
            queryParams: { confirmed: this.bookingId }
          });
        } else {
          console.error('❌ Validación exitosa pero sin redirectUrl ni bookingId');
          this.errorMessage = 'Error: Datos incompletos en el QR';
          this.isProcessing = false;
        }
      } else {
        console.log('❌ QR inválido');
        
        // Error: mostrar mensaje y permitir reintentar
        this.scanAttempts++;
        
        if (this.scanAttempts >= this.maxAttempts) {
          this.errorMessage = `Código QR inválido. Has alcanzado el máximo de intentos (${this.maxAttempts}).`;
          this.isScanning = false;
        } else {
          this.errorMessage = `Código QR inválido. Intento ${this.scanAttempts}/${this.maxAttempts}. Por favor, intenta nuevamente.`;
          this.isProcessing = false; // Permitir nuevo escaneo
        }
      }
    } catch (error) {
      console.error('❌ Error crítico en validateAndConfirmBooking:', error);
      this.errorMessage = 'Error al procesar el código QR';
      this.isProcessing = false;
    }
  }

  /**
   * Valida el formato del código QR y extrae el booking ID o URL de redirección
   */
  private validateQRCode(qrCode: string): { isValid: boolean; bookingId?: string; redirectUrl?: string } {
    console.log('🔎 Iniciando validación del QR...');
    
    // Verificar si es una URL
    if (qrCode.startsWith('http://') || qrCode.startsWith('https://')) {
      console.log('🌐 El QR es una URL, extrayendo parámetros...');
      
      try {
        const url = new URL(qrCode);
        const reservationId = url.searchParams.get('reservationId');
        const paymentId = url.searchParams.get('paymentId');
        const status = url.searchParams.get('status');
        
        console.log('📋 Parámetros extraídos:');
        console.log('  - reservationId:', reservationId);
        console.log('  - paymentId:', paymentId);
        console.log('  - status:', status);
        
        if (reservationId) {
          console.log('✅ reservationId encontrado:', reservationId);
          console.log('🌐 URL completa para redirección:', qrCode);
          
          // Verificar que el estado sea válido (opcional)
          if (status && status !== 'PENDING') {
            console.log('⚠️ Advertencia: El estado de la reserva es:', status);
          }
          
          return {
            isValid: true,
            bookingId: `RES-${reservationId}`, // Formato esperado por el modal: RES-10
            redirectUrl: qrCode // URL completa para redirección
          };
        } else {
          console.log('❌ No se encontró reservationId en la URL');
        }
      } catch (error) {
        console.error('❌ Error al parsear la URL:', error);
      }
    }
    
    // Fallback: Intentar patrones anteriores por si acaso
    console.log('🔍 Intentando patrones de texto plano...');

    // 1. Patrón nuevo directo (RES-38)
    const resPattern = /(?:RES-)(\d+)/i;
    const resMatch = qrCode.match(resPattern);
    if (resMatch && resMatch[1]) {
       console.log('✅ Match directo RES-ID encontrado:', resMatch[1]);
       return {
         isValid: true,
         bookingId: `RES-${resMatch[1]}`
       };
    }
    
    // 2. Patrón esperado antiguo: TOURYA-BOOKING-{ID}-{HASH}
    const qrPattern = /TOURYA-BOOKING-(TB-\d+)-[A-Z0-9]+/i;
    const match = qrCode.match(qrPattern);
    
    if (match && match[1]) {
      console.log('✅ Match TOURYA-BOOKING encontrado! Booking ID:', match[1]);
      return {
        isValid: true,
        bookingId: match[1]
      };
    }
    
    // Si no coincide con el patrón esperado, intentar encontrar cualquier ID de booking
    const simplePattern = /(TB-\d+)/i;
    const simpleMatch = qrCode.match(simplePattern);
    
    console.log('🎯 Patrón simple (TB-XXXX):', simpleMatch);
    
    if (simpleMatch && simpleMatch[1]) {
      console.log('✅ Match simple encontrado! Booking ID:', simpleMatch[1]);
      return {
        isValid: true,
        bookingId: simpleMatch[1]
      };
    }
    
    console.log('❌ No se encontró ningún patrón válido');
    return { isValid: false };
  }

  /**
   * Reinicia el escáner después de un error
   */
  retryScanning(): void {
    this.errorMessage = '';
    this.cameraError = false;
    this.isProcessing = false;
    this.isScanning = true;
  }

  /**
   * Navega de vuelta a la gestión de tours
   */
  goBack(): void {
    this.isScanning = false;
    this.router.navigate(['/providers/provider-panel']);
  }

  /**
   * Maneja la selección de archivo de imagen
   */
  async onFileSelected(event: any): Promise<void> {
    console.log('📁 onFileSelected - Evento recibido:', event);
    
    const file = event.target.files[0];
    console.log('📁 Archivo seleccionado:', file);
    
    if (!file) {
      console.log('❌ No se seleccionó ningún archivo');
      return;
    }

    console.log('📁 Nombre del archivo:', file.name);
    console.log('📁 Tipo de archivo:', file.type);
    console.log('📁 Tamaño del archivo:', file.size, 'bytes');

    this.isProcessing = true;
    this.errorMessage = '';
    
    let imageUrl: string | undefined;
    
    // Configurar hints para mejorar la detección (TRY_HARDER ayuda con imágenes rotadas o con ruido)
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    
    const codeReader = new BrowserQRCodeReader(hints);

    try {
      console.log('🔄 Creando BrowserQRCodeReader con hints avanzados...');
      
      imageUrl = URL.createObjectURL(file);
      console.log('🖼️ URL de la imagen creada:', imageUrl);
      
      console.log('🔍 Intentando decodificar QR de la imagen...');
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      
      console.log('📊 Resultado de decodificación:', result);
      
      if (result && result.getText()) {
        console.log('✅ QR decodificado exitosamente desde imagen!');
        console.log('📄 Texto del QR:', result.getText());
        
        this.isProcessing = false;
        this.onCodeResult(result.getText());
      } else {
        console.log('❌ No se pudo obtener texto del resultado');
        this.errorMessage = 'No se pudo leer el código QR de la imagen. Intenta con otra imagen.';
        this.isProcessing = false;
      }
    } catch (error: any) {
      // Lista de errores "normales" de decodificación que pueden justificar un reintento
      const isDecodeError = 
        error.name === 'NotFoundException' || 
        error.name === 'NotFoundException2' || 
        error.name === 'FormatException' || 
        error.name === 'FormatException2' || 
        error.name === 'ChecksumException' || 
        (error.toString && (error.toString().includes('NotFound') || error.toString().includes('Format') || error.toString().includes('Checksum')));

      if (isDecodeError) {
        // SI ES EL PRIMER ERROR, INTENTAR CON ESTRATEGIAS DE PROCESAMIENTO
        if (imageUrl && !imageUrl.startsWith('data:')) {
          console.warn('⚠️ Primer intento fallido. Iniciando estrategias de recuperación...');
          
          // Orden de estrategias optimizado
          const strategies = [
            'binary-balanced',       // 1. Equilibrada (Min+Max)/2 -> Mejor para separar ruido
            'binary-adaptive',       // 2. Adaptativa (Promedio)
            'grayscale-smooth',      // 3. Grayscale con suavizado (Evita bordes "dientes de sierra")
            'grayscale',             // 4. Grayscale crudo (Nearest neighbor)
            'binary-adaptive-low',   // 5. Adaptativa Baja (Mejor para QR oscuros)
            'normalize',             // 6. Normalización (Full dynamic range)
            'contrast'               // 7. Contraste Fijo
          ];
          let decoded = false;

          for (const strategy of strategies) {
            if (decoded) break;
            
            this.errorMessage = `Intentando estrategia: ${strategy}...`;
            console.log(`🔄 Probando estrategia: ${strategy}`);
            
            try {
              const processedCanvas = await this.preprocessImage(imageUrl, strategy);
              const retryResult = await codeReader.decodeFromCanvas(processedCanvas);
              
              if (retryResult && retryResult.getText()) {
                console.log(`✅ ESTRATEGIA EXITOSA: ${strategy}`);
                console.log('📄 Texto recuperado:', retryResult.getText());
                this.isProcessing = false;
                this.onCodeResult(retryResult.getText());
                decoded = true;
                return; // Éxito
              }
            } catch (retryError) {
              console.warn(`⚠️ Falló estrategia ${strategy}`);
            }
          }

          if (!decoded) {
             console.error('❌ Todas las estrategias de recuperación fallaron.');
             this.errorMessage = 'No se pudo leer el QR. Intente mejorar la iluminación o recortar la imagen.';
             this.isProcessing = false;
          }
        } else {
           // No es URL válida o es data URL sin tratar
           this.errorMessage = 'Error de formato o lectura de QR.';
           this.isProcessing = false;
        }
      } else {
        // Otro tipo de error
        console.error('❌ Error no recuperable:', error);
        this.errorMessage = 'Ocurrió un error al procesar la imagen.';
        this.isProcessing = false;
      }
    } finally {
      // Liberar memoria de la URL creada
      if (typeof imageUrl !== 'undefined') {
        URL.revokeObjectURL(imageUrl);
      }
    }
    
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  }

  /**
   * Aplica procesamiento de imagen avanzado con soporte para binarización adaptativa
   * Retorna un HTMLCanvasElement listo para ser leído
   */
  private async preprocessImage(imageUrl: string, strategy: string = 'contrast'): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // --- 1. Intelligent Resizing ---
        if (width < 500 && height < 500) {
             // Upscale x2 para imágenes pequeñas (crucial para ZXing)
             const scale = 2;
             width = width * scale;
             height = height * scale;
        } else if (width > 800 || height > 800) {
           // Downscale si es gigante
            const maxDimension = 800; 
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        console.log(`🖼️ Procesando imagen: ${img.width}x${img.height} -> ${width}x${height} (Estrategia: ${strategy})`);

        const padding = 40; // Quiet Zone
        const canvas = document.createElement('canvas');
        canvas.width = width + (padding * 2);
        canvas.height = height + (padding * 2);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Configurable smoothing based on strategy name
        ctx.imageSmoothingEnabled = strategy.includes('smooth');
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, padding, padding, width, height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // --- 2. Pass 1: Convert to Grayscale & Calculate Stats ---
        let min = 255;
        let max = 0;
        let sum = 0;
        
        // Convertimos todo a escala de grises primero para facilitar cálculos
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Luminancia perceptual
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;

          // Stats (ignorando el padding blanco puro para no sesgar el promedio hacia arriba demasiado)
          // El padding es blanco (255), si contamos demasiados 255 el promedio sube artificialmente.
          // Pero aquí estamos leyendo lo que acabamos de dibujar.
          // Una optimización simple es solo contar píxeles dentro de la imagen original, 
          // pero asumiremos que el QR ocupa buena parte.
          if (gray < min) min = gray;
          if (gray > max) max = gray;
          sum += gray;
        }

        const avg = sum / (data.length / 4);
        console.log(`📊 Stats: Min=${min}, Max=${max}, Avg=${avg.toFixed(1)}`);

        // --- 3. Pass 2: Apply Strategy ---
        // Si es 'grayscale', ya terminamos (la conversión se hizo arriba)
        
        if (strategy === 'normalize') {
           // Stretch contrast: (val - min) * (255 / (max - min))
           const range = max - min;
           if (range > 0) {
             const factor = 255 / range;
             for (let i = 0; i < data.length; i += 4) {
               const val = data[i]; // Ya es gris
               const norm = Math.floor((val - min) * factor);
               data[i] = norm;
               data[i + 1] = norm;
               data[i + 2] = norm;
             }
           }
        }
        else if (strategy.startsWith('binary-balanced')) {
             // Umbral Medio = (Min + Max) / 2
             // Más robusto que el promedio cuando hay mucho blanco (quiet zone)
             let threshold = (min + max) / 2;
             
             // Clamp threshold
             threshold = Math.max(10, Math.min(245, threshold));
             console.log(`⚖️ Binarizando con Umbral Balanceado: ${threshold.toFixed(1)}`);
 
             for (let i = 0; i < data.length; i += 4) {
                 const val = data[i];
                 const binary = (val > threshold) ? 255 : 0;
                 data[i] = binary;
                 data[i + 1] = binary;
                 data[i + 2] = binary;
             }
         }
        else if (strategy.startsWith('binary-adaptive')) {
            let threshold = avg; // Default: Average

            if (strategy === 'binary-adaptive-high') {
                threshold = avg + 25; // Favorece oscuros (bueno para imágenes lavadas/brillantes)
            } else if (strategy === 'binary-adaptive-low') {
                threshold = avg - 25; // Favorece claros (bueno para imágenes oscuras)
            }

            // Clamp threshold
            threshold = Math.max(10, Math.min(245, threshold));
            console.log(`⚖️ Binarizando con Umbral Adaptativo: ${threshold.toFixed(1)}`);

            for (let i = 0; i < data.length; i += 4) {
                const val = data[i];
                const binary = (val > threshold) ? 255 : 0;
                data[i] = binary;
                data[i + 1] = binary;
                data[i + 2] = binary;
            }
        }
        else if (strategy === 'contrast') {
             // Fixed threshold 128
             const threshold = 128;
             for (let i = 0; i < data.length; i += 4) {
                const val = data[i];
                const binary = (val > threshold) ? 255 : 0;
                data[i] = binary;
                data[i + 1] = binary;
                data[i + 2] = binary;
            }
        }
        else if (strategy === 'invert') {
             for (let i = 0; i < data.length; i += 4) {
                const val = data[i];
                const inv = 255 - val;
                data[i] = inv;
                data[i + 1] = inv;
                data[i + 2] = inv;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
      img.onerror = (err) => reject(err);
      img.src = imageUrl;
    });
  }

  /**
   * Opción de entrada manual del código
   */
  enterManually(): void {
    const manualCode = prompt('Ingresa el código QR manualmente:');
    if (manualCode) {
      this.onCodeResult(manualCode);
    }
  }
}
