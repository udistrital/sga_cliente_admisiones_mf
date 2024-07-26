import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { TipoInscripcion } from 'src/app/models/inscripcion/tipo_inscripcion';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';

@Component({
  selector: 'app-creacion-tipo-inscipcion',
  templateUrl: './creacion-tipo-inscipcion.component.html',
  styleUrls: ['./creacion-tipo-inscipcion.component.scss']
})
export class CreacionTipoInscipcionComponent {
  data: any;

  infoTipoInscripcion = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    codigo_abreviacion: ['', Validators.required],
    numero_orden: ['', Validators.required],
    nivel: ['', Validators.required],
    especial: this.fb.control(false),
  });

  loading!: boolean;
  editando: boolean = false;
  infoInscripcion!: any;
  niveles!: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private projectService: ProyectoAcademicoService,
    private inscripcionService: InscripcionService,
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.cargarNiveles();
    this.data = history.state.data;
    this.editando = this.data.editando
    if (this.editando) {
      this.infoInscripcion = this.data.info
      this.setearCamposFormularios(this.infoInscripcion)
    }
    this.loading = false;
  }

  cargarNiveles() {
    return new Promise((resolve, reject) => {
      this.projectService
        .get('nivel_formacion?query=Activo:true&sortby=Id&order=asc')
        .subscribe(
          (res: any) => {
            this.niveles = res
            resolve(res);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.error_nieveles'));
            reject([]);
          }
        );
    });
  }

  async guardar() {
    this.infoTipoInscripcion.markAllAsTouched();
    if (this.infoTipoInscripcion.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('tipo_inscripcion.tooltip_crear'),
        this.translate.instant('tipo_inscripcion.seguro_continuar_registrar_tipo_inscripcion'),
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
    let newTipoInscripcion = new TipoInscripcion();
    newTipoInscripcion.Nombre = this.infoTipoInscripcion.get('nombre')!.value ?? '';
    newTipoInscripcion.Descripcion = this.infoTipoInscripcion.get('descripcion')!.value ?? '';
    newTipoInscripcion.CodigoAbreviacion = this.infoTipoInscripcion.get('codigo_abreviacion')!.value ?? '';
    newTipoInscripcion.Activo = true;
    newTipoInscripcion.NumeroOrden = Number(this.infoTipoInscripcion.get('numero_orden')!.value) ?? 0;
    newTipoInscripcion.NivelId = Number(this.infoTipoInscripcion.get('nivel')!.value) ?? 0;
    newTipoInscripcion.Especial = this.infoTipoInscripcion.get('especial')!.value ?? false;

    const res = await this.crearTipoInscripcion(newTipoInscripcion);
    if (res) {
      this.router.navigate(['/lista-tipo-inscripcion']);
    }
    this.loading = false;
  }

  crearTipoInscripcion(body: TipoInscripcion) {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .post('tipo_inscripcion', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_creado'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('tipo_inscripcion.error_tipo_inscripcion_creado'));
            reject(false);
          }
        );
    });
  }

  setearCamposFormularios(data: any) {
    const infoInscripcion: any = {
      nombre: data['Nombre'],
      descripcion: data['Descripcion'],
      codigo_abreviacion: data['CodigoAbreviacion'],
      numero_orden: data['NumeroOrden'],
      especial: data['Especial']
    }
    this.infoTipoInscripcion.patchValue(infoInscripcion);
  }

  actualizar() {
    this.infoTipoInscripcion.markAllAsTouched();
    if (this.infoTipoInscripcion.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('tipo_inscripcion.tooltip_editar'),
        this.translate.instant('tipo_inscripcion.seguro_actualizar_tipo_inscripcion'),
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
    this.infoInscripcion.Nombre = this.infoTipoInscripcion.get('nombre')!.value ?? this.infoInscripcion.Nombre;
    this.infoInscripcion.Descripcion = this.infoTipoInscripcion.get('descripcion')!.value ?? this.infoInscripcion.Descripcion;
    this.infoInscripcion.CodigoAbreviacion = this.infoTipoInscripcion.get('codigo_abreviacion')!.value ?? this.infoInscripcion.CodigoAbreviacion;
    this.infoInscripcion.NumeroOrden = Number(this.infoTipoInscripcion.get('numero_orden')!.value) ?? this.infoInscripcion.NumeroOrden;
    this.infoInscripcion.NivelId = Number(this.infoTipoInscripcion.get('nivel')!.value) ?? this.infoInscripcion.NivelId;
    this.infoInscripcion.Especial = this.infoTipoInscripcion.get('especial')!.value ?? this.infoInscripcion.Especial;

    const res = await this.actualizarTipoInscripcion(this.infoInscripcion);
    if (res) {
      this.router.navigate(['/lista-tipo-inscripcion']);
    }
    this.loading = false;
  }

  actualizarTipoInscripcion(body: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .put('tipo_inscripcion/', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_actualizado'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_actualizado_error'));
            reject(false);
          }
        );
    });
  }
}
