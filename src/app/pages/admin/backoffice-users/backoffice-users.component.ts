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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { SharedModule } from '../../../shared/shared-module';
import { materialModule } from '../../../shared/material.module';
import { BackofficeUsersService } from '../../../shared/services/backoffice-users.service';
import {
  BackofficeUser,
  CreateBackofficeUserRequest,
  UpdateBackofficeUserRequest
} from '../../../shared/models/backoffice-user.model';
import Swal from 'sweetalert2';

type ModalType = 'create' | 'edit' | 'resetPassword' | null;

/**
 * FE-15d: CRUD de usuarios con rol BACKOFFICE_OPERATION. Solo accesible por
 * ADMIN (protegido por AdminGuard en la ruta). Basado en el patron de
 * provider-users, sin la relacion tours/principal (los BACKOFFICE_OPERATION
 * son staff Tourya, no tienen tours asignados).
 */
@Component({
  selector: 'app-backoffice-users',
  standalone: true,
  templateUrl: './backoffice-users.component.html',
  styleUrls: ['./backoffice-users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    materialModule,
    TranslateModule
  ]
})
export class BackofficeUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users: BackofficeUser[] = [];
  dataSource = new MatTableDataSource<BackofficeUser>([]);
  displayedColumns: string[] = [
    'userId',
    'fullName',
    'email',
    'phone',
    'accountEnabled',
    'actions'
  ];

  @ViewChild(MatSort) sort!: MatSort;

  activeModal: ModalType = null;
  selectedUser: BackofficeUser | null = null;
  isLoading = false;
  errorMessage = '';

  createForm: FormGroup;
  editForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private backofficeUsersService: BackofficeUsersService,
    private translate: TranslateService
  ) {
    this.createForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      temporaryPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.editForm = this.fb.group({
      firstname: [''],
      lastname: [''],
      phone: ['']
    });

    this.resetPasswordForm = this.fb.group({
      temporaryPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.backofficeUsersService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.dataSource = new MatTableDataSource(users);
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando backoffice users', err);
          this.errorMessage = this.translate.instant('backofficeUsers.errors.loadFailed');
          this.isLoading = false;
        }
      });
  }

  openCreateModal(): void {
    this.createForm.reset();
    this.activeModal = 'create';
  }

  openEditModal(user: BackofficeUser): void {
    this.selectedUser = user;
    const [firstname, ...rest] = (user.fullName || '').split(' ');
    this.editForm.patchValue({
      firstname: firstname || '',
      lastname: rest.join(' ') || '',
      phone: user.phone || ''
    });
    this.activeModal = 'edit';
  }

  openResetPasswordModal(user: BackofficeUser): void {
    this.selectedUser = user;
    this.resetPasswordForm.reset();
    this.activeModal = 'resetPassword';
  }

  closeModal(): void {
    this.activeModal = null;
    this.selectedUser = null;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const body: CreateBackofficeUserRequest = {
      firstname: this.createForm.value.firstname,
      lastname: this.createForm.value.lastname || undefined,
      email: this.createForm.value.email,
      phone: this.createForm.value.phone || null,
      temporaryPassword: this.createForm.value.temporaryPassword
    };
    this.backofficeUsersService.create(body).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('backofficeUsers.swal.createdTitle'),
          text: this.translate.instant('backofficeUsers.swal.createdText')
        });
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => this.showApiError(err, 'backofficeUsers.errors.createFailed')
    });
  }

  submitEdit(): void {
    if (!this.selectedUser || this.editForm.invalid) return;
    const body: UpdateBackofficeUserRequest = {
      firstname: this.editForm.value.firstname || undefined,
      lastname: this.editForm.value.lastname || undefined,
      phone: this.editForm.value.phone || null
    };
    this.backofficeUsersService.update(this.selectedUser.userId, body).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('backofficeUsers.swal.updatedTitle'),
          text: this.translate.instant('backofficeUsers.swal.updatedText')
        });
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => this.showApiError(err, 'backofficeUsers.errors.updateFailed')
    });
  }

  submitResetPassword(): void {
    if (!this.selectedUser || this.resetPasswordForm.invalid) return;
    this.backofficeUsersService.resetPassword(this.selectedUser.userId, {
      temporaryPassword: this.resetPasswordForm.value.temporaryPassword
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('backofficeUsers.swal.passwordResetTitle'),
          text: this.translate.instant('backofficeUsers.swal.passwordResetText')
        });
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => this.showApiError(err, 'backofficeUsers.errors.resetFailed')
    });
  }

  toggleEnabled(user: BackofficeUser): void {
    const action = user.accountEnabled
      ? this.backofficeUsersService.disable(user.userId)
      : this.backofficeUsersService.enable(user.userId);
    const titleKey = user.accountEnabled ? 'backofficeUsers.swal.disabledTitle' : 'backofficeUsers.swal.enabledTitle';
    const errorKey = user.accountEnabled ? 'backofficeUsers.errors.disableFailed' : 'backofficeUsers.errors.enableFailed';

    Swal.fire({
      title: this.translate.instant('backofficeUsers.swal.confirmToggleTitle'),
      text: user.accountEnabled
        ? this.translate.instant('backofficeUsers.swal.confirmDisableText', { name: user.fullName })
        : this.translate.instant('backofficeUsers.swal.confirmEnableText', { name: user.fullName }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('backofficeUsers.swal.yesConfirm'),
      cancelButtonText: this.translate.instant('backofficeUsers.swal.cancel')
    }).then((result) => {
      if (!result.isConfirmed) return;
      action.subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: this.translate.instant(titleKey)
          });
          this.loadUsers();
        },
        error: (err) => this.showApiError(err, errorKey)
      });
    });
  }

  private showApiError(err: any, fallbackKey: string): void {
    const backendMsg = err?.error?.message || err?.error?.error || '';
    Swal.fire({
      icon: 'error',
      title: this.translate.instant('backofficeUsers.swal.errorTitle'),
      text: backendMsg || this.translate.instant(fallbackKey)
    });
  }
}
