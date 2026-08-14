import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TravelConciergeService } from '../../services/travel-concierge.service';
import {
  ConciergeAction,
  ConciergeChatContext,
  ConciergeChatMessage,
  ConciergeChatResponse,
} from '../../models/concierge.model';

/**
 * Widget flotante del Travel Concierge (FE-Concierge).
 *
 * FAB colapsado en bottom-right; al expandir muestra panel 380x500
 * (full-screen en <640px). Renderiza el historial de la sesion en memoria
 * (no persiste) y muestra chips de las acciones ejecutadas por el LLM.
 *
 * NUNCA expone `fraudSuspected` al usuario — solo trackea internamente.
 * Si `escalatedToHuman=true`, oculta el input y muestra el banner de handoff.
 */
@Component({
  selector: 'app-concierge-chat-widget',
  standalone: false,
  templateUrl: './concierge-chat-widget.component.html',
  styleUrls: ['./concierge-chat-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConciergeChatWidgetComponent implements OnInit, OnDestroy {
  @Input() tourId?: number;
  @Input() cartId?: number;

  @ViewChild('messagesEnd') private messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLTextAreaElement>;

  isOpen = false;
  isBusy = false;
  escalated = false;
  input = '';
  messages: ConciergeChatMessage[] = [];

  private destroy$ = new Subject<void>();
  private welcomeMessageAdded = false;

  constructor(
    private concierge: TravelConciergeService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.addWelcomeMessage();
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Al cambiar de idioma, si solo hay el welcome, lo reemplazamos.
        if (this.messages.length === 1 && this.messages[0].role === 'assistant') {
          this.messages = [this.buildWelcomeMessage()];
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.scrollToBottom();
        this.inputEl?.nativeElement?.focus();
      }, 50);
    }
  }

  close(): void {
    this.isOpen = false;
  }

  onInputKeydown(event: KeyboardEvent): void {
    // Enter envia, Shift+Enter hace salto de linea.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = (this.input || '').trim();
    if (!text || this.isBusy || this.escalated) {
      return;
    }

    const userMessage: ConciergeChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    this.messages = [...this.messages, userMessage];
    this.input = '';
    this.isBusy = true;
    this.cdr.markForCheck();
    setTimeout(() => this.scrollToBottom(), 20);

    const ctx = this.buildContext();
    this.concierge
      .chat(text, ctx)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ConciergeChatResponse) => this.handleResponse(response),
        error: () => this.handleError(),
      });
  }

  /**
   * Devuelve solo las acciones "visibles" para el usuario
   * (chips search_tours con resumen, add_to_cart exitoso o fallido).
   */
  visibleActions(msg: ConciergeChatMessage): ConciergeAction[] {
    if (!msg.actions || msg.actions.length === 0) {
      return [];
    }
    return msg.actions.filter((a) => this.isRenderableAction(a));
  }

  actionLabel(action: ConciergeAction): string {
    if (action.type === 'search_tours') {
      const count = this.extractSearchCount(action);
      if (count != null) {
        return this.translate.instant('concierge.action.searched', { count });
      }
      return action.resultSummary || this.translate.instant('concierge.action.searched', { count: '?' });
    }
    if (action.type === 'add_to_cart') {
      return action.success
        ? this.translate.instant('concierge.action.addedToCart')
        : this.translate.instant('concierge.action.cartFailed');
    }
    return action.resultSummary || action.type;
  }

  actionClass(action: ConciergeAction): string {
    if (action.type === 'add_to_cart') {
      return action.success ? 'chip chip-success' : 'chip chip-danger';
    }
    if (action.type === 'search_tours') {
      return 'chip chip-info';
    }
    return 'chip';
  }

  trackMessage(index: number, msg: ConciergeChatMessage): number {
    return msg.timestamp;
  }

  trackAction(index: number, _action: ConciergeAction): number {
    return index;
  }

  private handleResponse(response: ConciergeChatResponse): void {
    const assistant: ConciergeChatMessage = {
      role: 'assistant',
      content: response.assistantMessage || '',
      actions: response.actionsExecuted || [],
      escalated: response.escalatedToHuman === true,
      timestamp: Date.now(),
    };
    this.messages = [...this.messages, assistant];
    if (response.escalatedToHuman === true) {
      this.escalated = true;
    }
    this.isBusy = false;
    this.cdr.markForCheck();
    setTimeout(() => this.scrollToBottom(), 20);
  }

  private handleError(): void {
    const errorMsg: ConciergeChatMessage = {
      role: 'assistant',
      content: this.translate.instant('concierge.error'),
      timestamp: Date.now(),
    };
    this.messages = [...this.messages, errorMsg];
    this.isBusy = false;
    this.cdr.markForCheck();
    setTimeout(() => this.scrollToBottom(), 20);
  }

  private buildContext(): ConciergeChatContext | undefined {
    const ctx: ConciergeChatContext = {};
    if (this.tourId != null) ctx.tourId = this.tourId;
    if (this.cartId != null) ctx.cartId = this.cartId;
    return Object.keys(ctx).length > 0 ? ctx : undefined;
  }

  private addWelcomeMessage(): void {
    if (this.welcomeMessageAdded) return;
    this.messages = [this.buildWelcomeMessage()];
    this.welcomeMessageAdded = true;
  }

  private buildWelcomeMessage(): ConciergeChatMessage {
    return {
      role: 'assistant',
      content: this.translate.instant('concierge.welcome'),
      timestamp: Date.now(),
    };
  }

  private scrollToBottom(): void {
    const el = this.messagesEnd?.nativeElement;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  private isRenderableAction(action: ConciergeAction): boolean {
    return action.type === 'search_tours' || action.type === 'add_to_cart';
  }

  private extractSearchCount(action: ConciergeAction): number | null {
    // Preferencia: params.count numerico -> resultSummary "N tours ..." -> null
    const params = action.params || {};
    const rawCount = params['count'];
    if (typeof rawCount === 'number' && Number.isFinite(rawCount)) {
      return rawCount;
    }
    if (typeof action.resultSummary === 'string') {
      const match = action.resultSummary.match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n)) return n;
      }
    }
    return null;
  }
}
