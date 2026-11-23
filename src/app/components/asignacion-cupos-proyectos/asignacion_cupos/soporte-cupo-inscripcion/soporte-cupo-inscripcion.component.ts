import { Component, Inject, inject } from '@angular/core';
import { AccesoConfiguracionAdmisionService } from 'src/app/services/acceso-configuracion-admision.service';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { AsignacionCupoService } from 'src/app/services/asignacion_cupo.service';
import { DocumentoService } from 'src/app/services/documento.service';

@Component({
    selector: 'app-soporte-cupo-inscripcion',
    templateUrl: './soporte-cupo-inscripcion.component.html',
    styleUrls: ['./soporte-cupo-inscripcion.component.scss'],
    standalone: false
})
export class SoporteCupoInscripcionComponent {
  readonly acceso = inject(AccesoConfiguracionAdmisionService).crear(['cargar_soporte_cupo_proyecto']);

  selectedFile: File | null = null;
  leyendoArchivo = false;
  private lectura = 0;
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
    if (!this.acceso.validar('cargar_soporte_cupo_proyecto')) return;
    const lectura = ++this.lectura;
    const file = event.target.files?.[0];
    this.selectedFile = null;
    this.base64String = '';
    this.leyendoArchivo = false;
    this.errorMessage = '';
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Seleccione un archivo PDF válido.';
        return;
      }
      const reader = new FileReader();
      this.leyendoArchivo = true;
      reader.onload = () => {
        if (lectura !== this.lectura) return;
        this.base64String = String(reader.result).split(',')[1] ?? '';
        this.selectedFile = file;
        this.leyendoArchivo = false;
      };
      reader.onerror = () => {
        if (lectura !== this.lectura) return;
        this.errorMessage = 'No fue posible leer el archivo PDF.';
        this.leyendoArchivo = false;
      };
      reader.readAsDataURL(file);
    }
  }

  handleFile(event: any): void {
    const binaryString = event.target.result;
    this.base64String = btoa(binaryString);
  }

  validarInputs() {
    if (!this.acceso.validar('cargar_soporte_cupo_proyecto')) return;
    if (this.leyendoArchivo) return;
    if (this.comentario.invalid) {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('cupos.error_soporte_comentario'));
    }

    if (!this.base64String) {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('cupos.error_soporte_archivo'));
    }
    if (this.base64String && this.comentario.valid && this.comentario.value?.trim()) {
      this.dialogRef.close({ result: {
        ...this.data,
        comentario: this.comentario.value.trim(),
        base64: this.base64String,
        nombreArchivo: this.selectedFile?.name,
      } });
    }
  }
}
