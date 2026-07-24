/**
 * FE-15d: modelos para gestion de usuarios BACKOFFICE_OPERATION.
 * Backend endpoint: /admin/backoffice-users (solo ADMIN puede gestionarlos).
 */
export interface BackofficeUser {
  userId: number;
  email: string;
  fullName: string;
  phone?: string | null;
  accountEnabled: boolean;
  mustChangePassword: boolean;
}

export interface CreateBackofficeUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  temporaryPassword: string;
}

export interface UpdateBackofficeUserRequest {
  firstname?: string;
  lastname?: string;
  phone?: string | null;
}

export interface ResetBackofficeUserPasswordRequest {
  temporaryPassword: string;
}
