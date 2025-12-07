import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
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
    // Obtener el bookingId de la ruta
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
    
    if (!this.bookingId) {
      this.snackBar.open('ID de reserva inválido', 'Cerrar', { duration: 3000 });
      this.goBack();
      return;
    }
    
    // Cargar datos del booking
    this.loadBookingData();
    
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
    
    console.log('QR Code escaneado:', resultString);
    
    // Validar el código QR
    this.validateAndConfirmBooking(resultString);
  }

  /**
   * Valida el QR y confirma la reserva
   */
  private validateAndConfirmBooking(qrCode: string): void {
    // Simulación de validación (reemplazar con llamada real al backend)
    setTimeout(() => {
      const isValid = this.validateQRCode(qrCode);
      
      if (isValid) {
        // Éxito: confirmar y regresar
        this.snackBar.open('✓ Reserva confirmada exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Navegar de vuelta con parámetro de éxito
        this.router.navigate(['/providers/provider-panel'], {
          queryParams: { confirmed: this.bookingId }
        });
      } else {
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
    }, 1000);
  }

  /**
   * Valida el formato del código QR
   */
  private validateQRCode(qrCode: string): boolean {
    // Implementa tu lógica de validación
    // Por ejemplo: "TOURYA-BOOKING-TB-1001-HASH123"
    return qrCode.includes(this.bookingId);
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
    const file = event.target.files[0];
    if (!file) return;

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      const codeReader = new BrowserQRCodeReader();
      const result = await codeReader.decodeFromImageUrl(URL.createObjectURL(file));
      
      if (result && result.getText()) {
        this.onCodeResult(result.getText());
      } else {
        this.errorMessage = 'No se pudo leer el código QR de la imagen. Intenta con otra imagen.';
        this.isProcessing = false;
      }
    } catch (error) {
      console.error('Error al leer QR de imagen:', error);
      this.errorMessage = 'No se encontró un código QR válido en la imagen.';
      this.isProcessing = false;
    }
    
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
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
