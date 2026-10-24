// Pruebas unitarias del flujo de activación de recordatorios push con un repositorio falso:
// permiso ya concedido, explicación aceptada o rechazada, sistema que no deja volver a preguntar,
// errores y cancelación al cerrar sesión.

import { activatePushNotifications } from '../usePushRegistration';
import type { DeviceToken, PushPermission, PushRepository } from '../usePushRegistration';

const TOKEN: DeviceToken = { token: 'token-fcm-123', platform: 'android' };

interface FakeOptions {
  permission: PushPermission;
  afterRequest?: PushPermission;
  token?: DeviceToken | null;
  registerFails?: boolean;
}

function fakeRepository(options: FakeOptions) {
  const calls: string[] = [];

  const repository: PushRepository = {
    prepareChannels: async () => {
      calls.push('prepareChannels');
    },
    getPermission: async () => {
      calls.push('getPermission');
      return options.permission;
    },
    requestPermission: async () => {
      calls.push('requestPermission');
      return options.afterRequest ?? options.permission;
    },
    getDeviceToken: async () => {
      calls.push('getDeviceToken');
      return options.token === undefined ? TOKEN : options.token;
    },
    onDeviceTokenChange: () => () => {},
    registerDeviceToken: async (token) => {
      calls.push(`register:${token.token}`);
      if (options.registerFails) throw new Error('sin red');
    },
  };

  return { repository, calls };
}

const GRANTED = { granted: true, canAskAgain: true };
const UNDETERMINED = { granted: false, canAskAgain: true };
const BLOCKED = { granted: false, canAskAgain: false };

describe('activatePushNotifications', () => {
  it('con permiso ya concedido registra el token sin preguntar', async () => {
    const { repository, calls } = fakeRepository({ permission: GRANTED });
    let explained = false;

    const status = await activatePushNotifications(repository, async () => {
      explained = true;
      return true;
    });

    expect(status).toBe('enabled');
    expect(explained).toBe(false);
    expect(calls).toEqual([
      'prepareChannels',
      'getPermission',
      'getDeviceToken',
      'register:token-fcm-123',
    ]);
  });

  it('crea el canal antes de consultar el permiso', async () => {
    const { repository, calls } = fakeRepository({ permission: GRANTED });

    await activatePushNotifications(repository, async () => true);

    expect(calls.indexOf('prepareChannels')).toBe(0);
  });

  it('explica, pide el permiso y registra cuando el dueño acepta', async () => {
    const { repository, calls } = fakeRepository({
      permission: UNDETERMINED,
      afterRequest: GRANTED,
    });

    const status = await activatePushNotifications(repository, async () => true);

    expect(status).toBe('enabled');
    expect(calls).toContain('requestPermission');
    expect(calls).toContain('register:token-fcm-123');
  });

  it('si el dueño responde "Ahora no", no muestra el aviso del sistema', async () => {
    const { repository, calls } = fakeRepository({ permission: UNDETERMINED });

    const status = await activatePushNotifications(repository, async () => false);

    expect(status).toBe('disabled');
    expect(calls).not.toContain('requestPermission');
    expect(calls).not.toContain('getDeviceToken');
  });

  it('si el dueño rechaza en el aviso del sistema, queda desactivado', async () => {
    const { repository } = fakeRepository({ permission: UNDETERMINED, afterRequest: BLOCKED });

    const status = await activatePushNotifications(repository, async () => true);

    expect(status).toBe('disabled');
  });

  it('si el sistema ya no deja preguntar, no muestra la explicación', async () => {
    const { repository } = fakeRepository({ permission: BLOCKED });
    let explained = false;

    const status = await activatePushNotifications(repository, async () => {
      explained = true;
      return true;
    });

    expect(status).toBe('disabled');
    expect(explained).toBe(false);
  });

  it('sin token (app compilada sin Firebase) termina en error', async () => {
    const { repository } = fakeRepository({ permission: GRANTED, token: null });

    expect(await activatePushNotifications(repository, async () => true)).toBe('error');
  });

  it('si falla el registro en el backend termina en error', async () => {
    const { repository } = fakeRepository({ permission: GRANTED, registerFails: true });

    expect(await activatePushNotifications(repository, async () => true)).toBe('error');
  });

  it('si se cierra sesión mientras explica, no sigue', async () => {
    const { repository, calls } = fakeRepository({
      permission: UNDETERMINED,
      afterRequest: GRANTED,
    });
    let cancelled = false;

    const status = await activatePushNotifications(
      repository,
      async () => {
        cancelled = true;
        return true;
      },
      () => cancelled,
    );

    expect(status).toBe('pending');
    expect(calls).not.toContain('requestPermission');
  });
});
