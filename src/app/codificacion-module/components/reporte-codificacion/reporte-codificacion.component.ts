import { Component, OnInit } from '@angular/core';
import { SgaParametrosService } from '../../services/sga_parametros.service';
import { PeriodoAcademico } from '../../models/types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SgaOikosService } from '../../services/sga_oikos.service';
import { SgaProyectoAcademicoService } from '../../services/sga_proyecto_academico.service';
import { SgaAdmisionesMidService } from '../../services/sga_admisiones_mid.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-reporte-codificacion',
  templateUrl: './reporte-codificacion.component.html',
  styleUrls: ['./reporte-codificacion.component.scss']
})
export class ReporteCodificacionComponent implements OnInit {


  reporteForm: FormGroup;
  periodosAcademicos: PeriodoAcademico[] = [];
  facultades: any[] = [];
  proyectos: any[] = [];
  reportePdf: string = "";
  reportePdfSanitized: SafeResourceUrl = ""
  reporteExcel: string = "";
  isDocuments: boolean = false
  blobPdf: Blob = new Blob;

  constructor(
    private fb: FormBuilder,
    private sgaParametrosService: SgaParametrosService,
    private sgaOikosService: SgaOikosService,
    private sgaProyectoAcademicoService: SgaProyectoAcademicoService,
    private sgaAdmisionesMidService: SgaAdmisionesMidService,
    private sanitizer: DomSanitizer,

  ) {
    this.reporteForm = this.fb.group({
      periodoAcademico: ["", Validators.required],
      facultad: ["", Validators.required],
      proyectoCurricular: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.caragarPeriodos()
    this.caragarFacultades()
  }

  caragarPeriodos() {
    this.sgaParametrosService.get('periodo?query=&limit=0&sortby=Nombre&order=asc').subscribe(
      (Response: any) => {
        this.periodosAcademicos = Response.Data
        console.log(this.periodosAcademicos)
      }
    )
  }

  caragarFacultades() {
    this.sgaOikosService.get('dependencia?query=&limit=0&sortby=Nombre&order=asc').subscribe(
      (Response: any) => {
        this.facultades = Response
        console.log(this.facultades)
      }
    )
  }

  caragarProyectosAcademicos(idFacultad: number) {
    this.sgaProyectoAcademicoService.get(`proyecto_academico_institucion?query=FacultadId:${idFacultad}&limit=0&sortby=Nombre&order=asc`).subscribe(
      (Response: any) => {
        this.proyectos = Response
      }
    )
  }

  onFacultadChange(event: any) {
    const facultadId = event.value;
    this.caragarProyectosAcademicos(facultadId)
  }

  downloadFile(base64: string, sliceSize = 512) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    this.blobPdf = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(this.blobPdf, "pdf.pdf");
  }

  UrlPdf() {
    return this.sanitizer.bypassSecurityTrustHtml(this.reportePdf)
  }

  onSubmit() {
    if (this.reporteForm.valid) {
      const idProyecto = this.reporteForm.get('proyectoCurricular')?.value
      const idPeriodo = this.reporteForm.get('periodoAcademico')?.value

      this.sgaAdmisionesMidService.get(`reporte/?id_periodo=${idPeriodo}&id_proyecto=${idProyecto}`).subscribe(
        (Response: any) => {
          this.reporteExcel = Response.data.Excel
          this.reportePdf = Response.data.Pdf
          //this.visualizacionPdf = 'data:application/pdf;base64,'+Response.data.Pdf
          this.isDocuments = true
        }
      )

    } else {
      // Display an error message or handle invalid form state
      console.log('Please fill in all required fields.');
    }
  }

}
