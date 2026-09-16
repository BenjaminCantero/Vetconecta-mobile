// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');
const boundaries = require('eslint-plugin-boundaries');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'navigation', pattern: 'src/core/navigation/**/*', partialMatch: false },
        { type: 'home', pattern: 'src/features/home/**/*', partialMatch: false },
        { type: 'feature', pattern: 'src/features/*/**/*', partialMatch: false, capture: ['domain'] },
        { type: 'core', pattern: 'src/core/**/*', partialMatch: false },
        { type: 'shared', pattern: 'src/shared/**/*', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        2,
        {
          default: 'disallow',
          policies: [
            {
              from: [{ element: { type: 'navigation' } }],
              allow: [
                { to: { element: { type: 'core' } } },
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'navigation' } } },
                { to: { element: { type: 'feature' } } },
                { to: { element: { type: 'home' } } },
              ],
            },
            {
              from: [{ element: { type: 'home' } }],
              allow: [
                { to: { element: { type: 'home' } } },
                { to: { element: { type: 'core' } } },
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'feature' } } },
              ],
            },
            {
              from: [{ element: { type: 'feature' } }],
              allow: [
                { to: { element: { type: 'core' } } },
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'navigation' } } },
                { to: { element: { type: 'feature', captured: { domain: '{{ from.captured.domain }}' } } } },
              ],
            },
            {
              from: [{ element: { type: 'core' } }],
              allow: [
                { to: { element: { type: 'core' } } },
                { to: { element: { type: 'shared' } } },
              ],
            },
            {
              from: [{ element: { type: 'shared' } }],
              allow: [
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'core' } } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'babel.config.js'],
  },
];