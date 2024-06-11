import { Component, OnInit } from '@angular/core';
import { ParametrosService } from 'src/app/services/parametros.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OikosService } from 'src/app/services/oikos.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { ReporteVisualizerComponent } from 'src/app/components/reporte-visualizer/reporte-visualizer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-reporte-codificacion',
  templateUrl: './reporte-codificacion.component.html',
  styleUrls: ['./reporte-codificacion.component.scss']
})
export class ReporteCodificacionComponent implements OnInit {


  reporteForm: FormGroup;
  periodosAcademicos: any[] = [];
  facultades: any[] = [];
  proyectos: any[] = [];
  reportePdf: string = "";
  reporteExcel: string = "";
  isDocuments: boolean = false
  blobPdf: Blob = new Blob;

  displayedColumns: string[] = ['Periodo', 'Facultad', 'Proyecto', 'Acciones'];
  dataSource: { Periodo: string, Facultad: string, Proyecto: string }[] = [];


  constructor(
    private fb: FormBuilder,
    private sgaParametrosService: ParametrosService,
    private sgaOikosService: OikosService,
    private sgaProyectoAcademicoService: ProyectoAcademicoService,
    private sgaAdmisionesMidService: SgaAdmisionesMid,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar

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
      }
    )
  }

  caragarFacultades() {
    this.sgaOikosService.get('dependencia?query=DependenciaTipoDependencia__TipoDependenciaId__Nombre:FACULTAD&limit=0&sortby=Nombre&order=asc').subscribe(
      (Response: any) => {
        this.facultades = Response
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

  downloadFile(base64: string, fileName: string) {
    const sliceSize = 512
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
    saveAs(this.blobPdf, fileName);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ReporteVisualizerComponent, {
      width: '80vw',   // Set width to 60 percent of view port width
      height: '90vh',
      data: "data:application/pdf;base64," + this.reportePdf
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  onSubmit() {
    if (this.reporteForm.valid) {

      this.openSnackBar("Generando reporte porfavor espera", "Aceptar")

      this.isDocuments = false
      const idProyecto = this.reporteForm.get('proyectoCurricular')?.value
      const idPeriodo = this.reporteForm.get('periodoAcademico')?.value
      const idFacultad = this.reporteForm.get('facultad')?.value
      const nombreProyecto = (this.proyectos.find(element => element.Id === idProyecto)).Nombre
      const nombreFacultad = (this.facultades.find(element => element.Id === idFacultad)).Nombre
      const nombrePeriodo = (this.periodosAcademicos.find(element => element.Id === idPeriodo)).Nombre
      this.dataSource = [
        { Periodo: nombrePeriodo, Facultad: nombreFacultad, Proyecto: nombreProyecto }
      ]

      this.sgaAdmisionesMidService.get(`reporte/?id_periodo=${idPeriodo}&id_proyecto=${idProyecto}`).subscribe(
        (Response: any) => {
          if (Response.status == 200 && Response.success) {

            this.reporteExcel = Response.data.Excel
            this.reportePdf = Response.data.Pdf
            this.openSnackBar("Reporte Generado", "Aceptar")
            this.isDocuments = true
          } else {
            this.openSnackBar("Ocurrio un error", "Aceptar")
          }
        }
      )

    } else {
      // Display an error message or handle invalid form state
    }
  }

}
