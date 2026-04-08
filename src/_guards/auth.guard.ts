import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const menuPermisos = parseMenuPermissions(localStorage.getItem('menu'));
    const fullUrl = window.location.href;
    const url = new URL(fullUrl);
    const path = url.pathname;
    const params = route.params;

    if (menuPermisos != null && checkUrlExists(menuPermisos, path, params)) {
      return true;
    }

    this.translate.get('ERROR.rol_insuficiente_titulo').subscribe((message: string) => {
      this.popUpManager.showErrorAlert(message);
    });
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
    return JSON.parse(atob(menuInfo));
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
