import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { OikosService } from 'src/app/services/oikos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MatStepper } from '@angular/material/stepper';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { TercerosService } from 'src/app/services/terceros.service';


interface Tile {
  color: string;
  textColor: string;
  cols: number;
  rows: number;
  text: string;
}


@Component({
  selector: 'ngx-cargue-snp',
  templateUrl: './cargue-snp.component.html',
  styleUrls: ['./cargue-snp.component.scss']
})
export class CargueSnpComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  formulario: boolean = false;
  dataSource = new MatTableDataSource<any>();

  public editingRowId: number | null = null;


  colums: string [] = [
    'Orden',
    'Credencial',
    'IdentificacionEnExamenEstado',
    'IdentificacionActual',
    'NombreCompleto',
    'Correo',
    'Telefono',
    'CodigoProyecto',
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
    {text: '0', cols: 3, rows: 1, color: '#03678F', textColor: 'white'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
  ];

  proyectosCurriculares!: any[]
  periodos!: any[]
  facultades!: any[]
  proyectosPregrado!: any[];

  inscripciones: any = [];
  inscritosData: any[] = [];
  requisitoPrograma: any;
  detallesEvaluacion: any;

  totalInscritos: any = 0;
  inscritosPendientes: any = 0;
  inscritosCargados: any = 0;

  loading: boolean = false

  constructor(
    private _formBuilder: FormBuilder,
    private translate: TranslateService,
    private oikosService: OikosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private tercerosService: TercerosService,
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
            reject([]);
          });
    });
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.periodo_error'));
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
    // const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    // this.proyectosCurriculares = facultad.Opciones;
    const programas = this.proyectosPregrado.filter((item: any) => item.FacultadId == event.value);
    this.proyectosCurriculares = programas;
    this.loading = false;
  }

  async generarBusqueda(stepper: MatStepper) {
    this.loading = true;
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;

    this.inscripciones = [];
    this.detallesEvaluacion = [];
    this.inscritosData = [];
    this.inscritosCargados = 0;
    this.inscritosPendientes = 0;
    this.totalInscritos = 0;

    this.inscripciones = await this.buscarInscripciones(proyecto, periodo);
    const requisitoPrograma: any = await this.buscarRequisitoProgramaAcademico(proyecto, periodo)
    if (requisitoPrograma.length > 0 && typeof requisitoPrograma[0] === 'object' && requisitoPrograma[0] !== null && Object.keys(requisitoPrograma[0]).length > 0) {
      this.detallesEvaluacion = await this.verificarEstadoCargaIcfes()
      this.requisitoPrograma = requisitoPrograma[0]
      let count = 0
      for (const inscripcion of this.inscripciones) {
        const infoIcfes: any = await this.buscarInscripcionPregrado(inscripcion.Id)
        if (Object.keys(infoIcfes[0]).length > 0) {
          count += 1
          const persona: any = await this.consultarTercero(inscripcion.PersonaId);
          const detalle = this.detallesEvaluacion.find((item: any) => item.InscripcionId === inscripcion.Id)

          if (detalle) {
            this.inscritosCargados += 1;
          } else {
            this.inscritosPendientes += 1;
          }

          const inscritoData = {
            "persona_id": inscripcion.PersonaId,
            "inscripcion_id": inscripcion.Id,
            "inscripcion_pregrado_id": infoIcfes[0].Id,
            "numeral": count,
            "credencial": 123,
            "num_doc_icfes": infoIcfes[0].NumeroIdentificacionIcfes,
            "num_doc_actual": persona.NumeroIdentificacion,
            "nombre_completo": persona.NombreCompleto,
            "telefono": persona.Telefono,
            "correo": persona.UsuarioWSO2,
            "cod_proyecto": inscripcion.ProgramaAcademicoId,
            "snp": infoIcfes[0].CodigoIcfes,
            "estado_carga": detalle ? true : false
          }
          this.inscritosData.push(inscritoData);
        } else {
          continue;
        }
      }
      this.totalInscritos = this.inscritosPendientes + this.inscritosCargados;
      this.dataSource = new MatTableDataSource<any>(this.inscritosData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      stepper.next();
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_programa_sin_requisitos'), this.translate.instant('admision.programa_sin_requisitos'));
    }
    this.loading = false;
  }

  buscarInscripciones(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=Activo:true,ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + '&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
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
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            reject([]);
          });
    });
  }

  buscarInscripcionPregradoByCodigo(codigo_icfes: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion_pregrado?query=Activo:true,CodigoIcfes:' + codigo_icfes + '&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            reject([]);
          });
    });
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.tercerosService.get('personas/' + personaId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.tercero_error'));
            reject([]);
          });
    });
  }

  buscarRequisitoProgramaAcademico(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.get('requisito_programa_academico?query=Activo:true,RequisitoId:1,ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + '&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.requisito_programa_error'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  verificarEstadoCargaIcfes() {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.get('detalle_evaluacion?query=Activo:true,RequisitoProgramaAcademicoId.RequisitoId.Id:1&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.detalle_evaluacion_error'));
            reject([]);
          });
    });
  }

  manejarEntradaArchivos() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.leerArchivos(file);
      }
    };
    fileInput.click();
  }

  leerArchivos(file: File) {
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      this.loading = true;
      const fileContent = event.target.result;
      const resultados = fileContent.split(/\r?\n/)
      const detallesEvaluacionActuales: any = await this.recuperarDetallesEvaluacion(this.requisitoPrograma.Id)

      for (const resultado of resultados) {
        const datosIcfes = resultado.split(",")
        const inscripcion: any = await this.buscarInscripcionPregradoByCodigo(datosIcfes[0])
        if (Object.keys(inscripcion[0]).length <= 0) {
          this.popUpManager.showAlert(this.translate.instant('admision.titulo_inscripcion_no_encontrada'), this.translate.instant('admision.inscripcion_no_encontrada'));
          continue;
        }
        const inscripcionDetalleEv = detallesEvaluacionActuales.find((item: any) => item.InscripcionId == inscripcion[0].InscripcionId.Id)
        if (inscripcionDetalleEv) {
          this.popUpManager.showAlert(this.translate.instant('admision.titulo_detalle_evaluacion_existente'), this.translate.instant('admision.detalle_evaluacion_existente'));
          continue;
        }

        const icfesData = {
          "areas": [
            {"PLC": datosIcfes[11]},
            {"PMA": datosIcfes[12]},
            {"PSC": datosIcfes[13]},
            {"PCN": datosIcfes[14]},
            {"PIN": datosIcfes[15]}
          ],
          "global" : datosIcfes[10]
        }
        const jsonicfesData = JSON.stringify(icfesData);
        const detalleEvaluacionData = {
          "InscripcionId": inscripcion[0].InscripcionId.Id,
          "RequisitoProgramaAcademicoId": {
            "Id": this.requisitoPrograma.Id
          },
          "NotaRequisito": 10.00,
          "Activo": true,
          "EntrevistaId": null,
          "DetalleCalificacion": jsonicfesData
        }

        const res: any = await this.crearDetalleEvaluacion(detalleEvaluacionData);
        if (res.InscripcionId == inscripcion[0].InscripcionId.Id) {
          this.actualizarTablas(res.InscripcionId)
        }
      }
      this.loading = false;
    };
    reader.readAsText(file);
  }

  crearDetalleEvaluacion(detalleEvaluacionBody: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.post('detalle_evaluacion', detalleEvaluacionBody)
        .subscribe((res: any) => {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.creacion_detalle_evaluacion_exito'));
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.creacion_detalle_evaluacion_error'));
            reject([]);
          });
    });
  }

  recuperarDetallesEvaluacion(inscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.get('detalle_evaluacion?query=Activo:true,RequisitoProgramaAcademicoId.Id:' + inscripcionId + '&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            if (error == undefined) {
              resolve([])
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant("admision.detalle_evaluacion_error"));
              reject([]);
            }
            this.loading = false;
          });
    });
  }

  actualizarTablas(inscripcionId: any) {
    for (const inscripcion of this.inscritosData) {
      if (inscripcion.inscripcion_id == inscripcionId) {
        this.inscritosCargados += 1;
        this.inscritosPendientes = this.inscritosPendientes == 0 ? 0 : this.inscritosPendientes - 1;
        inscripcion.estado_carga = true;
      }
    }
    this.dataSource = new MatTableDataSource<any>(this.inscritosData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
