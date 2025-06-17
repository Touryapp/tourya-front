import { Component, OnInit } from '@angular/core';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';

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

  // Lista simulada de solicitudes de proveedores
  requestProviders: RequestProvider[] = [
    {
      id: 1,
      status: 'Pending',
      provider: {
        id: 101,
        name: 'Juan Pérez',
        documentNumber: '12345678',
        documentType: 'DNI',
        serviceType: 'Hotel',
        country: { id: 1, name: 'Argentina' },
        city: { id: 1, name: 'Buenos Aires' },
        state: { id: 1, name: 'Buenos Aires' },
        department: 'Centro',
        address: 'Calle Falsa 123',
        phone: '+54 11 1234-5678',
        status: 'Active'
      }
    },
    {
      id: 2,
      status: 'Approved',
      provider: {
        id: 102,
        name: 'María Gómez',
        documentNumber: '87654321',
        documentType: 'CUIT',
        serviceType: 'Tour',
        country: { id: 2, name: 'Chile' },
        city: { id: 2, name: 'Santiago' },
        state: { id: 2, name: 'RM' },
        department: 'Las Condes',
        address: 'Av. Principal 456',
        phone: '+56 2 2345-6789',
        status: 'Active'
      }
    },
    {
      id: 3,
      status: 'Rejected',
      provider: {
        id: 103,
        name: 'Carlos Ruiz',
        documentNumber: '11223344',
        documentType: 'DNI',
        serviceType: 'Car',
        country: { id: 3, name: 'Uruguay' },
        city: { id: 3, name: 'Montevideo' },
        state: { id: 3, name: 'Montevideo' },
        department: 'Centro',
        address: 'Calle 8 789',
        phone: '+598 2 3456-7890',
        status: 'Inactive'
      }
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

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
      // Aquí iría la lógica para aprobar la solicitud
      this.selectedProvider.status = 'Approved';
      // Actualizar la lista de solicitudes
      const index = this.requestProviders.findIndex(p => p.id === this.selectedProvider?.id);
      if (index !== -1) {
        this.requestProviders[index].status = 'Approved';
      }
      this.closeModal();
    }
  }

  rechazarSolicitud(): void {
    if (this.selectedProvider) {
      // Aquí iría la lógica para rechazar la solicitud
      this.selectedProvider.status = 'Rejected';
      // Actualizar la lista de solicitudes
      const index = this.requestProviders.findIndex(p => p.id === this.selectedProvider?.id);
      if (index !== -1) {
        this.requestProviders[index].status = 'Rejected';
      }
      this.closeModal();
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
      // Aquí puedes implementar la lógica para enviar el mensaje
      console.log('Mensaje enviado:', this.requestInfoMessage);
      // TODO: Implementar el envío del mensaje al backend
      this.closeRequestInfoModal();
    }
  }
} 