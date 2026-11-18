// Responsabilidad: decidir qué hacer ante un 401 (capa CORE). No conoce Axios,
// para poder probar las reglas sin red. httpClient ejecuta la decisión.

export interface RenewedTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface SessionRenewalDeps {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  requestNewTokens: (refreshToken: string) => Promise<RenewedTokens>;
  saveTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  isRefreshRejected: (error: unknown) => boolean;
  endSession: () => Promise<void>;
}

export type UnauthorizedDecision = { action: 'retry'; accessToken: string } | { action: 'fail' };

export function createSessionRenewal(deps: SessionRenewalDeps) {
  // Compartidas: varios 401 simultáneos esperan la misma renovación o el mismo cierre.
  let renewal: Promise<string | null> | null = null;
  let ending: Promise<void> | null = null;

  function endSessionOnce(): Promise<void> {
    if (!ending) {
      ending = deps.endSession().finally(() => {
        ending = null;
      });
    }

    return ending;
  }

  async function renew(expiredToken: string): Promise<string | null> {
    const refreshToken = await deps.getRefreshToken();

    if (!refreshToken) {
      await endSessionOnce();
      return null;
    }

    let tokens: RenewedTokens;

    try {
      tokens = await deps.requestNewTokens(refreshToken);
    } catch (error) {
      // Sin red o con 5xx la sesión se conserva; solo un rechazo del backend la cierra.
      if (deps.isRefreshRejected(error)) {
        await endSessionOnce();
      }

      return null;
    }

    // El dueño cerró sesión mientras se renovaba: los tokens ya no le sirven a nadie.
    if ((await deps.getAccessToken()) !== expiredToken) {
      return null;
    }

    await deps.saveTokens(tokens.accessToken, tokens.refreshToken ?? refreshToken);

    return tokens.accessToken;
  }

  async function handleUnauthorized(
    sentToken: string,
    alreadyRetried: boolean,
  ): Promise<UnauthorizedDecision> {
    const currentToken = await deps.getAccessToken();

    if (!currentToken) {
      return { action: 'fail' };
    }

    // El token recién renovado también fue rechazado: no se insiste.
    if (alreadyRetried) {
      if (currentToken === sentToken) {
        await endSessionOnce();
      }

      return { action: 'fail' };
    }

    // Otra petición ya renovó el token.
    if (currentToken !== sentToken) {
      return { action: 'retry', accessToken: currentToken };
    }

    if (!renewal) {
      renewal = renew(sentToken).finally(() => {
        renewal = null;
      });
    }

    const renewedToken = await renewal;

    return renewedToken ? { action: 'retry', accessToken: renewedToken } : { action: 'fail' };
  }

  return { handleUnauthorized };
}
