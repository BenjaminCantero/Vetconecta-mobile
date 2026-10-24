// Expo lee primero app.json y le pasa ese objeto a esta función como `config`, junto con
// `projectRoot`.
//
// google-services.json se busca en este orden:
//  1. Variable de entorno GOOGLE_SERVICES_JSON (en EAS Build, una variable de tipo archivo).
//  2. Archivo local ./google-services.json.
// Si no está, la app compila igual, pero en Android no recibe notificaciones push.

const fs = require('fs');
const path = require('path');

const LOCAL_GOOGLE_SERVICES = './google-services.json';

function resolveGoogleServicesFile(projectRoot) {
  if (process.env.GOOGLE_SERVICES_JSON) {
    return process.env.GOOGLE_SERVICES_JSON;
  }

  if (fs.existsSync(path.join(projectRoot, LOCAL_GOOGLE_SERVICES))) {
    return LOCAL_GOOGLE_SERVICES;
  }

  console.warn(
    '[app.config] Falta google-services.json: la app compila, pero sin notificaciones push en Android.',
  );

  return undefined;
}

module.exports = ({ config, projectRoot }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: resolveGoogleServicesFile(projectRoot),
  },
});