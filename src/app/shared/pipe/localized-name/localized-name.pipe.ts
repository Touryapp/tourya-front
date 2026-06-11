import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { I18nFieldService } from '../../services/i18n-field.service';

@Pipe({
  name: 'localizedName',
  standalone: true,
  pure: false
})
export class LocalizedNamePipe implements PipeTransform, OnDestroy {
  private langChangeSub: Subscription;

  constructor(private translate: TranslateService, private cdr: ChangeDetectorRef, private i18nService: I18nFieldService) {
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(nameObj: any): string {
    if (!nameObj) return '';
    
    console.log('[LocalizedNamePipe] transform called with:', nameObj, 'Current Lang:', this.i18nService.getCurrentLanguage());

    if (typeof nameObj === 'string') {
      try {
        const parsed = JSON.parse(nameObj);
        return this.i18nService.getValue(parsed);
      } catch(e) {
        // Not a JSON string, try to translate as a known literal (categories/subcategories)
        const normalized = nameObj.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
        
        const catKey = `categories.${normalized}`;
        const translatedCat = this.translate.instant(catKey);
        if (translatedCat !== catKey && translatedCat) return translatedCat;
        
        const subcatKey = `subcategories.${normalized}`;
        const translatedSubcat = this.translate.instant(subcatKey);
        if (translatedSubcat !== subcatKey && translatedSubcat) return translatedSubcat;

        // Try direct translation just in case
        const directTranslation = this.translate.instant(nameObj);
        if (directTranslation !== nameObj && directTranslation) return directTranslation;

        return nameObj;
      }
    }
    
    return this.i18nService.getValue(nameObj);
  }

  ngOnDestroy() {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
