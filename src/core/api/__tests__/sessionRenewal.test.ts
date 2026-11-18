import {
  createSessionRenewal,
  type RenewedTokens,
  type SessionRenewalDeps,
} from '../sessionRenewal';

class RejectedRefreshError extends Error {}

function setup(initial: { accessToken: string | null; refreshToken: string | null }) {
  const tokens = { ...initial };

  const deps = {
    getAccessToken: jest.fn(async () => tokens.accessToken),
    getRefreshToken: jest.fn(async () => tokens.refreshToken),
    requestNewTokens: jest.fn<Promise<RenewedTokens>, [string]>(async () => ({
      accessToken: 'nuevo',
    })),
    saveTokens: jest.fn(async (accessToken: string, refreshToken?: string) => {
      tokens.accessToken = accessToken;
      tokens.refreshToken = refreshToken ?? null;
    }),
    isRefreshRejected: (error: unknown) => error instanceof RejectedRefreshError,
    endSession: jest.fn(async () => {
      tokens.accessToken = null;
      tokens.refreshToken = null;
    }),
  } satisfies SessionRenewalDeps;

  return { tokens, deps, renewal: createSessionRenewal(deps) };
}

describe('createSessionRenewal', () => {
  it('renueva el token, conserva el refresh token y pide reintentar', async () => {
    const { tokens, deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({
      action: 'retry',
      accessToken: 'nuevo',
    });

    expect(deps.requestNewTokens).toHaveBeenCalledWith('refresh-1');
    expect(tokens).toEqual({ accessToken: 'nuevo', refreshToken: 'refresh-1' });
    expect(deps.endSession).not.toHaveBeenCalled();
  });

  it('guarda el refresh token nuevo si el backend lo rota', async () => {
    const { tokens, deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });
    deps.requestNewTokens.mockResolvedValueOnce({
      accessToken: 'nuevo',
      refreshToken: 'refresh-2',
    });

    await renewal.handleUnauthorized('viejo', false);

    expect(tokens.refreshToken).toBe('refresh-2');
  });

  it('varios 401 al mismo tiempo hacen una sola renovación', async () => {
    const { deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });

    const decisions = await Promise.all([
      renewal.handleUnauthorized('viejo', false),
      renewal.handleUnauthorized('viejo', false),
      renewal.handleUnauthorized('viejo', false),
    ]);

    expect(deps.requestNewTokens).toHaveBeenCalledTimes(1);
    decisions.forEach((decision) => {
      expect(decision).toEqual({ action: 'retry', accessToken: 'nuevo' });
    });
  });

  it('si otra petición ya renovó el token, reintenta sin renovar de nuevo', async () => {
    const { deps, renewal } = setup({ accessToken: 'nuevo', refreshToken: 'refresh-1' });

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({
      action: 'retry',
      accessToken: 'nuevo',
    });
    expect(deps.requestNewTokens).not.toHaveBeenCalled();
  });

  it('sin refresh token cierra la sesión una sola vez', async () => {
    const { deps, renewal } = setup({ accessToken: 'viejo', refreshToken: null });

    const decisions = await Promise.all([
      renewal.handleUnauthorized('viejo', false),
      renewal.handleUnauthorized('viejo', false),
    ]);

    expect(decisions).toEqual([{ action: 'fail' }, { action: 'fail' }]);
    expect(deps.endSession).toHaveBeenCalledTimes(1);
    expect(deps.requestNewTokens).not.toHaveBeenCalled();
  });

  it('si el backend rechaza el refresh token, cierra la sesión', async () => {
    const { deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });
    deps.requestNewTokens.mockRejectedValueOnce(new RejectedRefreshError());

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({ action: 'fail' });
    expect(deps.endSession).toHaveBeenCalledTimes(1);
  });

  it('si la renovación falla por la red, conserva la sesión', async () => {
    const { tokens, deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });
    deps.requestNewTokens.mockRejectedValueOnce(new Error('Network Error'));

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({ action: 'fail' });
    expect(deps.endSession).not.toHaveBeenCalled();
    expect(tokens).toEqual({ accessToken: 'viejo', refreshToken: 'refresh-1' });
  });

  it('una petición ya reintentada que vuelve a recibir 401 cierra la sesión', async () => {
    const { deps, renewal } = setup({ accessToken: 'nuevo', refreshToken: 'refresh-1' });

    await expect(renewal.handleUnauthorized('nuevo', true)).resolves.toEqual({ action: 'fail' });
    expect(deps.endSession).toHaveBeenCalledTimes(1);
    expect(deps.requestNewTokens).not.toHaveBeenCalled();
  });

  it('si la sesión ya se cerró, no renueva ni vuelve a cerrarla', async () => {
    const { deps, renewal } = setup({ accessToken: null, refreshToken: null });

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({ action: 'fail' });
    expect(deps.requestNewTokens).not.toHaveBeenCalled();
    expect(deps.endSession).not.toHaveBeenCalled();
  });

  it('no guarda tokens si el dueño cerró sesión mientras se renovaba', async () => {
    const { tokens, deps, renewal } = setup({ accessToken: 'viejo', refreshToken: 'refresh-1' });
    deps.requestNewTokens.mockImplementationOnce(async () => {
      // Logout mientras la renovación espera la respuesta.
      tokens.accessToken = null;
      tokens.refreshToken = null;
      return { accessToken: 'nuevo' };
    });

    await expect(renewal.handleUnauthorized('viejo', false)).resolves.toEqual({ action: 'fail' });
    expect(deps.saveTokens).not.toHaveBeenCalled();
    expect(tokens.accessToken).toBeNull();
  });
});
