import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dialogo-documentos-transferencias',
  templateUrl: './dialogo-documentos-transferencias.component.html',
  styleUrls: ['./dialogo-documentos-transferencias.component.scss']
})
export class DialogoDocumentosTransferenciasComponent implements OnInit {

  revisionForm!: FormGroup;
  documento: any;
  loading!: boolean;
  pruebaEspecifica!: boolean;
  fecha!: string;

  constructor(
    public dialogRef: MatDialogRef<DialogoDocumentosTransferenciasComponent>,
    @Inject(MAT_DIALOG_DATA) private data:any,
    private translate: TranslateService,
    private builder: FormBuilder,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.loading = true;
    this.documento = this.data.documento.Documento['changingThisBreaksApplicationSecurity'];
    this.pruebaEspecifica = this.data.documento.fecha == '';
    // const fecha = this.data.documento.fecha.substring(0, this.data.documento.fecha.length - 1);
    this.fecha = this.data.documento.fecha.substring(0, this.data.documento.fecha.length - 1);

    this.revisionForm.setValue({
      observacion: this.data.documento.observacion,
      fecha: this.fecha,
    });
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      observacion: [''],
      fecha: '',
    });
  }

  guardarRevision() {
    this.dialogRef.close(this.revisionForm.value);
  }

  docCargado() {
    this.loading = false;
  }

}
