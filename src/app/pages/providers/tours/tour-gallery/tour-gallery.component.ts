import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { catchError, forkJoin, of } from "rxjs";
import Swal from "sweetalert2";

import { TourService } from "../tour.service";
import { Gallery, Tour } from "../../../../shared/dto/tour-response.dto";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";
import {
  AppConfigService,
  RawConfigValue,
} from "../../../../shared/services/app-config.service";
import { OperatorSupportService } from "../../../../shared/services/operator-support.service";
import {
  GalleryValidationIssue,
  ImageMetadata,
} from "../../../../shared/models/operator-support.model";

interface GalleryLimits {
  maxSizeMb: number;
  minWidthPx: number;
  maxImagesPerTour: number;
}

interface GalleryIssue {
  fileName: string;
  code: string;
  message?: string;
  severity?: string;
}

const DEFAULT_LIMITS: GalleryLimits = {
  maxSizeMb: 5,
  minWidthPx: 800,
  maxImagesPerTour: 7,
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

@Component({
  selector: "app-tour-gallery",
  standalone: false,
  templateUrl: "./tour-gallery.component.html",
  styleUrl: "./tour-gallery.component.scss",
})
export class TourGalleryComponent implements OnInit {
  tourId: number = 0;
  tour: Tour | null = null;

  tourGalleryForm: FormGroup;

  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = "";

  limits: GalleryLimits = { ...DEFAULT_LIMITS };

  // IA-07 (Operator Support) — sugerencias del backend post-validate-gallery.
  aiGallerySuggestions: string[] = [];
  aiGalleryInlineIssues: GalleryValidationIssue[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tourService: TourService,
    private _snackBar: MatSnackBar,
    public i18nService: I18nFieldService,
    private appConfigService: AppConfigService,
    private translate: TranslateService,
    private operatorSupport: OperatorSupportService
  ) {
    this.tourId = +(this.route.snapshot.paramMap.get("id") || 0);

    this.tourGalleryForm = this.fb.group({
      galleries: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loadLimits();
    this.getTour();
    this.getTourGalleries();
  }

  get galleries(): FormArray {
    return this.tourGalleryForm.get("galleries") as FormArray;
  }

  private loadLimits(): void {
    forkJoin({
      maxSizeMb: this.appConfigService.getConfig("GALLERY_MAX_SIZE_MB").pipe(
        catchError(() => of(null))
      ),
      minWidthPx: this.appConfigService.getConfig("GALLERY_MIN_WIDTH_PX").pipe(
        catchError(() => of(null))
      ),
      maxImagesPerTour: this.appConfigService
        .getConfig("GALLERY_MAX_IMAGES_PER_TOUR")
        .pipe(catchError(() => of(null))),
    }).subscribe((values) => {
      this.limits = {
        maxSizeMb: this.readNumber(values.maxSizeMb, DEFAULT_LIMITS.maxSizeMb),
        minWidthPx: this.readNumber(
          values.minWidthPx,
          DEFAULT_LIMITS.minWidthPx
        ),
        maxImagesPerTour: this.readNumber(
          values.maxImagesPerTour,
          DEFAULT_LIMITS.maxImagesPerTour
        ),
      };
    });
  }

  private readNumber(raw: RawConfigValue | null, fallback: number): number {
    const value = raw?.["value"];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    return fallback;
  }

  newGallery(): FormGroup {
    return this.fb.group({
      id: [],
      imageUrl: ["", []],
      description: ["", [Validators.required]],
      orderIndex: ["", [Validators.required]],
      file: [null, []],
    });
  }

  addGallery() {
    if (this.galleries.valid) {
      this.galleries.push(this.newGallery());
    }
  }

  removeGallery(index: number) {
    this.galleries.removeAt(index);
  }

  getTour() {
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data) => {
        if (data) {
          this.tour = data;
        }
      },
      error: (err) => {
        console.error("Error getting tour.");
        console.error(err);
      },
    });
  }

  getTourGalleries() {
    this.tourService.getTourGalleries(this.tourId).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.loadGalleries(data);
        }
      },
      error: (err) => {
        console.error("Error getting tour galleries.");
        console.error(err);
      },
    });
  }

  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.errorMessage = "";
    this.tourGalleryForm.markAllAsTouched();

    if (this.tourGalleryForm.valid) {
      const { galleries } = this.tourGalleryForm.value;

      const newFiles = galleries
        .filter((gallery: any) => gallery.file)
        .map((gallery: any) => {
          return gallery.file;
        });

      const galleryMap = galleries.map((gallery: any) => {
        return {
          ...gallery,
          id: gallery.id ? gallery.id : undefined,
          imageUrl: gallery.id ? gallery.imageUrl : undefined,
          description: this.i18nService.createI18nField(gallery.description),
          file: undefined,
        };
      });

      this.tourService
        .saveTourGallery(this.tourId, newFiles, galleryMap)
        .subscribe({
          next: (data) => {
            this.loading = false;

            if (data && Array.isArray(data)) {
              this.galleries.reset();

              this.loadGalleries(data);

              this._snackBar.open("Gallery successfully updated", "", {
                duration: 5000,
              });
            } else {
              this.errorMessage = this.translate.instant(
                "tour-gallery.errors.generic"
              );
            }
          },
          error: (err: HttpErrorResponse) => {
            this.loading = false;
            console.error("Error saving tour gallery.");
            console.error(err);
            this.handleBackendError(err);
          },
        });
    } else {
      this.loading = false;
    }
  }

  loadGalleries(data: Gallery[]) {
    data
      .filter((gallery) => !!gallery)
      .sort((galleryA, galleryB) => {
        return (galleryA.orderIndex || 0) - (galleryB.orderIndex || 0);
      })
      .map((gallery, index) => {
        this.addGallery();

        this.galleries.at(index).patchValue({
          id: gallery?.id,
          imageUrl: gallery?.imageUrl,
          description: this.i18nService.getValue(gallery?.description),
          orderIndex: gallery?.orderIndex,
        });
      });
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    const files: FileList | null = input.files;
    if (!files || files.length === 0) {
      return;
    }

    const filesArray = Array.from(files);
    const rejectedIssues: GalleryIssue[] = [];

    const remainingSlots = Math.max(
      0,
      this.limits.maxImagesPerTour - this.galleries.length
    );

    const filesToInspect = filesArray.slice(0, remainingSlots);
    const filesOverflow = filesArray.slice(remainingSlots);
    filesOverflow.forEach((file) =>
      rejectedIssues.push({ fileName: file.name, code: "TOO_MANY_IMAGES" })
    );

    const asyncCandidates: File[] = [];
    filesToInspect.forEach((file) => {
      const syncIssue = this.validateSyncRules(file);
      if (syncIssue) {
        rejectedIssues.push(syncIssue);
      } else {
        asyncCandidates.push(file);
      }
    });

    const finish = () => {
      if (rejectedIssues.length > 0) {
        this.showIssuesModal(rejectedIssues);
      }
      input.value = "";
    };

    if (asyncCandidates.length === 0) {
      finish();
      return;
    }

    Promise.all(
      asyncCandidates.map((file) => this.validateDimensions(file))
    ).then((results) => {
      const passed: { file: File; width: number; height: number }[] = [];
      results.forEach((result) => {
        if (result.issue) {
          rejectedIssues.push(result.issue);
        } else if (result.width && result.height) {
          passed.push({ file: result.file, width: result.width, height: result.height });
        }
      });

      // IA-07: valida los candidatos que pasaron los checks locales contra el
      // backend antes de adjuntarlos al formulario. El backend puede detectar
      // reglas adicionales (proporcion, cantidad, warnings) que el cliente no
      // reimplementa. Ver validate-gallery en IA-07.
      this.remoteValidateGallery(passed).then((result) => {
        // Issues CRITICAL rechazan el archivo correspondiente antes del upload.
        // Los WARN se muestran inline (no bloquean el flujo).
        const inlineIssues: GalleryValidationIssue[] = [];
        result.issues.forEach((iss) => {
          if (iss.severity === 'CRITICAL' && typeof iss.fileIndex === 'number') {
            const bad = passed[iss.fileIndex];
            rejectedIssues.push({
              fileName: bad?.file?.name || `#${iss.fileIndex + 1}`,
              code: iss.code || 'IMAGE_INVALID',
              message: iss.message,
              severity: 'CRITICAL',
            });
          } else {
            inlineIssues.push(iss);
          }
        });

        // Attach solo los que no quedaron marcados como CRITICAL por el backend.
        const criticalIndexes = new Set(
          result.issues
            .filter((i) => i.severity === 'CRITICAL' && typeof i.fileIndex === 'number')
            .map((i) => i.fileIndex as number)
        );
        passed.forEach((candidate, idx) => {
          if (!criticalIndexes.has(idx)) {
            this.attachFileToForm(candidate.file);
          }
        });

        this.aiGalleryInlineIssues = inlineIssues;
        this.aiGallerySuggestions = result.suggestions;
        finish();
      });
    });
  }

  /**
   * IA-07: llama POST /agents/operator-support/validate-gallery con la metadata
   * de los archivos que pasaron los checks locales. NO reimplementa la validacion
   * en el cliente (regla del brief).
   *
   * Fallo silencioso: si el endpoint no responde, no bloquea el flujo original.
   */
  private remoteValidateGallery(
    candidates: { file: File; width: number; height: number }[]
  ): Promise<{ issues: GalleryValidationIssue[]; suggestions: string[] }> {
    if (candidates.length === 0) {
      return Promise.resolve({ issues: [], suggestions: [] });
    }
    const metadata: ImageMetadata[] = candidates.map((c) => ({
      filename: c.file.name,
      sizeBytes: c.file.size,
      widthPx: c.width,
      heightPx: c.height,
      format: (c.file.type || '').replace(/^image\//, '') || 'jpg',
    }));
    return new Promise((resolve) => {
      this.operatorSupport.validateGallery(metadata).subscribe({
        next: (data) => {
          resolve({
            issues: data.issues || [],
            suggestions: data.suggestions || [],
          });
        },
        error: (err) => {
          console.warn('validate-gallery failed, continuing with local checks only', err);
          resolve({ issues: [], suggestions: [] });
        },
      });
    });
  }

  dismissGalleryAiSuggestions(): void {
    this.aiGalleryInlineIssues = [];
    this.aiGallerySuggestions = [];
  }

  private validateSyncRules(file: File): GalleryIssue | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { fileName: file.name, code: "INVALID_FORMAT" };
    }
    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > this.limits.maxSizeMb) {
      return { fileName: file.name, code: "TOO_LARGE" };
    }
    return null;
  }

  private validateDimensions(
    file: File
  ): Promise<{ file: File; issue: GalleryIssue | null; dataUrl?: string; width?: number; height?: number }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl: string = e.target.result;
        const image = new Image();
        image.onload = () => {
          const { width, height } = image;
          if (width < height) {
            resolve({
              file,
              issue: { fileName: file.name, code: "NOT_LANDSCAPE" },
              width,
              height,
            });
            return;
          }
          if (width < this.limits.minWidthPx) {
            resolve({
              file,
              issue: { fileName: file.name, code: "WIDTH_TOO_SMALL" },
              width,
              height,
            });
            return;
          }
          resolve({ file, issue: null, dataUrl, width, height });
        };
        image.onerror = () => {
          resolve({
            file,
            issue: { fileName: file.name, code: "INVALID_FORMAT" },
          });
        };
        image.src = dataUrl;
      };
      reader.onerror = () => {
        resolve({
          file,
          issue: { fileName: file.name, code: "INVALID_FORMAT" },
        });
      };
      reader.readAsDataURL(file);
    });
  }

  private attachFileToForm(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.addGallery();
      this.galleries.at(this.galleries.length - 1).patchValue({
        imageUrl: e.target.result,
        description: file.name,
        orderIndex: this.galleries.length,
        file: file,
      });
      this.galleries.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  private showIssuesModal(issues: GalleryIssue[]): void {
    const items = issues
      .map((issue) => {
        const codeLabel = this.translate.instant(
          `tour-gallery.issueCodes.${issue.code}`
        );
        return `<li><strong>${this.escapeHtml(issue.fileName)}</strong> — ${this.escapeHtml(codeLabel)}</li>`;
      })
      .join("");

    Swal.fire({
      icon: "warning",
      title: this.translate.instant("tour-gallery.errors.validationTitle"),
      html: `<ul style="text-align:left; padding-left: 1.2rem;">${items}</ul>`,
      confirmButtonText: "OK",
    });
  }

  private handleBackendError(err: HttpErrorResponse): void {
    const body = err.error;
    if (body && Array.isArray(body.issues) && body.issues.length > 0) {
      const issues: GalleryIssue[] = body.issues.map((raw: any) => ({
        fileName: raw?.fileName || "",
        code: raw?.code || "INVALID_FORMAT",
        message: raw?.message,
      }));
      this.showIssuesModal(issues);
      return;
    }

    this.errorMessage = this.translate.instant("tour-gallery.errors.generic");
    Swal.fire({
      icon: "error",
      title: this.translate.instant("tour-gallery.errors.genericTitle"),
      text: this.errorMessage,
      confirmButtonText: "OK",
    });
  }

  private escapeHtml(value: string): string {
    if (!value) return "";
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  onDeleteImage(index: number): void {
    this.galleries.removeAt(index);
    this.orderGallery();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.galleries.controls,
      event.previousIndex,
      event.currentIndex
    );

    this.orderGallery();
  }

  orderGallery() {
    this.galleries.controls.forEach((control, i) => {
      control.patchValue({
        orderIndex: i + 1,
      });
    });
  }
}
