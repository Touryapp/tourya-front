import { Component, OnInit } from '@angular/core';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';
import { RequestProvidersService } from '../../providers/requestproviders/request-providers.service';
import { RequestProviderDocumentType } from '../../../shared/dto/RequestProviderDocumentTypeList.dto';
import { RequestsProvidersStatus } from '../../../shared/enums/requests-providers-status.enum';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  showModal = false;
  showRequestInfoModal = false;
  showConfirmModal = false;
  showDeclineConfirmModal = false;
  showPreApproveConfirmModal = false;
  selectedProvider: RequestProvider | null = null;
  requestInfoMessage: string = '';
  requestProviders: any = { content: [] };
  mostrarSolicitudes: boolean = false;
  declinedReason: string = '';
  mostrarTourList: boolean = false;

  // Referencia al enum para usar en el template
  readonly StatusEnum = RequestsProvidersStatus;

  constructor(private requestProvidersService: RequestProvidersService) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.showGalleryFiles();
  }

  toggleTourList(): void {
    // Mostrar la sección de solicitudes (proveedores) y alternar la lista de tours incrustada
    this.mostrarSolicitudes = false;
    this.mostrarTourList = !this.mostrarTourList;
  }

  toggleSolicitudes(): void {
    // Mostrar la sección de solicitudes (proveedores) y alternar la lista de tours incrustada
    this.mostrarTourList = false;
    this.mostrarSolicitudes = !this.mostrarSolicitudes;
  }

  toggleDashboard(): void {
    this.mostrarTourList = false;
    this.mostrarSolicitudes = false;
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

  openProviderModal(provider: RequestProvider): void {
    this.requestProvidersService.consultDataById(provider.id).subscribe({
      next: (data) => {
        this.selectedProvider = data;
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error al cargar detalles del proveedor:', error);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProvider = null;
  }

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  openDeclineConfirmModal(): void {
    this.showDeclineConfirmModal = true;
  }

  closeDeclineConfirmModal(): void {
    this.showDeclineConfirmModal = false;
  }

  openPreApproveConfirmModal(): void {
    this.showPreApproveConfirmModal = true;
  }

  closePreApproveConfirmModal(): void {
    this.showPreApproveConfirmModal = false;
  }

  preAprobarSolicitud(): void {
    if (this.selectedProvider) {
      this.requestProvidersService.preApproveRequest(this.selectedProvider.id).subscribe({
        next: () => {
          this.cargarSolicitudes(); // Recargar la lista después de pre-aprobar
          this.closeModal();
          this.closePreApproveConfirmModal();
        },
        error: (error) => {
          console.error('Error al pre-aprobar la solicitud:', error);
        }
      });
    }
  }

  aprobarSolicitud(): void {
    if (this.selectedProvider) {
      this.requestProvidersService.approveRequest(this.selectedProvider.id).subscribe({
        next: () => {
          this.cargarSolicitudes(); // Recargar la lista después de aprobar
          this.closeModal();
          this.closeConfirmModal();
        },
        error: (error) => {
          console.error('Error al aprobar la solicitud:', error);
        }
      });
    }
  }

  rechazarSolicitud(): void {
    if (this.selectedProvider) {
      this.requestProvidersService.declineRequest(this.selectedProvider.id, this.declinedReason).subscribe({
        next: () => {
          this.cargarSolicitudes(); // Recargar la lista después de rechazar
          this.closeModal();
          this.closeDeclineConfirmModal();
          this.declinedReason = '';
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
    if (this.requestInfoMessage.trim() && this.selectedProvider) {
      this.requestProvidersService.incompleteRequest(this.selectedProvider.id, this.requestInfoMessage).subscribe({
        next: () => {
          this.cargarSolicitudes();
          this.closeRequestInfoModal();
          this.requestInfoMessage = '';
        },
        error: (error) => {
          console.error('Error al solicitar información:', error);
        }
      });
    }
  }

  // Métodos para verificar el estado y mostrar botones apropiados
  canPreApprove(): boolean {
    const canPreApprove = this.selectedProvider?.status === 'Submitted';
    // console.log('canPreApprove:', canPreApprove, 'Status:', this.selectedProvider?.status, 'Expected: Submitted');
    return canPreApprove;
  }

  canApprove(): boolean {
    return this.selectedProvider?.status === RequestsProvidersStatus.DOCUMENT_SENT;
  }

  canDecline(): boolean {
    return this.selectedProvider?.status === RequestsProvidersStatus.DOCUMENT_SENT;
  }

  canRequestInfo(): boolean {
    return this.selectedProvider?.status === RequestsProvidersStatus.DOCUMENT_SENT;
  }

  // Método para obtener la clase CSS del badge según el estado
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case RequestsProvidersStatus.CREATED:
        return 'bg-secondary';
      case RequestsProvidersStatus.SUBMITTED:
        return 'bg-primary';
      case RequestsProvidersStatus.PRE_APPROVED:
        return 'bg-info';
      case RequestsProvidersStatus.DOCUMENT_SENT:
        return 'bg-warning text-dark';
      case RequestsProvidersStatus.APPROVED:
        return 'bg-success';
      case RequestsProvidersStatus.INCOMPLETE_INFORMATION:
        return 'bg-warning';
      case RequestsProvidersStatus.CANCELLED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  openFile(url: string, target: string = '_blank') {
    if (url) {
      // Verificar si la URL es válida
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        window.open(url, target);
      } else {
        // Si es una ruta relativa, construir la URL completa
        const fullUrl = url.startsWith('/') ? url : `/${url}`;
        window.open(fullUrl, target);
      }
    }
  }

  // Función para obtener el tipo de archivo basado en la extensión
  getFileType(url: string): string {
    if (!url) return 'unknown';
    
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'doc':
      case 'docx':
        return 'document';
      default:
        return 'unknown';
    }
  }

  // Función para obtener el icono apropiado según el tipo de archivo
  getFileIcon(url: string): string {
    const fileType = this.getFileType(url);
    switch (fileType) {
      case 'pdf':
        return 'isax isax-document-text';
      case 'image':
        return 'isax isax-gallery';
      case 'document':
        return 'isax isax-document';
      default:
        return 'isax isax-document-text';
    }
  }

  // Función para verificar si una URL es una imagen
  isImage(url: string): boolean {
    return this.getFileType(url) === 'image';
  }

  // Función para obtener la cantidad de documentos con imagen
  getGalleryWithImageCount(): number {
    if (!this.selectedProvider || !this.selectedProvider.requestProviderGalleryList) {
      return 0;
    }
    return this.selectedProvider.requestProviderGalleryList.filter(doc => doc.imageUrl).length;
  }

  // Función para obtener la mitad superior de los documentos (para el primer recuadro)
  getFirstHalfDocuments(): any[] {
    if (!this.selectedProvider || !this.selectedProvider.requestProviderGalleryList) {
      return [];
    }
    const totalLength = this.selectedProvider.requestProviderGalleryList.length;
    const halfIndex = Math.ceil(totalLength / 2);
    return this.selectedProvider.requestProviderGalleryList.slice(0, halfIndex);
  }

  // Función para obtener la mitad inferior de los documentos (para el segundo recuadro)
  getSecondHalfDocuments(): any[] {
    if (!this.selectedProvider || !this.selectedProvider.requestProviderGalleryList) {
      return [];
    }
    const totalLength = this.selectedProvider.requestProviderGalleryList.length;
    const halfIndex = Math.ceil(totalLength / 2);
    return this.selectedProvider.requestProviderGalleryList.slice(halfIndex);
  }

  showGalleryFiles(): void {
    if (!this.requestProviders || !Array.isArray(this.requestProviders.content)) {
      console.log('No hay lista de solicitudes cargada.');
      return;
    }
    this.requestProviders.content.forEach((item: any) => {
      const providerId = item.id;
      this.requestProvidersService.consultDataByIdProviderAdmin(providerId).subscribe({
        next: (data) => {
          console.log(`Respuesta del servicio para proveedor ID ${providerId}:`, data);
        },
        error: (error) => {
          console.error(`[Proveedor ID ${providerId}] Error al consultar galería:`, error);
        }
      });
    });
  }

} 

