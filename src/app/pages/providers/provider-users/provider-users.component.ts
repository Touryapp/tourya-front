import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { SharedModule } from '../../../shared/shared-module';
import { materialModule } from '../../../shared/material.module';
import { ProviderUsersService } from '../../../shared/services/provider-users.service';
import {
  ProviderUser,
  ProviderUserTour,
  CreateProviderUserRequest,
  UpdateProviderUserRequest
} from '../../../shared/models/provider-user.model';
import { TourService } from '../tours/tour.service';
import { Tour } from '../../../shared/dto/tour-response.dto';
import Swal from 'sweetalert2';

type ModalType = 'create' | 'edit' | 'resetPassword' | 'changePrincipalTour' | null;

@Component({
  selector: 'app-provider-users',
  standalone: true,
  templateUrl: './provider-users.component.html',
  styleUrls: ['./provider-users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    materialModule
  ]
})
export class ProviderUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Tabla ──────────────────────────────────────────────────────────────────
  users: ProviderUser[] = [];
  dataSource = new MatTableDataSource<ProviderUser>([]);
  displayedColumns: string[] = [
    'providerUserId',
    'fullName',
    'email',
    'tours',
    'principalTour',
    'accountEnabled',
    'actions'
  ];

  @ViewChild(MatSort) sort!: MatSort;

  // ── Estado de modales ─────────────────────────────────────────────────────
  activeModal: ModalType = null;
  selectedUser: ProviderUser | null = null;
  isLoading = false;
  errorMessage = '';

  // ── Formularios ───────────────────────────────────────────────────────────
  createForm: FormGroup;
  editForm: FormGroup;
  resetPasswordForm: FormGroup;
  changeTourForm: FormGroup;

  // ── Tours disponibles (del proveedor) ─────────────────────────────────────
  availableTours: Tour[] = [];

  constructor(
    private fb: FormBuilder,
    private providerUsersService: ProviderUsersService,
    private tourService: TourService
  ) {
    this.createForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      temporaryPassword: ['', [Validators.required, Validators.minLength(8)]],
      tourIds: [[], Validators.required],
      principalTourId: [null, Validators.required]
    });

    this.editForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      tourIds: [[], Validators.required],
      principalTourId: [null, Validators.required]
    });

    this.resetPasswordForm = this.fb.group({
      temporaryPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.changeTourForm = this.fb.group({
      principalTourId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAvailableTours();
  }

  // ── Carga de datos ────────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoading = true;
    this.providerUsersService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.dataSource.data = users;
          if (this.sort) this.dataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.isLoading = false;
        }
      });
  }

  loadAvailableTours(): void {
    this.tourService.getToursProvider({ page: 0, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.availableTours = response?.content ?? (Array.isArray(response) ? response : []);
        },
        error: (err) => console.error('Error loading tours', err)
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getPrincipalTour(tours: ProviderUserTour[]): ProviderUserTour | undefined {
    return tours?.find(t => t.isPrincipal);
  }

  getSelectedTours(tourIds: number[]): Tour[] {
    return this.availableTours.filter(t => {
      const id = (t as any).tourId ?? (t as any).id;
      return tourIds.includes(id);
    });
  }

  getTourId(tour: Tour): number {
    return (tour as any).tourId ?? (tour as any).id;
  }

  getTourName(tour: Tour): string {
    const name = (tour as any).tourName ?? (tour as any).name;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object') {
      return name['es'] ?? name['en'] ?? Object.values(name)[0] ?? '';
    }
    return '';
  }

  onTourCheckboxChange(event: any, formType: 'create' | 'edit'): void {
    const tourId = Number(event.target.value);
    const isChecked = event.target.checked;
    const form = formType === 'create' ? this.createForm : this.editForm;
    
    let currentTours = [...(form.get('tourIds')?.value || [])];
    
    if (isChecked) {
      if (!currentTours.includes(tourId)) {
        currentTours.push(tourId);
      }
    } else {
      currentTours = currentTours.filter(id => id !== tourId);
    }
    
    form.get('tourIds')?.setValue(currentTours);
    
    // Si se desmarca el tour principal actual, limpiarlo
    const currentPrincipal = form.get('principalTourId')?.value;
    if (!isChecked && currentPrincipal === tourId) {
      form.get('principalTourId')?.setValue(null);
    }
  }

  // ── Apertura de modales ───────────────────────────────────────────────────

  openCreateModal(): void {
    this.createForm.reset({ tourIds: [], principalTourId: null });
    this.errorMessage = '';
    this.activeModal = 'create';
  }

  openEditModal(user: ProviderUser): void {
    this.selectedUser = user;
    const nameParts = (user.fullName ?? '').split(' ');
    const firstname = nameParts[0] ?? '';
    const lastname = nameParts.slice(1).join(' ') ?? '';
    const tourIds = user.tours?.map(t => t.tourId) ?? [];
    const principal = this.getPrincipalTour(user.tours);
    this.editForm.patchValue({
      firstname,
      lastname,
      tourIds,
      principalTourId: principal?.tourId ?? null
    });
    this.errorMessage = '';
    this.activeModal = 'edit';
  }

  openResetPasswordModal(user: ProviderUser): void {
    this.selectedUser = user;
    this.resetPasswordForm.reset();
    this.errorMessage = '';
    this.activeModal = 'resetPassword';
  }

  openChangePrincipalTourModal(user: ProviderUser): void {
    this.selectedUser = user;
    const principal = this.getPrincipalTour(user.tours);
    this.changeTourForm.patchValue({ principalTourId: principal?.tourId ?? null });
    this.errorMessage = '';
    this.activeModal = 'changePrincipalTour';
  }

  closeModal(): void {
    this.activeModal = null;
    this.selectedUser = null;
    this.errorMessage = '';
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  saveCreate(): void {
    if (this.createForm.invalid) return;
    const val = this.createForm.value as CreateProviderUserRequest;
    this.isLoading = true;
    this.providerUsersService.create(val)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: '¡Operario creado!',
            text: 'El operario ha sido registrado exitosamente.',
            confirmButtonColor: '#0d6efd'
          });
        },
        error: (err) => {
          this.errorMessage = 'Error al crear el usuario. Verifica los datos e intenta nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.selectedUser) return;
    const val = this.editForm.value as UpdateProviderUserRequest;
    this.isLoading = true;
    this.providerUsersService.update(this.selectedUser.providerUserId, val)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: '¡Operario actualizado!',
            text: 'Los datos del operario han sido actualizados.',
            confirmButtonColor: '#0d6efd'
          });
        },
        error: (err) => {
          this.errorMessage = 'Error al actualizar el usuario. Intenta nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  confirmResetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.selectedUser) return;
    const { temporaryPassword } = this.resetPasswordForm.value;
    this.isLoading = true;
    this.providerUsersService.resetPassword(this.selectedUser.providerUserId, { temporaryPassword })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña restablecida!',
            text: 'Se ha asignado la nueva contraseña temporal.',
            confirmButtonColor: '#0d6efd'
          });
        },
        error: (err) => {
          this.errorMessage = 'Error al restablecer la contraseña. Intenta nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  confirmChangePrincipalTour(): void {
    if (this.changeTourForm.invalid || !this.selectedUser) return;
    const { principalTourId } = this.changeTourForm.value;
    this.isLoading = true;
    this.providerUsersService.changePrincipalTour(this.selectedUser.providerUserId, principalTourId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: '¡Tour principal cambiado!',
            text: 'El tour principal se ha actualizado correctamente.',
            confirmButtonColor: '#0d6efd'
          });
        },
        error: (err) => {
          this.errorMessage = 'Error al cambiar el tour principal. Intenta nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
