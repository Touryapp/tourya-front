import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ProviderPanelView = 'dashboard' | 'tours' | 'templates' | 'reservas' | 'reviews' | 'pagos' | 'perfil';

@Injectable({
  providedIn: 'root'
})
export class ProviderPanelStateService {
  private getInitialView(): ProviderPanelView {
    const saved = sessionStorage.getItem('providerPanelView') as ProviderPanelView;
    return saved || 'dashboard';
  }

  private currentViewSubject = new BehaviorSubject<ProviderPanelView>(this.getInitialView());
  public currentView$: Observable<ProviderPanelView> = this.currentViewSubject.asObservable();
  
  private reservationToOpen: number | string | null = null;
  private returnToPaymentId: number | null = null;
  private paymentToOpen: number | null = null;
  private returnToReviews: boolean = false;

  /**
   * Cambia la vista activa del panel de proveedor
   */
  setView(view: ProviderPanelView): void {
    sessionStorage.setItem('providerPanelView', view);
    this.currentViewSubject.next(view);
  }

  /**
   * Obtiene la vista actual
   */
  getCurrentView(): ProviderPanelView {
    return this.currentViewSubject.value;
  }

  setReservationToOpen(reservationId: number | string | null): void {
    this.reservationToOpen = reservationId;
  }

  getReservationToOpen(): number | string | null {
    const id = this.reservationToOpen;
    this.reservationToOpen = null; // Auto-clear after reading
    return id;
  }

  setReturnToPayment(paymentId: number | null): void {
    this.returnToPaymentId = paymentId;
  }

  getReturnToPayment(): number | null {
    const id = this.returnToPaymentId;
    this.returnToPaymentId = null; // Auto-clear after reading
    return id;
  }

  setPaymentToOpen(paymentId: number | null): void {
    this.paymentToOpen = paymentId;
  }

  hasPaymentToOpen(): boolean {
    return this.paymentToOpen !== null;
  }

  getPaymentToOpen(): number | null {
    const id = this.paymentToOpen;
    this.paymentToOpen = null; // Auto-clear after reading
    return id;
  }

  setReturnToReviews(value: boolean): void {
    this.returnToReviews = value;
  }

  getReturnToReviews(): boolean {
    const value = this.returnToReviews;
    this.returnToReviews = false; // Auto-clear
    return value;
  }
}
