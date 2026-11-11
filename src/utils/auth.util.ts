export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getDocumento(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(atob(raw));
    return parsed?.userService?.documento ?? parsed?.user?.documento ?? null;
  } catch {
    return null;
  }
}

export function getRolesUsuario(): string[] {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return [];

    const parsed = JSON.parse(atob(raw));
    const fuentes = [
      parsed?.userService?.role,
      parsed?.user?.role,
      parsed?.role,
    ];

    const roles = fuentes
      .flatMap(fuente => Array.isArray(fuente) ? fuente : [fuente])
      .filter((rol): rol is string => typeof rol === 'string')
      .map(rol => rol.trim())
      .filter(Boolean);

    return [...new Set(roles)];
  } catch {
    return [];
  }
}

export function getCorreoSesion(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(atob(raw));
    return parsed?.user?.email ?? null;
  } catch {
    return null;
  }
}
