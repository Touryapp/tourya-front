import { Injectable } from '@angular/core';

export interface PendingCartAction {
  tourId: number;
  dayId: number;
  slotId: number;
  selectedDate: Date;
  participants: any[];
  totalPrice: number;
  returnUrl: string; // URL para volver después del login
}

@Injectable({
  providedIn: 'root'
})
export class PendingActionService {
  private readonly STORAGE_KEY = 'pendingCartAction';

  /**
   * Guardar acción pendiente en sessionStorage
   */
  setPendingCartAction(action: PendingCartAction): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(action));
    console.log('💾 Acción pendiente guardada:', action);
  }

  /**
   * Obtener acción pendiente
   */
  getPendingCartAction(): PendingCartAction | null {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parseando acción pendiente:', error);
        this.clearPendingAction();
      }
    }
    return null;
  }

  /**
   * Verificar si hay acción pendiente
   */
  hasPendingAction(): boolean {
    return !!this.getPendingCartAction();
  }

  /**
   * Limpiar acción pendiente
   */
  clearPendingAction(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Acción pendiente eliminada');
  }
}
