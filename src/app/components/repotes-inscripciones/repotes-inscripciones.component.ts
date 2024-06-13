import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { ParametrosService } from 'src/app/services/parametros.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OikosService } from 'src/app/services/oikos.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { ReporteVisualizerComponent } from '../reporte-visualizer/reporte-visualizer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tipoReporteInscritos } from 'src/app/models/reportes/tipo-reportes-inscripciones';
import { estadosReintegrosTransferencias } from 'src/app/models/reportes/estados-reintegros-transferencias';
import { InscripcionService } from 'src/app/services/inscripcion.service';

@Component({
  selector: 'app-repotes-inscripciones',
  templateUrl: './repotes-inscripciones.component.html',
  styleUrls: ['./repotes-inscripciones.component.scss']
})
export class RepotesInscripcionesComponent {

  reporteForm: FormGroup;
  periodosAcademicos: any[] = [];
  facultades: any[] = [];
  proyectos: any[] = [];
  niveles: any[] = [];
  tiposInscripcion: any[] =[];
  reportePdf: string = "";
  reporteExcel: string = "";
  isDocuments: boolean = false
  blobPdf: Blob = new Blob;
  columnas: any[] = []
  tipoReporte = tipoReporteInscritos
  estados = estadosReintegrosTransferencias
  generalReport: boolean = false
  isTranferenciaOrReintegro = false

  displayedColumns: string[] = ['Periodo', 'Facultad', 'Proyecto', 'Acciones'];
  dataSource: { Periodo: string, Facultad: string, Proyecto: string }[] = [];


  constructor(
    private fb: FormBuilder,
    private sgaParametrosService: ParametrosService,
    private sgaOikosService: OikosService,
    private sgaProyectoAcademicoService: ProyectoAcademicoService,
    private sgaAdmisionesMidService: SgaAdmisionesMid,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private sgaInscripcionService: InscripcionService,

  ) {
    this.reporteForm = this.fb.group({
      periodoAcademico: ["", Validators.required],
      facultad: ["", Validators.required],
      proyectoCurricular: ["", Validators.required],
      tipoReporte: ["", Validators.required],
      selectColumnas: ["", Validators.required],
      selectTipoInscripcion: ["", Validators.required],
      selectNiveles: [""],
      selectEstado: [""],
    });
  }

  ngOnInit(): void {
    this.caragarPeriodos()
    this.caragarFacultades()
    this.caragarTipoInscripcion()
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

  caragarNivelesAcademicos() {
    this.sgaProyectoAcademicoService.get(`nivel_formacion?query=&limit=0&sortby=Nombre&order=asc`).subscribe(
      (Response: any) => {
        this.niveles = Response
      }
    )
  }

  caragarTipoInscripcion() {
    console.log("Llama")
    this.sgaInscripcionService.get(`tipo_inscripcion?query=Activo:true&limit=0&sortby=Nombre&order=asc`).subscribe(
      (Response: any) => {
        this.tiposInscripcion = Response
      }
    )
  }

  onFacultadChange(event: any) {
    const facultadId = event.value;
    this.caragarProyectosAcademicos(facultadId)
  }

  onNivelAcademicoChange(event: any) {
    this.reporteForm.get('proyectoCurricular')?.setValue(event.value)
    this.reporteForm.get('facultad')?.setValue(0)
  }

  onReporteChange(event: any) {
    if (event.value == 4) {
      this.caragarNivelesAcademicos()
      this.generalReport = true
      this.isTranferenciaOrReintegro = false
    } else if (event.value >= 5){
      this.isTranferenciaOrReintegro = true
      this.generalReport = false
    }else {
      this.isTranferenciaOrReintegro = false
      this.generalReport = false
    }
    this.reporteForm.get('selectColumnas')?.setValue([])
    this.columnas = this.tipoReporte[event.value - 1].Columnas
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

      const dataReporte = {
        "Proyecto": this.reporteForm.get('proyectoCurricular')?.value,
        "Periodo": this.reporteForm.get('periodoAcademico')?.value,
        "Reporte": this.reporteForm.get('tipoReporte')?.value,
        "Columnas": this.reporteForm.get('selectColumnas')?.value,
        "TipoInscripcion": this.reporteForm.get('selectTipoInscripcion')?.value,
        "EstadoInscripcion": this.reporteForm.get('selectEstado')?.value
      }

      const idProyecto = this.reporteForm.get('proyectoCurricular')?.value
      const idPeriodo = this.reporteForm.get('periodoAcademico')?.value
      const idFacultad = this.reporteForm.get('facultad')?.value
      let nombreProyecto = ""
      let nombreFacultad = ""
      if( this.generalReport){
        nombreProyecto = (this.niveles.find(element => element.Id === idProyecto)).Nombre
        nombreFacultad = (this.niveles.find(element => element.Id === idProyecto)).Nombre
      }else {
        nombreProyecto = (this.proyectos.find(element => element.Id === idProyecto)).Nombre
        nombreFacultad = (this.facultades.find(element => element.Id === idFacultad)).Nombre
      }
      
      const nombrePeriodo = (this.periodosAcademicos.find(element => element.Id === idPeriodo)).Nombre
      this.dataSource = [
        { Periodo: nombrePeriodo, Facultad: nombreFacultad, Proyecto: nombreProyecto }
      ]

      this.sgaAdmisionesMidService.post('reporte', dataReporte).subscribe(
        (Response: any) => {
          if (Response.Status == 200 && Response.Success) {

            this.reporteExcel = Response.Data.Excel
            this.reportePdf = Response.Data.Pdf
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
