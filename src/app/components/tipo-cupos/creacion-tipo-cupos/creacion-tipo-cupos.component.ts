import { Component } from '@angular/core';
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
  
  infoTipoCupo = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    codigo_abreviacion: ['', Validators.required],
    numero_orden: ['', Validators.required]
  });

  loading!: boolean;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
  ) {}

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
    let newTipoCupo = new TipoParametro();
    newTipoCupo.Nombre = this.infoTipoCupo.get('nombre')!.value ?? '';
    newTipoCupo.Descripcion = this.infoTipoCupo.get('descripcion')!.value ?? '';
    newTipoCupo.CodigoAbreviacion = this.infoTipoCupo.get('codigo_abreviacion')!.value ?? '';
    newTipoCupo.Activo = true;
    newTipoCupo.NumeroOrden = Number(this.infoTipoCupo.get('numero_orden')!.value) ?? 0;
    newTipoCupo.TipoParametroId = {
      "Id": 87
    };

    console.log(newTipoCupo)
    const res = await this.crearTipoCupo(newTipoCupo);
    console.log(res);
    if (res) {
      this.router.navigate(['/lista-tipo-cupos']);
    }
    this.loading = false;
  }

  crearTipoCupo(body: TipoParametro) {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .post('parametro', body)
        .subscribe(
          (res: any) => {
            console.log(res);
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
}
