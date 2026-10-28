import { EmailAlreadyInUseError, IncorrectCurrentPasswordError } from '../../domain/profileErrors';
import { MOCK_CURRENT_PASSWORD, ownerProfileMock } from '../profileMock';
import { profileRepository } from '../profileRepository';

describe('profileRepository mock contract', () => {
  const originalEmail = ownerProfileMock.email;
  const originalPhone = ownerProfileMock.telefono;

  afterEach(() => {
    ownerProfileMock.email = originalEmail;
    ownerProfileMock.telefono = originalPhone;
  });

  it('updates only contact fields', async () => {
    const originalRut = ownerProfileMock.rut;
    const profile = await profileRepository.updateContact({
      email: 'nuevo@correo.cl',
      phone: '+56 9 1111 2222',
    });

    expect(profile.email).toBe('nuevo@correo.cl');
    expect(profile.phone).toBe('+56 9 1111 2222');
    expect(ownerProfileMock.rut).toBe(originalRut);
  });

  it('reports an email conflict from the Swagger mock', async () => {
    await expect(
      profileRepository.updateContact({
        email: 'ocupado@vetconecta.cl',
        phone: '+56 9 1111 2222',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  it('checks the current password before accepting a new one', async () => {
    await expect(
      profileRepository.changePassword({ currentPassword: 'incorrecta', newPassword: 'Nueva123' }),
    ).rejects.toBeInstanceOf(IncorrectCurrentPasswordError);

    await expect(
      profileRepository.changePassword({
        currentPassword: MOCK_CURRENT_PASSWORD,
        newPassword: 'Nueva123',
      }),
    ).resolves.toBeUndefined();
  });
});
