import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BsModalService } from "ngx-bootstrap/modal";
import { TemplateService } from "../template.service";
import { TourSchedule } from "../../../../shared/dto/tour-schedule.response.dto";
import { routes } from "../../../../shared/routes/routes";
import { ConfirmDialogComponent } from "../../../../shared/common/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-template-list",
  standalone: false,
  templateUrl: "./template-list.component.html",
  styleUrl: "./template-list.component.scss"
})
export class TemplateListComponent implements OnInit {
  templates: TourSchedule[] = [];
  loading = false;
  public routes = routes;

  // Equivalencia de días completos a abreviaciones de 3 letras
  dayAbbreviations: { [key: string]: string } = {
    'SUNDAY': 'DOM',
    'MONDAY': 'LUN',
    'TUESDAY': 'MAR',
    'WEDNESDAY': 'MIÉ',
    'THURSDAY': 'JUE',
    'FRIDAY': 'VIE',
    'SATURDAY': 'SÁB'
  };

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading templates:", error);
        this.loading = false;
        this.showSnackBar("Error al cargar los templates", "error");
      }
    });
  }

  createTemplate(): void {
    this.router.navigate(["/providers/templates/create"]);
  }

  editTemplate(templateId: number): void {
    this.router.navigate(["/providers/templates/edit", templateId]);
  }

  deleteTemplate(templateId: number): void {
    const modalRef = this.modalService.show(ConfirmDialogComponent, {
      initialState: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar este template? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    // Suscribirse al evento onHidden que se ejecuta cuando se cierra el modal
    modalRef.onHidden?.subscribe(() => {
      const component = modalRef.content as ConfirmDialogComponent;
      console.log("Modal closed, confirmed:", component.confirmed);
      
      // Verificar si se confirmó la eliminación
      // if (component.confirmed) {
      //   this.templateService.deleteTemplate(templateId).subscribe({
      //     next: () => {
      //       this.showSnackBar("Template eliminado correctamente", "success");
      //       this.loadTemplates();
      //     },
      //     error: (error) => {
      //       console.error("Error deleting template:", error);
      //       this.showSnackBar("Error al eliminar el template", "error");
      //     }
      //   });
      // }
    });
  }

  getDayAbbreviation(day: string): string {
    return this.dayAbbreviations[day] || day;
  }

  private showSnackBar(message: string, type: "success" | "error"): void {
    this.snackBar.open(message, "", {
      duration: 3000,
      panelClass: type === "success" ? "success-snackbar" : "error-snackbar"
    });
  }
}
