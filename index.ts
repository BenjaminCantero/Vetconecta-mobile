import { registerRootComponent } from 'expo';

import App from './App';
import { registerMedicationReminderActions } from './src/features/medications';

// H2: botón "Administrada" de los recordatorios de medicamentos. Debe quedar
// registrado al cargar el bundle, antes de montar la app: en Android la acción
// puede llegar con la app cerrada y se atiende sin abrir ninguna pantalla.
registerMedicationReminderActions();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
