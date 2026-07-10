import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AppConfigService, RawConfigValue } from '../../../shared/services/app-config.service';

type ConfigInputType = 'number' | 'boolean';

/**
 * Grupo visual para agrupar configs relacionadas en la UI. Puramente
 * cosmetico; no tiene efecto en el backend.
 */
interface ConfigGroup {
  labelKey: string;
  items: ConfigItem[];
}

/**
 * Metadata de una config configurable via este panel. La lista completa se
 * define abajo en CONFIG_GROUPS. Nombre y descripcion se resuelven via
 * ngx-translate.
 */
interface ConfigItem {
  key: string;
  labelKey: string;
  descriptionKey: string;
  type: ConfigInputType;
  currentValue: number | null;
  originalValue: number | null;
  loading: boolean;
  saving: boolean;
  errorLoading: boolean;
}

/**
 * Lista fija de configuraciones escalares/booleanas que este panel puede editar.
 * Se excluye CANCELLATION_POLICY porque su formato es JSON i18n complejo y
 * merece un editor dedicado (v2).
 */
const CONFIG_GROUPS: ConfigGroup[] = [
  {
    labelKey: 'app-config-admin.groups.booking',
    items: [
      {
        key: 'HOLD_MINUTES',
        labelKey: 'app-config-admin.holdMinutes.label',
        descriptionKey: 'app-config-admin.holdMinutes.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      }
    ]
  },
  {
    labelKey: 'app-config-admin.groups.payoutsAndCredits',
    items: [
      {
        key: 'PAYOUT_BUFFER_DAYS',
        labelKey: 'app-config-admin.payoutBufferDays.label',
        descriptionKey: 'app-config-admin.payoutBufferDays.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'CREDIT_EXPIRATION_MONTHS',
        labelKey: 'app-config-admin.creditExpirationMonths.label',
        descriptionKey: 'app-config-admin.creditExpirationMonths.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      }
    ]
  },
  {
    labelKey: 'app-config-admin.groups.gallery',
    items: [
      {
        key: 'GALLERY_MAX_SIZE_MB',
        labelKey: 'app-config-admin.galleryMaxSizeMb.label',
        descriptionKey: 'app-config-admin.galleryMaxSizeMb.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'GALLERY_MIN_WIDTH_PX',
        labelKey: 'app-config-admin.galleryMinWidthPx.label',
        descriptionKey: 'app-config-admin.galleryMinWidthPx.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'GALLERY_MAX_IMAGES_PER_TOUR',
        labelKey: 'app-config-admin.galleryMaxImagesPerTour.label',
        descriptionKey: 'app-config-admin.galleryMaxImagesPerTour.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      }
    ]
  },
  {
    labelKey: 'app-config-admin.groups.kybDocs',
    items: [
      {
        key: 'KYB_REQUIRE_MANDATORY_DOCS',
        labelKey: 'app-config-admin.kybRequireMandatoryDocs.label',
        descriptionKey: 'app-config-admin.kybRequireMandatoryDocs.description',
        type: 'boolean',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      }
    ]
  },
  {
    labelKey: 'app-config-admin.groups.authProtection',
    items: [
      {
        key: 'AUTH_RATE_LIMIT_ENABLED',
        labelKey: 'app-config-admin.authRateLimitEnabled.label',
        descriptionKey: 'app-config-admin.authRateLimitEnabled.description',
        type: 'boolean',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'AUTH_RATE_LIMIT_PER_MINUTE',
        labelKey: 'app-config-admin.authRateLimitPerMinute.label',
        descriptionKey: 'app-config-admin.authRateLimitPerMinute.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'AUTH_LOCKOUT_ENABLED',
        labelKey: 'app-config-admin.authLockoutEnabled.label',
        descriptionKey: 'app-config-admin.authLockoutEnabled.description',
        type: 'boolean',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'AUTH_LOCKOUT_MAX_ATTEMPTS',
        labelKey: 'app-config-admin.authLockoutMaxAttempts.label',
        descriptionKey: 'app-config-admin.authLockoutMaxAttempts.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      },
      {
        key: 'AUTH_LOCKOUT_BASE_BACKOFF_SECONDS',
        labelKey: 'app-config-admin.authLockoutBaseBackoffSeconds.label',
        descriptionKey: 'app-config-admin.authLockoutBaseBackoffSeconds.description',
        type: 'number',
        currentValue: null, originalValue: null, loading: true, saving: false, errorLoading: false
      }
    ]
  }
];

@Component({
  selector: 'app-app-config-admin',
  templateUrl: './app-config-admin.component.html',
  styleUrls: ['./app-config-admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class AppConfigAdminComponent implements OnInit {

  groups: ConfigGroup[] = JSON.parse(JSON.stringify(CONFIG_GROUPS));

  constructor(
    private appConfigService: AppConfigService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAllConfigs();
  }

  /**
   * Carga en paralelo el valor actual de cada config declarada.
   * Los errores individuales se marcan por-fila sin bloquear las demas
   * (util si por alguna razon una key todavia no fue seeded).
   */
  private loadAllConfigs(): void {
    const requests = this.allItems().map(item =>
      this.appConfigService.getConfig(item.key).pipe(
        map((raw: RawConfigValue) => ({ item, raw, ok: true as const })),
        catchError(() => of({ item, raw: null, ok: false as const }))
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach(({ item, raw, ok }) => {
        item.loading = false;
        if (!ok || !raw) {
          item.errorLoading = true;
          return;
        }
        const extracted = this.extractScalar(raw);
        item.currentValue = extracted;
        item.originalValue = extracted;
      });
    });
  }

  private allItems(): ConfigItem[] {
    return this.groups.flatMap(g => g.items);
  }

  /**
   * Extrae el numero del JSON crudo. El backend usa la convencion
   * { "value": N } para escalares. Si el formato es distinto retornamos
   * null y la fila se marca como error de lectura.
   */
  private extractScalar(raw: RawConfigValue): number | null {
    const v = (raw as { value?: unknown }).value;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const parsed = Number(v);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  isDirty(item: ConfigItem): boolean {
    return item.currentValue !== item.originalValue;
  }

  save(item: ConfigItem): void {
    if (item.saving || !this.isDirty(item) || item.currentValue === null) return;
    item.saving = true;

    this.appConfigService.updateConfig(item.key, { value: item.currentValue })
      .pipe(finalize(() => (item.saving = false)))
      .subscribe({
        next: () => {
          item.originalValue = item.currentValue;
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('app-config-admin.swal.savedTitle'),
            text: this.translate.instant('app-config-admin.swal.savedText', { key: item.key }),
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          const message = err?.error?.error ?? err?.message ?? 'error';
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('app-config-admin.swal.errorTitle'),
            text: this.translate.instant('app-config-admin.swal.errorText', { key: item.key, message })
          });
        }
      });
  }

  resetItem(item: ConfigItem): void {
    item.currentValue = item.originalValue;
  }

  /**
   * Toggle 0/1 para inputs de tipo boolean; el modelo del backend usa
   * enteros (0=OFF, 1=ON) porque asi convive con el metodo AppConfigService.getInt.
   */
  toggleBoolean(item: ConfigItem): void {
    if (item.currentValue === null) return;
    item.currentValue = item.currentValue === 1 ? 0 : 1;
  }
}
