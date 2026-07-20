export interface ProviderUserTour {
  tourId: number;
  tourName: string;
  isPrincipal: boolean;
}

export interface ProviderUser {
  providerUserId: number;
  userId: number;
  email: string;
  fullName: string;
  /** BE-22d: telefono del operador. Nullable hasta que lo carguen. */
  phone?: string | null;
  isPrimary: boolean;
  accountEnabled: boolean;
  mustChangePassword: boolean;
  tours: ProviderUserTour[];
}

export interface CreateProviderUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  /** BE-22d: opcional. */
  phone?: string | null;
  temporaryPassword: string;
  tourIds: number[];
  principalTourId: number;
}

export interface UpdateProviderUserRequest {
  firstname: string;
  lastname: string;
  /** BE-22d: se actualiza si viene. */
  phone?: string | null;
  tourIds: number[];
  principalTourId: number;
}

export interface ResetPasswordRequest {
  temporaryPassword: string;
}
