export type Role =
  | 'ADMIN_SGA'
  | 'VICERRECTOR'
  | 'ASESOR_VICE'
  | 'COORDINADOR';

export const ROLES_CONSULTA: readonly Role[] = [
  'ADMIN_SGA',
  'VICERRECTOR',
  'ASESOR_VICE',
  'COORDINADOR',
];

export const ROLES_ESCRITURA: readonly Role[] = [
  'ADMIN_SGA',
  'VICERRECTOR',
  'ASESOR_VICE',
];

export function tieneRolConsulta(roles: readonly string[]): boolean {
  return ROLES_CONSULTA.some(rol => roles.includes(rol));
}

export function tieneRolEscritura(roles: readonly string[]): boolean {
  return ROLES_ESCRITURA.some(rol => roles.includes(rol));
}