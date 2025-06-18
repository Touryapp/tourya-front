import { Component, OnInit } from '@angular/core';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';
import { RequestProvidersService } from '../../providers/requestproviders/request-providers.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  showModal = false;
  showRequestInfoModal = false;
  selectedProvider: RequestProvider | null = null;
  requestInfoMessage: string = '';
  requestProviders: any = { content: [] };

  constructor(private requestProvidersService: RequestProvidersService) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.requestProvidersService.findAll().subscribe({
      next: (solicitudes) => {
        console.log('Respuesta del servicio:', solicitudes);
        this.requestProviders = solicitudes;
        console.log('Datos procesados:', this.requestProviders);
      },
      error: (error) => {
        console.error('Error al cargar las solicitudes:', error);
      }
    });
  }

  // cargarSolicitudes(): void {
  //   this.requestProvidersService.findAll().subscribe({
  //     next: (solicitudes) => {
  //       this.requestProviders = solicitudes;
  //       console.log(this.requestProviders);
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar las solicitudes:', error);
  //     }
  //   });
  // }

  openProviderModal(provider: RequestProvider): void {
    this.selectedProvider = provider;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProvider = null;
  }

  aprobarSolicitud(): void {
    if (this.selectedProvider) {
      this.requestProvidersService.approveRequest(this.selectedProvider.id).subscribe({
        next: () => {
          this.cargarSolicitudes(); // Recargar la lista después de aprobar
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al aprobar la solicitud:', error);
        }
      });
    }
  }

  rechazarSolicitud(): void {
    if (this.selectedProvider) {
      this.requestProvidersService.declineRequest(this.selectedProvider.id).subscribe({
        next: () => {
          this.cargarSolicitudes(); // Recargar la lista después de rechazar
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al rechazar la solicitud:', error);
        }
      });
    }
  }

  solicitarInformacion(): void {
    if (this.selectedProvider) {
      // Aquí iría la lógica para solicitar más información
      // Por ejemplo, abrir otro modal o enviar una notificación
      alert('Se ha enviado una solicitud de información adicional al proveedor.');
      this.closeModal();
    }
  }

  openRequestInfoModal() {
    this.showRequestInfoModal = true;
  }

  closeRequestInfoModal() {
    this.showRequestInfoModal = false;
    this.requestInfoMessage = '';
  }

  sendRequestInfo() {
    if (this.requestInfoMessage.trim()) {
      console.log('Mensaje enviado:', this.requestInfoMessage);
      this.closeRequestInfoModal();
    }
  }
} 