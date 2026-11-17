import { firstValueFrom } from 'rxjs';
import { getRolesUsuario, getToken } from 'src/utils/auth.util';
import { PermisosUtils } from 'src/utils/role-permissions';
import { tieneRolEscritura } from 'src/app/models/roles.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { TipoParametro } from 'src/app/models/parametro/tipo_parametro';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
    selector: 'app-creacion-tipo-cupos',
    templateUrl: './creacion-tipo-cupos.component.html',
    styleUrls: ['./creacion-tipo-cupos.component.scss'],
    standalone: false
})
export class CreacionTipoCuposComponent {
  @Input({ required: true })
  data!: { editando: boolean; info?: any };

  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>(true);

  permisos: Record<string, boolean> = {};
  permisosListos = false;
  
  infoTipoCupo = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    codigo_abreviacion: ['', Validators.required],
    numero_orden: ['', Validators.required]
  });

  loading!: boolean;
  editando: boolean = false;
  infoCupo!: any;

  constructor(
    private fb: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private permisosUtils: PermisosUtils,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.permisosListos = false;
    this.permisos = {};
    this.infoTipoCupo.disable();

    try {
      if (typeof this.data?.editando !== 'boolean') {
        this.cancelado.emit();
        return;
      }

      this.editando = this.data.editando;

      if (this.editando && !this.data.info?.Id) {
        this.cancelado.emit();
        return;
      }

      this.permisos = await firstValueFrom(
        this.permisosUtils.obtenerPermisos(getRolesUsuario(), [
          'crear_tipo_cupo',
          'editar_tipo_cupo',
        ]),
      );
      this.permisosListos = true;

      if (!this.validarPermiso(this.puedeGuardar)) {
        this.cancelado.emit();
        return;
      }

      if (this.editando) {
        this.infoCupo = { ...this.data.info };
        this.setearCamposFormularios(this.infoCupo);
      }

      this.infoTipoCupo.enable();
    } finally {
      this.loading = false;
    }
  }

  private tienePermiso(opcion: string): boolean {
    return !!getToken()
      && tieneRolEscritura(getRolesUsuario())
      && this.permisosListos
      && this.permisos[opcion] === true;
  }

  get puedeCrear(): boolean {return !this.editando && this.tienePermiso('crear_tipo_cupo'); }
  get puedeEditar(): boolean { return this.editando && this.tienePermiso('editar_tipo_cupo'); }
  get puedeGuardar(): boolean { return this.editando ? this.puedeEditar : this.puedeCrear; }

  private validarPermiso(permitido: boolean): boolean {
    if (!permitido) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('ERROR.rol_insuficiente_titulo'),
      );
    }

    return permitido;
  }

  async guardar() {
    if (this.loading || !this.validarPermiso(this.puedeCrear)) return;
    this.infoTipoCupo.markAllAsTouched();
    if (this.infoTipoCupo.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('cupos.crear_tipos_cupo'),
        this.translate.instant('cupos.descripcion_crear_tipos_cupo'),
        MODALS.INFO,
        true).then(
          async (action) => {
            if (action.value) {
              await this.prepararCreacion();
            }
          });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.error_formulario_incompleto'));
    }
  }

  cancelar(): void {
    if (this.loading) return;

    this.cancelado.emit();
  }

  async prepararCreacion() {
    if (this.loading || !this.validarPermiso(this.puedeCrear)) return;
    this.loading = true;
    let newTipoCupo = this.prepararBodyTipoCupo();
    newTipoCupo.Activo = true;
    newTipoCupo.TipoParametroId = {
      "Id": 87
    };

    const res = await this.crearTipoCupo(newTipoCupo);
    this.loading = false;

    if (res) {
      this.guardado.emit();
    }
  }

  setearCamposFormularios(data: any) {
    const infoCupo = {
      nombre: data['Nombre'],
      descripcion: data['Descripcion'],
      codigo_abreviacion: data['CodigoAbreviacion'],
      numero_orden: data['NumeroOrden']
    }
    this.infoTipoCupo.patchValue(infoCupo);
  }

  actualizar() {
    if (this.loading || !this.validarPermiso(this.puedeEditar)) return;
    this.infoTipoCupo.markAllAsTouched();
    if (this.infoTipoCupo.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('cupos.actualizar_tipos_cupo'),
        this.translate.instant('cupos.descripcion_actualizar_tipos_cupo'),
        MODALS.INFO,
        true).then(
          async (action) => {
            if (action.value) {
              await this.prepararActualizacion();
            }
          });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.error_formulario_incompleto'));
    }
  }

  async prepararActualizacion() {
    if (this.loading || !this.validarPermiso(this.puedeEditar)) return;
    this.loading = true;
    this.infoCupo.Nombre = this.infoTipoCupo.get('nombre')!.value ?? this.infoCupo.Nombre;
    this.infoCupo.Descripcion = this.infoTipoCupo.get('descripcion')!.value ?? this.infoCupo.Descripcion;
    this.infoCupo.CodigoAbreviacion = this.infoTipoCupo.get('codigo_abreviacion')!.value ?? this.infoCupo.CodigoAbreviacion;
    this.infoCupo.NumeroOrden = Number(this.infoTipoCupo.get('numero_orden')!.value) ?? this.infoCupo.NumeroOrden;
    this.infoCupo.TipoParametroId = {
      "Id": this.infoCupo.TipoParametroId.Id
    };

    const res = await this.actualizarTipoCupo(this.infoCupo);
    this.loading = false;

    if (res) {
      this.guardado.emit();
    }
  }

  prepararBodyTipoCupo() {
    let newTipoCupo = new TipoParametro();
    newTipoCupo.Nombre = this.infoTipoCupo.get('nombre')!.value ?? '';
    newTipoCupo.Descripcion = this.infoTipoCupo.get('descripcion')!.value ?? '';
    newTipoCupo.CodigoAbreviacion = this.infoTipoCupo.get('codigo_abreviacion')!.value ?? '';
    newTipoCupo.NumeroOrden = Number(this.infoTipoCupo.get('numero_orden')!.value) ?? 0;
    return newTipoCupo
  }

  crearTipoCupo(body: TipoParametro) {
    if (!this.validarPermiso(this.puedeCrear)) return Promise.resolve(false);
    return new Promise((resolve, reject) => {
      this.parametrosService
        .post('parametro', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('cupos.creacion_tipos_cupo_exito'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('cupos.creacion_tipos_cupo_fallo'));
            resolve(false);
          }
        );
    });
  }

  actualizarTipoCupo(body: TipoParametro) {
    if (!this.validarPermiso(this.puedeEditar)) return Promise.resolve(false);
    return new Promise((resolve, reject) => {
      this.parametrosService
        .put('parametro/', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('cupos.actualizacion_tipos_cupo_exito'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('cupos.actualizacion_tipos_cupo_fallo'));
            resolve(false);
          }
        );
    });
  }

}
