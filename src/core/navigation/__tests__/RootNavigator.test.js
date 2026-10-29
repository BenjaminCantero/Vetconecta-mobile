/* global jest, it, expect */

import React from 'react';
import { Button, Text, TextInput } from 'react-native';
import { act, create } from 'react-test-renderer';

import { RootNavigator } from '../RootNavigator';

const mockRepository = {
  getStoredUser: jest.fn(),
  login: jest.fn(),
  onSessionExpired: jest.fn(() => () => {}),
};

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) =>
        React.Children.toArray(children)
          .flatMap((child) =>
            child.type === React.Fragment ? React.Children.toArray(child.props.children) : [child],
          )
          .find((child) => child.props.name === 'Login'),
      Screen: ({ component: Component }) => <Component />,
    }),
  };
});

jest.mock('../../../features/auth', () => {
  const React = require('react');
  const { Button, Text, TextInput } = require('react-native');
  const { useAuth } = require('../../../features/auth/domain/useAuth');

  return {
    useAuthSession: () => {
      const session = useAuth(mockRepository);
      Object.assign(mockSession, session);
      return session;
    },
    LoginScreen: function LoginScreen() {
      const [email, setEmail] = React.useState('');
      const [error, setError] = React.useState('');
      return (
        <>
          <TextInput value={email} onChangeText={setEmail} />
          <Button
            title="Ingresar"
            onPress={() =>
              mockSession.login({ email, password: 'incorrecta' }).catch((cause) => {
                setError(cause.message);
              })
            }
          />
          <Text>{error}</Text>
        </>
      );
    },
  };
});

jest.mock('../../../features/pets', () => ({}));
jest.mock('../../../features/appointments', () => ({}));
jest.mock('../../../features/profile', () => ({}));
jest.mock('../../../features/medications', () => ({}));
jest.mock('../TabNavigator', () => ({}));

// Captura el estado del mismo hook que usa RootNavigator, sin montar pantallas reales.
const mockSession = {};

it('mantiene el formulario montado y muestra el error cuando falla el login', async () => {
  mockRepository.getStoredUser.mockResolvedValue(null);
  let rejectLogin;
  mockRepository.login.mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        rejectLogin = reject;
      }),
  );
  let tree;

  try {
    await act(async () => {
      tree = create(<RootNavigator />);
    });
    act(() => {
      tree.root.findByType(TextInput).props.onChangeText('dueno@vetconecta.cl');
    });
    let submission;
    act(() => {
      submission = tree.root.findByType(Button).props.onPress();
    });

    expect(tree.root.findByType(TextInput).props.value).toBe('dueno@vetconecta.cl');

    await act(async () => {
      rejectLogin(new Error('Correo o contraseña incorrectos.'));
      await submission;
    });

    expect(tree.root.findByType(TextInput).props.value).toBe('dueno@vetconecta.cl');
    expect(tree.root.findAllByType(Text).map((node) => node.props.children)).toContain(
      'Correo o contraseña incorrectos.',
    );
  } finally {
    if (tree) act(() => tree.unmount());
  }
});
