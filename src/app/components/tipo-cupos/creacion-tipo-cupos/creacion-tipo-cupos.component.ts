import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { TipoParametro } from 'src/app/models/parametro/tipo_parametro';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-creacion-tipo-cupos',
  templateUrl: './creacion-tipo-cupos.component.html',
  styleUrls: ['./creacion-tipo-cupos.component.scss']
})
export class CreacionTipoCuposComponent {
  data: any;
  
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
    private router: Router,
    private fb: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
  ) {}

  ngOnInit(): void {
    this.data = history.state.data;
    this.editando = this.data.editando;
    if (this.editando) {
      this.infoCupo = this.data.info;
      this.setearCamposFormularios(this.infoCupo)
    }
  }

  async guardar() {
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

  async prepararCreacion() {
    this.loading = true;
    let newTipoCupo = this.prepararBodyTipoCupo();
    newTipoCupo.Activo = true;
    newTipoCupo.TipoParametroId = {
      "Id": 87
    };

    const res = await this.crearTipoCupo(newTipoCupo);
    if (res) {
      this.router.navigate(['/lista-tipo-cupos']);
    }
    this.loading = false;
  }

  setearCamposFormularios(data: any) {
    this.loading = true;
    const infoCupo = {
      nombre: data['Nombre'],
      descripcion: data['Descripcion'],
      codigo_abreviacion: data['CodigoAbreviacion'],
      numero_orden: data['NumeroOrden']
    }
    this.infoTipoCupo.patchValue(infoCupo);
    this.loading = false;
  }

  actualizar() {
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
    this.loading = true;
    this.infoCupo.Nombre = this.infoTipoCupo.get('nombre')!.value ?? this.infoCupo.Nombre;
    this.infoCupo.Descripcion = this.infoTipoCupo.get('descripcion')!.value ?? this.infoCupo.Descripcion;
    this.infoCupo.CodigoAbreviacion = this.infoTipoCupo.get('codigo_abreviacion')!.value ?? this.infoCupo.CodigoAbreviacion;
    this.infoCupo.NumeroOrden = Number(this.infoTipoCupo.get('numero_orden')!.value) ?? this.infoCupo.NumeroOrden;
    this.infoCupo.TipoParametroId = {
      "Id": this.infoCupo.TipoParametroId.Id
    };

    const res = await this.actualizarTipoCupo(this.infoCupo);
    if (res) {
      this.router.navigate(['/lista-tipo-cupos']);
    }
    this.loading = false;
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
            reject(false);
          }
        );
    });
  }

  actualizarTipoCupo(body: TipoParametro) {
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
            reject(false);
          }
        );
    });
  }

}
