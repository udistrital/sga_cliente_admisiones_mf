import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Criterio } from 'src/app/models/admision/criterio';

@Component({
  selector: 'ngx-dialogo-criterios',
  templateUrl: './dialogo-criterios.component.html',
  styleUrls: ['./dialogo-criterios.component.scss']
})
export class DialogoCriteriosComponent implements OnInit {

  criterio!: any;
  criterioForm!: FormGroup;
  subcriterio: boolean;

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
    });
    if (this.data.oldCriterio !== undefined) {
      this.criterioForm.setValue({
        Nombre: this.data.oldCriterio.Nombre,
        Descripcion: this.data.oldCriterio.Descripcion,
        CodigoAbreviacion: this.data.oldCriterio.CodigoAbreviacion,
        Asistencia: this.data.oldCriterio.Asistencia,
      });
    }
  }

  enviarCriterio() {
    this.popUpManager.showConfirmAlert(
      this.data.oldCriterio === undefined ?
      this.translate.instant('admision.seguro_crear_criterio') :
      this.translate.instant('admision.seguro_modificar_criterio')
    ).then((ok:any) => {
      if(ok.value) {
        if (this.data.oldCriterio === undefined) {
          this.criterio = new Criterio();
          this.criterio = this.criterioForm.value;
          this.criterio.Activo = true;
          this.criterio.NumeroOrden = 1;
          this.criterio.RequisitoPadreId = null;
        } else {
          this.criterio = this.data.oldCriterio;
          this.criterio.Nombre = this.criterioForm.value.Nombre;
          this.criterio.Descripcion = this.criterioForm.value.Descripcion;
          this.criterio.CodigoAbreviacion = this.criterioForm.value.CodigoAbreviacion;
          this.criterio.Asistencia = this.criterioForm.value.Asistencia;
        }
        this.dialogRef.close(this.criterio);
      }
    });
  }

}
