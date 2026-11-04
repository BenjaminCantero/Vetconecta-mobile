const originalGlobalMocks = process.env.EXPO_PUBLIC_USE_MOCKS;
const originalAuthMocks = process.env.EXPO_PUBLIC_AUTH_USE_MOCKS;

afterEach(() => {
  if (originalGlobalMocks === undefined) delete process.env.EXPO_PUBLIC_USE_MOCKS;
  else process.env.EXPO_PUBLIC_USE_MOCKS = originalGlobalMocks;
  if (originalAuthMocks === undefined) delete process.env.EXPO_PUBLIC_AUTH_USE_MOCKS;
  else process.env.EXPO_PUBLIC_AUTH_USE_MOCKS = originalAuthMocks;
});

it.each([
  [undefined, undefined, true, true],
  ['false', undefined, false, false],
  ['true', 'false', true, false],
  ['false', 'true', false, true],
])(
  'configura mocks globales=%s y auth=%s de forma independiente',
  (globalMocks, authMocks, expectedGlobal, expectedAuth) => {
    if (globalMocks === undefined) delete process.env.EXPO_PUBLIC_USE_MOCKS;
    else process.env.EXPO_PUBLIC_USE_MOCKS = globalMocks;
    if (authMocks === undefined) delete process.env.EXPO_PUBLIC_AUTH_USE_MOCKS;
    else process.env.EXPO_PUBLIC_AUTH_USE_MOCKS = authMocks;

    jest.isolateModules(() => {
      const { ENV } = jest.requireActual<typeof import('../env')>('../env');
      expect(ENV.USE_MOCKS).toBe(expectedGlobal);
      expect(ENV.AUTH_USE_MOCKS).toBe(expectedAuth);
    });
  },
);
