export type Role =
  | 'ADMIN_SGA'
  | 'VICERRECTOR'
  | 'ASESOR_VICE'
  | 'COORDINADOR'
  | 'ASISTENTE_VICE_ADMIN'
  | 'ADMISIONES_REG'
  | 'JEFE_DEPENDENCIA';

export const ROLES_CONSULTA: readonly Role[] = [
  'ADMIN_SGA',
  'VICERRECTOR',
  'ASESOR_VICE',
  'ASISTENTE_VICE_ADMIN',
  'COORDINADOR',
  'ADMISIONES_REG',
  'JEFE_DEPENDENCIA',
];

export const ROLES_ESCRITURA: readonly Role[] = [
  'ADMIN_SGA',
  'VICERRECTOR',
  'ASESOR_VICE',
  'ASISTENTE_VICE_ADMIN',
  'ADMISIONES_REG',
  'JEFE_DEPENDENCIA',
];

export function tieneRolConsulta(roles: readonly string[]): boolean {
  return ROLES_CONSULTA.some(rol => roles.includes(rol));
}

export function tieneRolEscritura(roles: readonly string[]): boolean {
  return ROLES_ESCRITURA.some(rol => roles.includes(rol));
}