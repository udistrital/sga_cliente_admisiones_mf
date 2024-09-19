import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as saveAs from 'file-saver';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'app-listado-admitidos',
  templateUrl: './listado-admitidos.component.html',
  styleUrls: ['./listado-admitidos.component.scss']
})
export class ListadoAdmitidosComponent {

  //NgIf
  viewFacultades: boolean = false;
  viewCurriculares: boolean = false;
  viewSubcriterios: boolean = true;
  viewTablePuntaje: boolean = true;

  viewAspirantesTables: boolean = false;



  //Formulario variables
  nivelControl = new FormControl('', [Validators.required]);
  periodoControl = new FormControl('', [Validators.required]);
  criterioControl = new FormControl('', [Validators.required]);


  //tablas
  columnsCurriculares = ['curricular', 'estado', 'accion'];
  columnsFacultades = ['facultad', 'estado', '%', 'accion'];

  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculares !: MatTableDataSource<any>;

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;


  //dataCompartido apra la tablas de aspirantes
  public aspirantesAdmitidos: any[] = [];
  public aspirantesNoAdmitidos: any[] = [];


  notas: boolean = false;
  periodo!: any;
  loading!: boolean;
  periodos: any = [];
  nivel_load: any = [];
  select_nivel: any;
  criterio_selected: any;
  selectCriterio!: any[];
  selectedcurricular!: number;
  requisitosActuales: any = [];
  proyectosCurriculares!: any[];
  selectcriterio: boolean = true;
  proyectosPregrado!: any[];

  tipoCupos: any = [];
  tipoCupo!: any;
  mostrarSelectorCupos= true
  tipoCupoControl = new FormControl('', [Validators.required]);

  constructor(

    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private inscripcionService: InscripcionService,
    private oikosService: OikosService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,

  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.cargarPeriodo();
    await this.loadLevel();
    await this.cargarProyectosPregrado();
    this.loading = false;
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find((p: any) => p.Activo);
            this.periodos = res.Data;
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            console.log(this.periodo)
            this.cargarTipoCuposPorPeriodo(this.periodo.Id).then((tipoCupos) => {
              setTimeout(() => {
                  this.tipoCupos = tipoCupos;

                  if (Object.keys(this.tipoCupos[0]).length === 0) {
                      this.mostrarSelectorCupos = false
                  }
              }, 0);
            }).catch((error) => {
                console.error("Error al cargar los cupos", error);
            });
          } else {
            this.loading = false;
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            console.error(error);
            reject(false);
          });
    });
  }

  loadLevel() {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?limit=0').subscribe((res: any) => {
        if (res !== null || res !== undefined) {
          this.nivel_load = res.filter((item: any) => item.Id == 1);
          resolve(true);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          reject(false);
        }
      },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          console.error(error);
          reject(false);
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

  async generarBusqueda() {
    this.loading = true;
    this.viewFacultades = false;
    this.viewCurriculares = false;
    this.viewAspirantesTables = false;
    await this.cargarFacultades();
    this.loading = false;
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get('admision/facultad/inscritos')
        .subscribe((res: any) => {
          if (res.Data) {
            const facultades = res.Data;
            this.datasourceFacultades = new MatTableDataSource<any>(facultades);
            this.datasourceFacultades.paginator = this.paginator1;
            this.viewFacultades = true;
            resolve(true)
          } else {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false)
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            this.loading = false;
            console.error(error);
            reject(false);
          });
    });
  }

  cargarProyectosCurriculares(data: any) {
    this.loading = true;
    this.viewCurriculares = false;
    this.viewAspirantesTables = false;
    const proyectoAcademicoIds = new Set(data.ProyectosAcademicos.map((item: any) => item.ProyectoAcademicoId));
    // Estos son los proyectos de la facultad
    const proyectosFiltrados = this.proyectosPregrado.filter(item => proyectoAcademicoIds.has(item.Id));
    if (proyectosFiltrados) {
      this.proyectosCurriculares = proyectosFiltrados;
      this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
      this.datasourceCurriculares.paginator = this.paginator2;
    }
    this.viewCurriculares = true;
    this.loading = false;
  }

  async consultarproyecto(Id: number) {
    this.loading = true;
    this.viewAspirantesTables = false;
    window.localStorage.setItem('IdProyecto', String(Id));
    this.selectedcurricular = Id
    await this.loadCriterios();
    this.loading = false;
  }

  recuperarrequisitosProgramaAcademico(programa: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=ProgramaAcademicoId:' + programa + ',PeriodoId:' + periodo + '&sortby=Id&order=asc&limit=0').subscribe((res: any) => {
        if (res !== null || res !== undefined && res.status == 200) {
          this.requisitosActuales = res;
          this.selectcriterio = false;
          this.criterio_selected = [];
          this.selectCriterio = [];
          this.requisitosActuales.forEach(async (element: any) => {
            if (this.requisitosActuales != "ICFES") {
              this.selectCriterio.push(element.RequisitoId);
            }
          });
          resolve(true);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          reject(false);
        }
      },
        (error: any) => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          console.error(error);
          reject(false);
        });
    });
  }

  recuperarInscripciones(programa: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion?query=Activo:true,ProgramaAcademicoId:${programa},PeriodoId:${periodo}&sortby=Id&order=asc&limit=0`).subscribe((res: any) => {
        if (res !== null || res !== undefined) {
          resolve(res);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          reject(false);
        }
      },
        (error: any) => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          console.error(error);
          reject(false);
        });
    });
  }

  async loadCriterios() {
    let admitidos: any[] = [];
    let noAdmitidos: any[] = [];
    await this.recuperarrequisitosProgramaAcademico(this.selectedcurricular, this.periodo);
    const response: any = await this.recuperarInscripciones(this.selectedcurricular, this.periodo)
    if (Object.keys(response[0]).length != 0) {
      for (const element of response) {
        if (element.EstadoInscripcionId.Id == 2 || element.EstadoInscripcionId.Id == 3) {
          admitidos.push(element);
        } else if (element.EstadoInscripcionId.Id == 4) {
          noAdmitidos.push(element);
        }
      }
      this.aspirantesAdmitidos = admitidos;
      this.aspirantesNoAdmitidos = noAdmitidos;
      this.viewAspirantesTables = true;
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_no_aspirantes'), this.translate.instant('admision.error_no_aspirantes'));
    }
  }

  cargarTipoCuposPorPeriodo(idPeriodo: any) {
    // idPeriodo = 39
    return new Promise((resolve, reject) => {
      // this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:T,PeriodoId.Id:${idPeriodo}`)
      this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:TIP_CUP,PeriodoId.Id:${idPeriodo}`)
        .subscribe((res: any) => {
          resolve(res.Data)
        },
          (error: any) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false);
          });
    });
  }

  descargarListadoOficializados(estadoFormacion: number) {
    this.sgaMidAdmisiones.get(`admision/Listadoadmitidos/${this.periodo}/${estadoFormacion}/${this.selectedcurricular}`).subscribe((res: any) => {
      if (res.status === 200 && res.success === true) {
        const base64String = res.data.Pdf;
        this.downloadPdf(base64String);

      } else {
        console.error("Error en la consulta de listado oficializados")
      }

    });
  }

  downloadPdf(resBase64String: string) {
    const base64String: string = resBase64String;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    saveAs(blob, 'ListadoAdmitidos.pdf');
  }
}
