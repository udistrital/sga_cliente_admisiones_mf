import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { AsignacionCupoService } from 'src/app/services/asignacion_cupo.service';
import { DocumentoService } from 'src/app/services/documento.service';

@Component({
  selector: 'app-soporte-cupo-inscripcion',
  templateUrl: './soporte-cupo-inscripcion.component.html',
  styleUrls: ['./soporte-cupo-inscripcion.component.scss']
})
export class SoporteCupoInscripcionComponent {

  selectedFile: File | null = null;
  base64String!: string;
  errorMessage!: string;
  comentario = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(
    public dialogRef: MatDialogRef<AsignacionCupoService>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.errorMessage = '';
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Please upload a valid PDF file.';
        return;
      }
      const reader = new FileReader();
      reader.onload = this.handleFile.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  handleFile(event: any): void {
    const binaryString = event.target.result;
    this.base64String = btoa(binaryString);
  }

  validarInputs() {
    if (this.comentario.invalid) {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('cupos.error_soporte_comentario'));
    }

    if (this.base64String === undefined) {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('cupos.error_soporte_archivo'));
    }
    if (this.base64String != undefined && this.comentario.valid) {
      this.data.comentario = this.comentario.value;
      this.data.base64 = this.base64String;
      this.dialogRef.close({ result: this.data });
    }
  }
}
