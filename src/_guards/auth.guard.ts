import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { getRolesUsuario, getToken } from 'src/utils/auth.util';
import { tieneRolConsulta, tieneRolEscritura,} from 'src/app/models/roles.model';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {}

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot,): boolean {
    const menuPermisos = parseMenuPermissions(localStorage.getItem('menu'));

    const destino = new URL(state.url, window.location.origin).pathname;
    const destinoConBase =
      destino === '/admisiones' || destino.startsWith('/admisiones/')
        ? destino
        : `/admisiones${destino}`;

    const path = route.data['menuUrl'] ?? destinoConBase;

    if (route.data['catalogoTiposInscripcion'] || route.data['catalogoTiposCupos']) {
      const roles = getRolesUsuario();

      const rolPermitido = route.data['requiereEscritura']
        ? tieneRolEscritura(roles)
        : tieneRolConsulta(roles);

      if (!getToken() || !rolPermitido) {
        return this.denegarAcceso();
      }
    }

    if (
      menuPermisos !== null &&
      checkUrlExists(menuPermisos, path, route.params)
    ) {
      return true;
    }

    return this.denegarAcceso();
  }

  private denegarAcceso(): false {
    this.popUpManager.showErrorAlert(
      this.translate.instant('ERROR.rol_insuficiente_titulo'),
    );
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}

function parseMenuPermissions(menuInfo: string | null): any[] | null {
  if (!menuInfo) {
    return null;
  }

  try {
    const menu = JSON.parse(atob(menuInfo));
    return Array.isArray(menu) ? menu : null;
  } catch {
    return null;
  }
}

function checkUrlExists(menuItems: any[], targetUrl: string, params: any): boolean {
  return menuItems.some((item: any) => {
    if (item.Url === targetUrl && checkParams(item.Params, params)) {
      return true;
    }

    if (item.Opciones && item.Opciones.length > 0) {
      return checkUrlExists(item.Opciones, targetUrl, params);
    }

    return false;
  });
}

function checkParams(expectedParams: any, actualParams: any): boolean {
  if (!expectedParams) {
    return true;
  }

  for (const key in expectedParams) {
    if (expectedParams[key] !== actualParams[key]) {
      return false;
    }
  }

  return true;
}
