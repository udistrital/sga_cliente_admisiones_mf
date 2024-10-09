import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { OikosService } from 'src/app/services/oikos.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { MatStepper } from '@angular/material/stepper';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

interface Tile {
  color: string;
  textColor: string;
  cols: number;
  rows: number;
  text: string;
}


@Component({
  selector: 'ngx-listado-aspirantes-pregrado',
  templateUrl: './listado-aspirantes-pregrado.component.html',
  styleUrls: ['./listado-aspirantes-pregrado.component.scss']
})
export class ListadoAspirantesPregradoComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  formulario: boolean = false;
  dataSource!: MatTableDataSource<any>;

  public editingRowId: number | null = null;


  colums: string[] = [
    'Orden',
    'Credencial',
    'IdentificacionEnExamenEstado',
    'IdentificacionActual',
    'NombreCompleto',
    'Telefono',
    'Correo',
    'CodigoProyecto',
    'TipoInscripcion',
    'Puntaje',
    'EstadoInscripcion',
    'EstadoRecibo',
    'SNP',
    'Acciones'
  ];


  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorFacultad: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true;

  tiles: Tile[] = [
    { text: '0', cols: 7, rows: 1, color: '#03678F', textColor: 'white' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
    { text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black' },
  ];

  proyectosCurriculares!: any[]
  periodos!: any[]
  facultades!: any[]

  inscripciones: any = [];
  inscritosData: any[] = [];
  proyectosPregrado!: any[];

  inscripcionesSolicitadas: any = 0;
  inscripcionesAdmitidas: any = 0;
  inscripcionesNoAdmitidas: any = 0;
  inscripcionesOpcionadas: any = 0;
  inscripcionesInscritas: any = 0;
  inscripcionesInscritasObservacion: any = 0;
  inscripcionesAdmitidasLegalizadas: any = 0;
  inscripcionesAdmitidasObservacion: any = 0;
  inscripcionesMatriculadas: any = 0;
  inscripcionesNoOficializadas: any = 0;
  inscripcionesTotal: any = 0;

  valorOriginal: any = ""

  loading: boolean = false

  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService,
    private oikosService: OikosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private terceroMidService: TerceroMidService,
    private projectService: ProyectoAcademicoService,
    private sgaAdmisionService: SgaAdmisionesMid,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  async ngOnInit() {
    this.loading = true;
    await this.cargarSelects();
    this.loading = false;
  }

  async cargarSelects() {
    await this.cargarPeriodos();
    await this.cargarFacultades();
    await this.cargarProyectosPregrado();
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.periodo_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  cargarProyectosPregrado() {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true,NivelFormacionId:1&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          this.proyectosPregrado = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.facultades_error'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    this.loading = true;
    const programas = this.proyectosPregrado.filter((item: any) => item.FacultadId == event.value);
    this.proyectosCurriculares = programas;
    this.loading = false;
  }

  async generarBusquedaGeneral(stepper: MatStepper) {
    this.loading = true;
    this.sgaAdmisionService.get("admision/listadoaspirantegeneral/id_periodo?id_periodo=" + this.firstFormGroup.get('validatorPeriodo')?.value)
      .subscribe((response: any) => {
        if (response.success == true && response.status == 200) {
          response.data.forEach(async (inscripcion: any, index: number) => {
            this.firstFormGroup.get('validatorProyecto')?.setValue(inscripcion.ProgramaAcademicoId)
            this.firstFormGroup.get('validatorFacultad')?.setValue(inscripcion.ProgramaAcademicoId)
            this.cargarResumenInscripciones(inscripcion.EstadoInscripcionId.CodigoAbreviacion)
            const inscritoData = {
              "persona_id": inscripcion.PersonaId,
              "inscripcion_id": inscripcion.Id,
              "inscripcion_pregrado_id": inscripcion.Id,
              "numeral": index + 1,
              "credencial": 123,
              "num_doc_icfes": inscripcion.examenEstado[0].NumeroIdentificacionIcfes,
              "num_doc_actual": inscripcion.Persona.Data.NumeroIdentificacion,
              "nombre_completo": inscripcion.Persona.Data.NombreCompleto,
              "telefono": inscripcion.Persona.Data.Telefono,
              "correo": inscripcion.Persona.Data.UsuarioWSO2,
              "cod_proyecto": inscripcion.ProgramaAcademicoId,
              "tipo_inscripcion": inscripcion.TipoInscripcionId.Id,
              "puntaje": inscripcion.NotaFinal,
              "estado_inscripcion": inscripcion.EstadoInscripcionId.Nombre,
              "estado_recibo": "Pagado",
              "snp": inscripcion.examenEstado[0].CodigoIcfes,
              "estado_edicion": false
            }
            this.inscritosData.push(inscritoData);
          });
          this.dataSource = new MatTableDataSource<any>(this.inscritosData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          stepper.next();
          this.loading = false;
        } else {
          this.popUpManager.showAlert(this.translate.instant('admision.titulo_no_aspirantes'), this.translate.instant('admision.error_no_aspirantes'));
        }
      })
    
  }

  async generarBusqueda(stepper: MatStepper) {
    this.loading = true;
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;


    this.reiniciarDatosTablas();
    this.inscripciones = await this.buscarInscripciones(proyecto, periodo);
    let count = 0
    if (this.inscripciones.length > 0 && typeof this.inscripciones[0] === 'object' && this.inscripciones[0] !== null && Object.keys(this.inscripciones[0]).length > 0) {
      for (const inscripcion of this.inscripciones) {
        const infoIcfes: any = await this.buscarInscripcionPregrado(inscripcion.Id)
        if (Object.keys(infoIcfes[0]).length > 0) {
          count += 1
          const persona: any = await this.consultarTercero(inscripcion.PersonaId);
          this.cargarResumenInscripciones(inscripcion.EstadoInscripcionId.CodigoAbreviacion)

          const inscritoData = {
            "persona_id": inscripcion.PersonaId,
            "inscripcion_id": inscripcion.Id,
            "inscripcion_pregrado_id": infoIcfes[0].Id,
            "numeral": count,
            "credencial": 123,
            "num_doc_icfes": infoIcfes[0].NumeroIdentificacionIcfes,
            "num_doc_actual": persona.Data.NumeroIdentificacion,
            "nombre_completo": persona.Data.NombreCompleto,
            "telefono": persona.Data.Telefono,
            "correo": persona.Data.UsuarioWSO2,
            "cod_proyecto": inscripcion.ProgramaAcademicoId,
            "tipo_inscripcion": inscripcion.TipoInscripcionId.Id,
            "puntaje": inscripcion.NotaFinal,
            "estado_inscripcion": inscripcion.EstadoInscripcionId.Nombre,
            "estado_recibo": "Pagado",
            "snp": infoIcfes[0].CodigoIcfes,
            "estado_edicion": false
          }
          this.inscritosData.push(inscritoData);
        } else {
          continue;
        }
      }
      this.dataSource = new MatTableDataSource<any>(this.inscritosData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      stepper.next();
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_no_aspirantes'), this.translate.instant('admision.error_no_aspirantes'));
    }
    this.loading = false;
  }

  buscarInscripciones(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=Activo:true,ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:2&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.error(error);
            this.loading = false;
            reject([]);
          });
    });
  }

  buscarInscripcionPregrado(inscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion_pregrado?query=Activo:true,InscripcionId.Id:' + inscripcionId + '&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.error(error);
            this.loading = false;
            reject([]);
          });
    });
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/' + personaId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.tercero_error'));
            console.error(error);
            this.loading = false;
            reject([]);
          });
    });
  }

  descargarArchivo() {
    // Contenido del archivo de texto
    const contenidoArchivo = this.inscritosData.map(objeto => `${objeto.snp}, ${objeto.num_doc_icfes}`).join('\n');

    // Crear un objeto Blob con el contenido del archivo
    const blob = new Blob([contenidoArchivo], { type: 'text/plain' });

    // Crear un objeto URL del Blob
    const url = window.URL.createObjectURL(blob);

    // Crear un elemento <a> para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivo.txt'; // Nombre del archivo
    document.body.appendChild(a);

    // Simular un clic en el elemento <a> para iniciar la descarga
    a.click();

    // Limpiar el objeto URL y eliminar el elemento <a>
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  editar = async (orden: any) => {
    if (this.editingRowId === orden) {
      const row = this.inscritosData.find(item => item.numeral === orden);
      if (row.snp != this.valorOriginal) {
        this.loading = true;
        let inscripcionP: any = await this.buscarInscripcionPregrado(row.inscripcion_id);
        inscripcionP[0].CodigoIcfes = row.snp;
        const res = await this.actualizarInscripcionPregrado(inscripcionP[0]);
        this.valorOriginal = "";
        this.loading = false;
      }
      this.editingRowId = null;
      this.formulario = false;
      this.cambiarEstado(orden, false)
    } else {
      const row = this.inscritosData.find(item => item.numeral === orden);
      this.valorOriginal = row.snp;
      this.editingRowId = orden;
      this.formulario = true;
      this.cambiarEstado(orden, true)
    }
  }

  cambiarEstado(orden: any, estado: any) {
    for (const inscripcion of this.inscritosData) {
      if (inscripcion.numeral == orden) {
        inscripcion.estado_edicion = estado;
      }
    }
    this.dataSource = new MatTableDataSource<any>(this.inscritosData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  reiniciarDatosTablas() {
    this.inscripciones = [];
    this.inscritosData = [];
    this.inscripcionesSolicitadas = 0;
    this.inscripcionesAdmitidas = 0;
    this.inscripcionesNoAdmitidas = 0;
    this.inscripcionesOpcionadas = 0;
    this.inscripcionesInscritas = 0;
    this.inscripcionesInscritasObservacion = 0;
    this.inscripcionesTotal = 0;
  }

  cargarResumenInscripciones(estado: any) {
    this.inscripcionesTotal += 1;
    switch (estado) {
      case "INSCSOL":
        this.inscripcionesSolicitadas += 1;
        break;
      case "ADM":
        this.inscripcionesAdmitidas += 1;
        break;
      case "OPC":
        this.inscripcionesOpcionadas += 1;
        break;
      case "NOADM":
        this.inscripcionesNoAdmitidas += 1;
        break;
      case "INSCREAL":
        this.inscripcionesInscritas += 1;
        break;
      case "INSCOBS":
        this.inscripcionesInscritasObservacion += 1;
        break;
      case "ADMLEG":
        this.inscripcionesAdmitidasLegalizadas += 1;
        break;
      case "ADMOBS":
        this.inscripcionesAdmitidasObservacion += 1;
        break;
      case "ADMAT":
        this.inscripcionesMatriculadas += 1;
        break;
      case "NOOFI":
        this.inscripcionesNoOficializadas += 1;
        break;
      default:
        console.error("Estado inesperado:", estado);
    }
  }

  async actualizarInscripcionPregrado(inscripcioBody: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.put('inscripcion_pregrado', inscripcioBody)
        .subscribe((res: any) => {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.actualizacion_detalle_evaluacion_exito'));
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.actualizacion_detalle_evaluacion_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}