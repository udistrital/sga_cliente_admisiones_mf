import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Criterio } from 'src/app/models/admision/criterio';

@Component({
    selector: 'ngx-dialogo-criterios',
    templateUrl: './dialogo-criterios.component.html',
    styleUrls: ['./dialogo-criterios.component.scss'],
    standalone: false
})
export class DialogoCriteriosComponent implements OnInit {

  criterio!: any;
  criterioForm!: FormGroup;
  examenEstadoForm!: FormGroup;
  subcriterio: boolean;
  confirmando = false;

  constructor(
    public dialogRef: MatDialogRef<DialogoCriteriosComponent>,
    private builder: FormBuilder,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.subcriterio = data.sub;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.criterioForm = this.builder.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
      CodigoAbreviacion: ['', Validators.required],
      Asistencia: [false, Validators.required],
      ExamenEstado: [false, Validators.required],
    });
    this.examenEstadoForm = this.builder.group({
      Saber11:[false, Validators.required],
      SaberPro:[false, Validators.required],
      SPN:[false, Validators.required],
      ArchivoAdjunto: [false, Validators.required],
    });
    if (!this.data.acceso?.validar(this.data.permiso)) { this.dialogRef.close(); return; }
    if (this.data.oldCriterio !== undefined) {
      this.criterioForm.setValue({
        Nombre: this.data.oldCriterio.Nombre,
        Descripcion: this.data.oldCriterio.Descripcion,
        CodigoAbreviacion: this.data.oldCriterio.CodigoAbreviacion,
        Asistencia: this.data.oldCriterio.Asistencia ?? false,
        ExamenEstado: this.data.oldCriterio.ExamenEstado ? this.data.oldCriterio.ExamenEstado : false,
      });
      this.examenEstadoForm.setValue({
        Saber11: this.data.oldCriterio?.Subcriterios?.find((subcriterio: any) => subcriterio.Nombre === 'Saber11') !== undefined,
        SaberPro: this.data.oldCriterio?.Subcriterios?.find((subcriterio: any) => subcriterio.Nombre === 'SaberPro') !== undefined,
        SPN: this.data.oldCriterio?.Subcriterios?.find((subcriterio: any) => subcriterio.Nombre === 'SPN') !== undefined,
        ArchivoAdjunto: this.data.oldCriterio?.Subcriterios?.find((subcriterio: any) => subcriterio.Nombre === 'ArchivoAdjunto') !== undefined,
      });
    }
  }

  get puedeGuardar(): boolean { return this.data.acceso?.permite(this.data.permiso) === true; }

  enviarCriterio() {
    if (this.confirmando) return;
    if (!this.data.acceso?.validar(this.data.permiso)) return;
    if (this.criterioForm.invalid) {
      this.criterioForm.markAllAsTouched();
      return;
    }
    this.confirmando = true;
    return this.popUpManager.showConfirmAlert(
      this.data.oldCriterio === undefined ?
      this.translate.instant('admision.seguro_crear_criterio') :
      this.translate.instant('admision.seguro_modificar_criterio')
    ).then((ok:any) => {
      if(ok.isConfirmed) {
        if (!this.data.acceso?.validar(this.data.permiso)) return;
        if (this.data.oldCriterio === undefined) {
          this.criterio = { ...this.criterioForm.value };
          this.criterio.Activo = true;
          this.criterio.NumeroOrden = 1;
          this.criterio.RequisitoPadreId = null;

          if (this.criterioForm.value.ExamenEstado === true) {
            this.criterio.Subcriterios = this.subcriteriosExamenEstado();
          }
        } else {
          this.criterio = { ...this.data.oldCriterio };
          this.criterio.Nombre = this.criterioForm.value.Nombre;
          this.criterio.Descripcion = this.criterioForm.value.Descripcion;
          this.criterio.CodigoAbreviacion = this.criterioForm.value.CodigoAbreviacion;
          this.criterio.Asistencia = this.criterioForm.value.Asistencia;
          this.criterio.ExamenEstado = this.criterioForm.value.ExamenEstado;
        }
        this.dialogRef.close(this.criterio);
      }
    }).finally(() => {
      this.confirmando = false;
    });
  }

  subcriteriosExamenEstado(){
    const subcriterios = [];
    for (const controlName in this.examenEstadoForm.controls) {

      if (this.examenEstadoForm.get(controlName)?.value) {
        const subcriterio = new Criterio();
        subcriterio.Activo = true;
        subcriterio.Nombre = controlName;
        subcriterio.Descripcion = controlName;
        subcriterio.CodigoAbreviacion = controlName;
        subcriterios.push(subcriterio);
      }
    }
    return subcriterios;
  }

}
