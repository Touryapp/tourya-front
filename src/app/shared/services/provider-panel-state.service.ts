import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ProviderPanelView = 'dashboard' | 'tours' | 'templates' | 'reservas' | 'reviews' | 'pagos';

@Injectable({
  providedIn: 'root'
})
export class ProviderPanelStateService {
  private currentViewSubject = new BehaviorSubject<ProviderPanelView>('dashboard');
  public currentView$: Observable<ProviderPanelView> = this.currentViewSubject.asObservable();

  /**
   * Cambia la vista activa del panel de proveedor
   */
  setView(view: ProviderPanelView): void {
    this.currentViewSubject.next(view);
  }

  /**
   * Obtiene la vista actual
   */
  getCurrentView(): ProviderPanelView {
    return this.currentViewSubject.value;
  }
}
