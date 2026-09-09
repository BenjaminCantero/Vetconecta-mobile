// Responsabilidad: entidad de negocio User (capa DOMAIN de auth).
// No conoce Axios ni AsyncStorage: solo forma parte del modelo del dominio.

export interface User {
  id: string;
  name: string;
  email: string;
}
