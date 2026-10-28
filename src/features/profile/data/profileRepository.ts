import { isAxiosError } from 'axios';

import { ENDPOINTS } from '../../../core/api/endpoints';
import { toHttpError } from '../../../core/api/httpError';
import { httpClient } from '../../../core/api/httpClient';
import { ENV } from '../../../core/config/env';
import { EmailAlreadyInUseError, IncorrectCurrentPasswordError } from '../domain/profileErrors';
import type {
  ContactUpdate,
  OwnerProfileRepository,
  PasswordChange,
} from '../domain/useOwnerProfile';
import type { OwnerProfile } from '../domain/OwnerProfile';
import type { ChangePasswordDto, OwnerProfileDto, UpdateContactDto } from './profileDto';
import { MOCK_CURRENT_PASSWORD, ownerProfileMock } from './profileMock';

const PROFILE_ERROR_MESSAGES = {
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión para editar tu perfil.',
  fallback: 'No pudimos guardar tus cambios. Inténtalo nuevamente.',
};

function toProfile(dto: OwnerProfileDto): OwnerProfile {
  return {
    fullName: `${dto.nombres} ${dto.apellidos}`.trim(),
    rut: dto.rut,
    email: dto.email,
    phone: dto.telefono,
  };
}

function toProfileError(error: unknown, operation: 'contact' | 'password'): Error {
  if (isAxiosError(error)) {
    if (operation === 'contact' && error.response?.status === 409)
      return new EmailAlreadyInUseError();
    if (operation === 'password' && [400, 401].includes(error.response?.status ?? 0)) {
      return new IncorrectCurrentPasswordError();
    }
  }
  return toHttpError(error, PROFILE_ERROR_MESSAGES);
}

export const profileRepository: OwnerProfileRepository = {
  async getMyProfile() {
    if (ENV.USE_MOCKS) return toProfile(ownerProfileMock);
    try {
      const { data } = await httpClient.get<OwnerProfileDto>(ENDPOINTS.CLIENTS.ME);
      return toProfile(data);
    } catch (error) {
      throw toHttpError(error, PROFILE_ERROR_MESSAGES);
    }
  },

  async updateContact(contact: ContactUpdate) {
    const request: UpdateContactDto = { email: contact.email, telefono: contact.phone };
    if (ENV.USE_MOCKS) {
      if (request.email.toLowerCase() === 'ocupado@vetconecta.cl')
        throw new EmailAlreadyInUseError();
      ownerProfileMock.email = request.email;
      ownerProfileMock.telefono = request.telefono;
      return toProfile(ownerProfileMock);
    }
    try {
      const { data } = await httpClient.put<OwnerProfileDto>(ENDPOINTS.CLIENTS.ME, request);
      return toProfile(data);
    } catch (error) {
      throw toProfileError(error, 'contact');
    }
  },

  async changePassword(change: PasswordChange) {
    const request: ChangePasswordDto = {
      password_actual: change.currentPassword,
      password_nueva: change.newPassword,
    };
    if (ENV.USE_MOCKS) {
      if (request.password_actual !== MOCK_CURRENT_PASSWORD)
        throw new IncorrectCurrentPasswordError();
      return;
    }
    try {
      await httpClient.put(ENDPOINTS.CLIENTS.PASSWORD, request);
    } catch (error) {
      throw toProfileError(error, 'password');
    }
  },
};
