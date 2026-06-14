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
  isPrimary: boolean;
  accountEnabled: boolean;
  mustChangePassword: boolean;
  tours: ProviderUserTour[];
}

export interface CreateProviderUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  temporaryPassword: string;
  tourIds: number[];
  principalTourId: number;
}

export interface UpdateProviderUserRequest {
  firstname: string;
  lastname: string;
  tourIds: number[];
  principalTourId: number;
}

export interface ResetPasswordRequest {
  temporaryPassword: string;
}
