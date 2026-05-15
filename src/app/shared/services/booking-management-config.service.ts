import { Injectable } from '@angular/core';

// Tipo de rol del usuario
export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';

// Configuración completa del componente según rol
export interface BookingManagementConfig {
  role: UserRole;
  title: string;
  subtitle?: string;
  apiEndpoint: string;
  columns: ColumnConfig[];
  actions: ActionConfig[];
  filters: FilterConfig[];
  canExport: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// Configuración de columnas de la tabla
export interface ColumnConfig {
  field: string;
  header: string;
  type: 'text' | 'date' | 'number' | 'status' | 'image' | 'currency' | 'list';
  sortable: boolean;
  filterable: boolean;
  width?: string;
}

// Configuración de acciones disponibles
export interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  visible: (row: any) => boolean;
}

// Configuración de filtros
export interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingManagementConfigService {

  constructor() { }

  /**
   * Obtiene la configuración según el rol del usuario
   */
  getConfigByRole(role: UserRole): BookingManagementConfig {
    switch (role) {
      case 'CLIENT':
        return this.getClientConfig();
      case 'PROVIDER':
        return this.getProviderConfig();
      case 'ADMIN':
        return this.getAdminConfig();
      default:
        throw new Error(`Rol no soportado: ${role}`);
    }
  }

  /**
   * Configuración para el rol CLIENT (Turista)
   * - Solo ve sus propias reservas
   * - Puede ver detalles y cancelar
   */
  private getClientConfig(): BookingManagementConfig {
    return {
      role: 'CLIENT',
      title: 'Mis Reservas',
      subtitle: 'Gestiona tus reservas de tours y experiencias',
      apiEndpoint: '/api/v1/client/bookings',
      columns: [
        {
          field: 'img',
          header: 'Tour',
          type: 'image',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'tourName',
          header: 'Nombre del Tour',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '200px'
        },
        {
          field: 'destination',
          header: 'Destino',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'checkInDate',
          header: 'Fecha de Inicio',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'returnDate',
          header: 'Fecha de Fin',
          type: 'date',
          sortable: true,
          filterable: false,
          width: '120px'
        },
        {
          field: 'travellers',
          header: 'Viajeros',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '100px'
        },
        {
          field: 'price',
          header: 'Precio',
          type: 'currency',
          sortable: true,
          filterable: false,
          width: '100px'
        },
        {
          field: 'status',
          header: 'Estado',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        {
          id: 'view',
          label: 'Ver',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true // Siempre visible
        },
        {
          id: 'reschedule',
          label: 'Reagendar',
          icon: 'fa fa-calendar',
          color: 'warning',
          visible: (row) => {
            // Use the new canReschedule field from API if available
            if (row.canReschedule !== undefined) {
              return row.canReschedule;
            }
            
            // Fallback to legacy logic if canReschedule is not present
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED';
            
            if (!row.maxReschedulingDate) return false;
            
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            // Robust parsing: appending T00:00:00 ensures local time parsing
            const limitDate = new Date(row.maxReschedulingDate + 'T00:00:00');
            limitDate.setHours(0, 0, 0, 0);
            
            return isActionable && now <= limitDate;
          }
        },
        {
          id: 'cancel',
          label: 'Cancelar',
          icon: 'fa fa-times-circle',
          color: 'danger',
          visible: (row) => {
            // Use the new canCancel field from API if available
            if (row.canCancel !== undefined) {
              return row.canCancel;
            }

            // Check if status is Pending or Rescheduled
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED';
            
            // Check if current date is before or equal to maxCancellationDate
            // We use startOf('day') for both to ensure same-day comparison works correctly
            if (!row.maxCancellationDate) return false;
            
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            // Robust parsing: appending T00:00:00 ensures local time parsing
            const limitDate = new Date(row.maxCancellationDate + 'T00:00:00');
            limitDate.setHours(0, 0, 0, 0);
            
            return isActionable && now <= limitDate;
          }
        }
      ],
      filters: [
        {
          field: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'Upcoming', label: 'Próximas' },
            { value: 'Pending', label: 'Pendientes' },
            { value: 'Confirmed', label: 'Confirmadas' },
            { value: 'Cancelled', label: 'Canceladas' },
            { value: 'Completed', label: 'Completadas' }
          ]
        },
        {
          field: 'dateRange',
          label: 'Rango de Fechas',
          type: 'dateRange'
        }
      ],
      canExport: true,
      canCreate: false,
      canEdit: false,
      canDelete: false
    };
  }

  /**
   * Configuración para el rol PROVIDER (Proveedor de Tours)
   * - Ve las reservas de sus tours
   * - Puede confirmar, cancelar y completar reservas
   */
  private getProviderConfig(): BookingManagementConfig {
    return {
      role: 'PROVIDER',
      title: 'Gestión de Reservas',
      subtitle: 'Administra las reservas de tus tours',
      apiEndpoint: '/api/v1/provider/bookings',
      columns: [
        {
          field: 'img',
          header: 'Tour',
          type: 'image',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'tourName',
          header: 'Nombre del Tour',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '180px'
        },
        {
          field: 'customerName',
          header: 'Cliente',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'customerEmail',
          header: 'Email',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '180px'
        },
        {
          field: 'customerPhone',
          header: 'Teléfono',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '120px'
        },
        {
          field: 'travellers',
          header: 'Viajeros',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'checkInDate',
          header: 'Fecha Inicio',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'price',
          header: 'Precio',
          type: 'currency',
          sortable: true,
          filterable: false,
          width: '100px'
        },
        {
          field: 'status',
          header: 'Estado',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        {
          id: 'view',
          label: 'Ver',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true
        },
        {
          id: 'confirm',
          label: 'Confirmar',
          icon: 'fa fa-check-circle',
          color: 'success',
          visible: (row) => row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED'
        },
        {
          id: 'reschedule',
          label: 'Reagendar',
          icon: 'fa fa-calendar',
          color: 'warning',
          visible: (row) => {
            if (row.canReschedule !== undefined) return row.canReschedule;
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED';
            if (!row.maxReschedulingDate) return false;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const limitDate = new Date(row.maxReschedulingDate + 'T00:00:00');
            limitDate.setHours(0, 0, 0, 0);
            return isActionable && now <= limitDate;
          }
        },
        {
          id: 'cancel',
          label: 'Cancelar',
          icon: 'fa fa-times-circle',
          color: 'danger',
          visible: (row) => {
            if (row.canCancel !== undefined) return row.canCancel;
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED';
            if (!row.maxCancellationDate) return false;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const limitDate = new Date(row.maxCancellationDate + 'T00:00:00');
            limitDate.setHours(0, 0, 0, 0);
            return isActionable && now <= limitDate;
          }
        },
        {
          id: 'complete',
          label: 'Completar',
          icon: 'fa fa-flag-checkered',
          color: 'primary',
          visible: (row) => row.status === 'Confirmed' || row.status === 'Upcoming'
        }
      ],
      filters: [
        {
          field: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'Upcoming', label: 'Próximas' },
            { value: 'Pending', label: 'Pendientes' },
            { value: 'Confirmed', label: 'Confirmadas' },
            { value: 'Cancelled', label: 'Canceladas' },
            { value: 'Completed', label: 'Completadas' }
          ]
        },
        {
          field: 'tourType',
          label: 'Tipo de Tour',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'Adventure', label: 'Aventura' },
            { value: 'Cultural', label: 'Cultural' },
            { value: 'Beach', label: 'Playa' },
            { value: 'City', label: 'Ciudad' },
            { value: 'Nature', label: 'Naturaleza' }
          ]
        },
        {
          field: 'customerName',
          label: 'Buscar Cliente',
          type: 'text'
        }
      ],
      canExport: true,
      canCreate: false,
      canEdit: true,
      canDelete: false
    };
  }

  /**
   * Configuración para el rol ADMIN (Backoffice)
   * - Ve todas las reservas de la plataforma
   * - Puede gestionar, aprobar y eliminar reservas
   */
  private getAdminConfig(): BookingManagementConfig {
    return {
      role: 'ADMIN',
      title: 'Administración de Reservas',
      subtitle: 'Vista completa de todas las reservas de la plataforma',
      apiEndpoint: '/api/v1/admin/bookings',
      columns: [
        {
          field: 'id',
          header: 'ID',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '100px'
        },
        {
          field: 'img',
          header: 'Tour',
          type: 'image',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'tourName',
          header: 'Nombre Tour',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'providerName',
          header: 'Proveedor',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '130px'
        },
        {
          field: 'customerName',
          header: 'Cliente',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '130px'
        },
        {
          field: 'travellers',
          header: 'Viajeros',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'checkInDate',
          header: 'Check-in',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '110px'
        },
        {
          field: 'price',
          header: 'Monto',
          type: 'currency',
          sortable: true,
          filterable: false,
          width: '100px'
        },
        {
          field: 'bookingDate',
          header: 'Fecha Reserva',
          type: 'date',
          sortable: true,
          filterable: false,
          width: '110px'
        },
        {
          field: 'status',
          header: 'Estado',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        {
          id: 'view',
          label: 'Ver',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true
        },
        {
          id: 'approve',
          label: 'Aprobar',
          icon: 'fa fa-check',
          color: 'success',
          visible: (row) => row.status === 'Pending'
        },
        {
          id: 'suspend',
          label: 'Suspender',
          icon: 'fa fa-pause-circle',
          color: 'warning',
          visible: (row) => row.status === 'Confirmed' || row.status === 'Upcoming'
        },
        {
          id: 'delete',
          label: 'Eliminar',
          icon: 'fa fa-trash',
          color: 'danger',
          visible: (row) => row.status === 'Cancelled'
        }
      ],
      filters: [
        {
          field: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'Upcoming', label: 'Próximas' },
            { value: 'Pending', label: 'Pendientes' },
            { value: 'Confirmed', label: 'Confirmadas' },
            { value: 'Cancelled', label: 'Canceladas' },
            { value: 'Completed', label: 'Completadas' }
          ]
        },
        {
          field: 'providerName',
          label: 'Proveedor',
          type: 'text'
        },
        {
          field: 'customerName',
          label: 'Cliente',
          type: 'text'
        },
        {
          field: 'dateRange',
          label: 'Rango de Fechas',
          type: 'dateRange'
        }
      ],
      canExport: true,
      canCreate: false,
      canEdit: true,
      canDelete: true
    };
  }
}
