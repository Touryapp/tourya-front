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
      title: 'provider-tour-management.config.clientTitle',
      subtitle: 'provider-tour-management.config.clientSubtitle',
      apiEndpoint: '/api/v1/client/bookings',
      columns: [
        {
          field: 'id',
          header: 'provider-tour-management.config.columns.id',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'tourName',
          header: 'provider-tour-management.config.columns.tourName',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '200px'
        },
        {
          field: 'customerName',
          header: 'provider-tour-management.config.columns.customer',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'checkInDate',
          header: 'provider-tour-management.config.columns.checkInDate',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'price',
          header: 'provider-tour-management.config.columns.price',
          type: 'currency',
          sortable: true,
          filterable: false,
          width: '100px'
        },
        {
          field: 'status',
          header: 'provider-tour-management.config.columns.status',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        {
          id: 'view',
          label: 'provider-tour-management.config.actions.view',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true // Siempre visible
        },
        {
          id: 'reschedule',
          label: 'provider-tour-management.config.actions.reschedule',
          icon: 'fa fa-calendar',
          color: 'warning',
          visible: (row) => {
            // Use the new canReschedule field from API if available
            if (row.canReschedule !== undefined) {
              return row.canReschedule;
            }
            
            // Fallback to legacy logic if canReschedule is not present
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED' || row.status === 'Rescheduled';
            
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
          label: 'provider-tour-management.config.actions.cancel',
          icon: 'fa fa-times-circle',
          color: 'danger',
          visible: (row) => {
            // Use the new canCancel field from API if available
            if (row.canCancel !== undefined) {
              return row.canCancel;
            }

            // Check if status is Pending or Rescheduled
            const isActionable = row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED' || row.status === 'Rescheduled';
            
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
          label: 'provider-tour-management.config.filters.status',
          type: 'select',
          options: [
            { value: '', label: 'provider-tour-management.config.filters.statusAll' },
            { value: 'PENDING', label: 'provider-tour-management.config.filters.statusPending' },
            { value: 'RESERVED', label: 'provider-tour-management.config.filters.statusReserved' },
            { value: 'IN_TRANSIT', label: 'provider-tour-management.config.filters.statusInTransit' },
            { value: 'DELIVERED', label: 'provider-tour-management.config.filters.statusDelivered' },
            { value: 'CANCELED', label: 'provider-tour-management.config.filters.statusCanceled' },
            { value: 'RESCHEDULED', label: 'provider-tour-management.config.filters.statusRescheduled' },
            { value: 'TEMPORAL', label: 'provider-tour-management.config.filters.statusTemporal' },
            { value: 'NO_SHOW', label: 'provider-tour-management.config.filters.statusNoShow' }
          ]
        },
        {
          field: 'dateRange',
          label: 'provider-tour-management.config.filters.dateRange',
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
      title: 'provider-tour-management.config.providerTitle',
      subtitle: 'provider-tour-management.config.providerSubtitle',
      apiEndpoint: '/api/v1/provider/bookings',
      columns: [
        {
          field: 'id',
          header: 'provider-tour-management.config.columns.id',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'tourName',
          header: 'provider-tour-management.config.columns.tourName',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '200px'
        },
        {
          field: 'customerName',
          header: 'provider-tour-management.config.columns.customer',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'checkInDate',
          header: 'provider-tour-management.config.columns.checkInDate',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '120px'
        },
        {
          field: 'price',
          header: 'provider-tour-management.config.columns.price',
          type: 'currency',
          sortable: true,
          filterable: false,
          width: '100px'
        },
        {
          field: 'status',
          header: 'provider-tour-management.config.columns.status',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        {
          id: 'view',
          label: 'provider-tour-management.config.actions.view',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true
        },
        {
          id: 'confirm',
          label: 'provider-tour-management.config.actions.confirm',
          icon: 'fa fa-check-circle',
          color: 'success',
          visible: (row) => {
            if (row.canConfirmReservation !== undefined) return row.canConfirmReservation;
            return row.status === 'Pending' || row.status === 'PENDING' || row.status === 'RESCHEDULED' || row.status === 'Rescheduled';
          }
        },
        {
          id: 'reschedule',
          label: 'provider-tour-management.config.actions.reschedule',
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
          label: 'provider-tour-management.config.actions.cancel',
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
          label: 'provider-tour-management.config.actions.complete',
          icon: 'fa fa-flag-checkered',
          color: 'primary',
          visible: (row) => row.status === 'Confirmed' || row.status === 'Upcoming'
        },
        {
          // FE-24 (BE-24 Fase 1 / RN-055): provider avisa que no puede atender la reserva.
          // Backend cancela + crea credito + envia email alternativas. Solo aplica sobre
          // reservas activas — mismos estados que 'cancel'.
          id: 'decline',
          label: 'provider-tour-management.config.actions.decline',
          icon: 'fa fa-user-times',
          color: 'warning',
          visible: (row) => {
            const isActionable = row.status === 'Pending' || row.status === 'PENDING'
              || row.status === 'RESCHEDULED' || row.status === 'Rescheduled';
            if (!isActionable) return false;
            // TC-007 (#194 scope extra): esconder el boton si el scheduleDate ya paso.
            // El endpoint backend tambien lo rechaza con 400. La reserva debe pasar a
            // NO_SHOW via job, no via decline manual.
            const rawDate: string | undefined = row.rawCheckInDate;
            if (!rawDate) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const scheduleDate = new Date(rawDate + 'T00:00:00');
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate.getTime() >= today.getTime();
          }
        }
      ],
      filters: [
        {
          field: 'status',
          label: 'provider-tour-management.config.filters.status',
          type: 'select',
          options: [
            { value: '', label: 'provider-tour-management.config.filters.statusAll' },
            { value: 'PENDING', label: 'provider-tour-management.config.filters.statusPending' },
            { value: 'RESERVED', label: 'provider-tour-management.config.filters.statusReserved' },
            { value: 'IN_TRANSIT', label: 'provider-tour-management.config.filters.statusInTransit' },
            { value: 'DELIVERED', label: 'provider-tour-management.config.filters.statusDelivered' },
            { value: 'CANCELED', label: 'provider-tour-management.config.filters.statusCanceled' },
            { value: 'RESCHEDULED', label: 'provider-tour-management.config.filters.statusRescheduled' },
            { value: 'TEMPORAL', label: 'provider-tour-management.config.filters.statusTemporal' },
            { value: 'NO_SHOW', label: 'provider-tour-management.config.filters.statusNoShow' }
          ]
        },
        {
          field: 'tourType',
          label: 'provider-tour-management.config.filters.tourType',
          type: 'select',
          options: [
            { value: '', label: 'provider-tour-management.config.filters.typeAll' },
            { value: 'Adventure', label: 'provider-tour-management.config.filters.typeAdventure' },
            { value: 'Cultural', label: 'provider-tour-management.config.filters.typeCultural' },
            { value: 'Beach', label: 'provider-tour-management.config.filters.typeBeach' },
            { value: 'City', label: 'provider-tour-management.config.filters.typeCity' },
            { value: 'Nature', label: 'provider-tour-management.config.filters.typeNature' }
          ]
        },
        {
          field: 'customerName',
          label: 'provider-tour-management.config.filters.searchCustomer',
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
      title: 'provider-tour-management.config.adminTitle',
      subtitle: 'provider-tour-management.config.adminSubtitle',
      apiEndpoint: '/api/v1/admin/bookings',
      columns: [
        {
          field: 'id',
          header: 'provider-tour-management.config.columns.idShort',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '100px'
        },
        {
          field: 'img',
          header: 'provider-tour-management.config.columns.tour',
          type: 'image',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'tourName',
          header: 'provider-tour-management.config.columns.tourNameShort',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '150px'
        },
        {
          field: 'providerName',
          header: 'provider-tour-management.config.columns.provider',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '130px'
        },
        {
          field: 'customerName',
          header: 'provider-tour-management.config.columns.customer',
          type: 'text',
          sortable: true,
          filterable: true,
          width: '130px'
        },
        {
          field: 'travellers',
          header: 'provider-tour-management.config.columns.travellers',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '80px'
        },
        {
          field: 'checkInDate',
          header: 'provider-tour-management.config.columns.checkIn',
          type: 'date',
          sortable: true,
          filterable: true,
          width: '110px'
        },
        {
          // TC-005 refinamientos (#188): renderizado especial en template — dual badge Cliente + Provider.
          field: 'priceDual',
          header: 'provider-tour-management.config.columns.amount',
          type: 'text',
          sortable: false,
          filterable: false,
          width: '180px'
        },
        // TC-005 refinamientos (#188): columna "Fecha de Reserva" eliminada — Luis clarifico
        // que en realidad mostraba la fecha de compra y no aporta valor en la lista.
        {
          field: 'status',
          header: 'provider-tour-management.config.columns.status',
          type: 'status',
          sortable: true,
          filterable: true,
          width: '120px'
        }
      ],
      actions: [
        // TC-005 refinamientos (#188): Luis pidio "ADMIN solo visualiza". Quitados los botones
        // Confirmar/Aprobar/Suspender/Eliminar. Solo queda "Ver" (modal de detalle).
        {
          id: 'view',
          label: 'provider-tour-management.config.actions.view',
          icon: 'fa fa-eye',
          color: 'info',
          visible: (row) => true
        }
      ],
      filters: [
        {
          field: 'status',
          label: 'provider-tour-management.config.filters.status',
          type: 'select',
          options: [
            { value: '', label: 'provider-tour-management.config.filters.statusAll' },
            { value: 'PENDING', label: 'provider-tour-management.config.filters.statusPending' },
            { value: 'RESERVED', label: 'provider-tour-management.config.filters.statusReserved' },
            { value: 'IN_TRANSIT', label: 'provider-tour-management.config.filters.statusInTransit' },
            { value: 'DELIVERED', label: 'provider-tour-management.config.filters.statusDelivered' },
            { value: 'CANCELED', label: 'provider-tour-management.config.filters.statusCanceled' },
            { value: 'RESCHEDULED', label: 'provider-tour-management.config.filters.statusRescheduled' },
            { value: 'TEMPORAL', label: 'provider-tour-management.config.filters.statusTemporal' },
            { value: 'NO_SHOW', label: 'provider-tour-management.config.filters.statusNoShow' }
          ]
        },
        {
          field: 'providerName',
          label: 'provider-tour-management.config.filters.provider',
          type: 'text'
        },
        {
          field: 'customerName',
          label: 'provider-tour-management.config.filters.customer',
          type: 'text'
        },
        {
          field: 'dateRange',
          label: 'provider-tour-management.config.filters.dateRange',
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
