// Responsabilidad: regla de elección de la mascota activa (capa SHARED).
// Función pura: recibe los ids de las mascotas del dueño y decide cuál queda
// activa. Solo se acepta un id que pertenezca a esa lista (BR-12), así un id
// guardado de otra sesión o de una mascota eliminada nunca se usa.

export function resolveActivePetId(
  petIds: string[],
  currentId: string | null,
  restoredId: string | null,
): string | null {
  if (petIds.length === 0) return null;
  if (currentId && petIds.includes(currentId)) return currentId;
  if (restoredId && petIds.includes(restoredId)) return restoredId;
  return petIds[0];
}
