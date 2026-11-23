import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { getRolesUsuario, getToken } from 'src/utils/auth.util';
import { PermisosUtils } from 'src/utils/role-permissions';
import { tieneRolConsulta, tieneRolEscritura } from '../models/roles.model';
import { PopUpManager } from '../managers/popUpManager';

export const PERMISOS_CONFIGURACION = {
  cuposProyecto: ['asignar_cupos_proyecto', 'retirar_cupo_proyecto', 'cargar_soporte_cupo_proyecto'],
  criterios: ['crear_criterio_admision', 'editar_criterio_admision', 'desactivar_criterio_admision',
    'crear_subcriterio_admision', 'editar_subcriterio_admision', 'desactivar_subcriterio_admision'],
  criteriosProyecto: ['asignar_criterios_admision'],
  suite: ['crear_suite_admision', 'editar_suite_admision'],
  documentosDescuentos: ['ver_documentos_admision', 'ver_descuentos_admision',
    'asignar_documento_admision', 'retirar_documento_admision', 'editar_obligatoriedad_documento_admision',
    'crear_tipo_documento_admision', 'editar_tipo_documento_admision', 'desactivar_tipo_documento_admision',
    'asignar_descuento_admision', 'retirar_descuento_admision',
    'crear_tipo_descuento_admision', 'editar_tipo_descuento_admision', 'desactivar_tipo_descuento_admision'],
} as const;

export interface AccesoConfiguracionAdmision {
  permite(opcion: string): boolean;
  validar(opcion: string): boolean;
}

export const ACCESO_CONFIGURACION_DENEGADO: AccesoConfiguracionAdmision = {
  permite: () => false,
  validar: () => false,
};

@Injectable({ providedIn: 'root' })
export class AccesoConfiguracionAdmisionService {
  constructor(
    private permisosUtils: PermisosUtils,
    private popup: PopUpManager,
    private translate: TranslateService,
  ) {}

  crear(opciones: readonly string[]): AccesoConfiguracionAdmision {
    const rolesConsulta = getRolesUsuario();
    const usuarioConsulta = localStorage.getItem('user');
    let permisos: Record<string, boolean> = {};
    if (getToken() && tieneRolConsulta(rolesConsulta)) {
      this.permisosUtils.obtenerPermisos(rolesConsulta, [...opciones]).pipe(take(1))
        .subscribe({ next: resultado => { permisos = resultado; }, error: () => { permisos = {}; } });
    }
    const permite = (opcion: string): boolean => {
      const roles = getRolesUsuario();
      // No reutilizar permisos si cambia la sesión mientras permanece abierta la pantalla.
      const mismaSesion = localStorage.getItem('user') === usuarioConsulta && roles.length === rolesConsulta.length && roles.every(rol => rolesConsulta.includes(rol));
      return !!getToken() && mismaSesion && permisos[opcion] === true
        && (opcion.startsWith('ver_') ? tieneRolConsulta(roles) : tieneRolEscritura(roles));
    };
    return {
      permite,
      validar: opcion => {
        const permitido = permite(opcion);
        if (!permitido) this.popup.showErrorAlert(this.translate.instant('ERROR.rol_insuficiente_titulo'));
        return permitido;
      },
    };
  }
}
