import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TourService } from "../tour.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Gallery } from "../../../../shared/dto/gallery";
import { id } from "intl-tel-input/i18n";
import { Tour } from "../../../../shared/dto/tour-response.dto";
import { MatSnackBar } from "@angular/material/snack-bar";

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

  MAX_FILE_SIZE_IN_MB: number = 5;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tourService: TourService,
    private _snackBar: MatSnackBar
  ) {
    this.tourId = +(this.route.snapshot.paramMap.get("id") || 0);

    this.tourGalleryForm = this.fb.group({
      galleries: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.getTour();
    this.getTourGalleries();
  }

  get galleries(): FormArray {
    return this.tourGalleryForm.get("galleries") as FormArray;
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
              this.errorMessage =
                "Ha ocurrido un error, por favor intente de nuevo";
            }
          },
          error: (err) => {
            this.loading = false;
            console.error("Error saving tour gallery.");
            console.error(err);

            this.errorMessage =
              "Ha ocurrido un error, por favor intente de nuevo";
          },
        });
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
          description: gallery?.description,
          orderIndex: gallery?.orderIndex,
        });
      });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        const fileSize = file && file.size ? file.size / 1024 / 1024 : 0;

        if (file) {
          if (fileSize <= this.MAX_FILE_SIZE_IN_MB) {
            // Create a FileReader to read the file as Data URL for preview
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
          } else {
            this._snackBar.open(`Image: ${file.name} is too large`, "", {
              duration: 5000,
            });
          }
        }
      }
    }
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
