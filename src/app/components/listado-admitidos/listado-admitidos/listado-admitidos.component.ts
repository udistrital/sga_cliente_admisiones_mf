import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
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
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach((element: any) => {
              this.periodos.push(element);
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

  // loadLevel() {
  //   this.projectService.get('nivel_formacion?limit=0').subscribe(
  //     (response: any) => {
  //       if (response !== null || response !== undefined) {
  //         this.nivel_load = <any>response;
  //       }
  //     },
  //     (error: any) => {
  //       this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //       this.loading = false;
  //     },
  //   );
  // }

  loadLevel() {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?limit=0').subscribe((res: any) => {
        if (res !== null || res !== undefined) {
          this.nivel_load = <any>res;
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
      this.oikosService.get('dependencia_tipo_dependencia?query=Activo:true,TipoDependenciaId:14&sortby=Id&order=asc&limit=0')
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

  // cargarProyectosCurriculares(id: number) {
  //   this.viewCurriculares = true;
  //   this.sgaMidAdmisiones.get(`admision/academicos/inscritos/${id}/${this.select_nivel}`).subscribe((res: any) => {
  //     if (res.status == 200) {
  //       if (res.data) {
  //         this.proyectosCurriculares = res.data;
  //         this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
  //         this.datasourceCurriculares.paginator = this.paginator2;
  //         this.viewCurriculares = true;
  //       } else {
  //         this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_no_data'));
  //       }
  //     } else {
  //       this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_error'));
  //     }
  //   })
  // }

  cargarProyectosCurriculares(data: any) {
    this.loading = true;
    this.viewCurriculares = true;
    const proyectoAcademicoIds = new Set(data.ProyectosAcademicos.map((item: any) => item.ProyectoAcademicoId));
    // Estos son los proyectos de la facultad
    const proyectosFiltrados = this.proyectosPregrado.filter(item => proyectoAcademicoIds.has(item.DependenciaId.Id));
    if (proyectosFiltrados) {
      this.proyectosCurriculares = proyectosFiltrados;
      this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
      this.datasourceCurriculares.paginator = this.paginator2;
      //this.datasourceCurriculares.sort = this.sort2;
    }
    this.loading = false;
  }

  async consultarproyecto(Id: number) {
    this.loading = true;
    window.localStorage.setItem('IdProyecto', String(Id));
    this.selectedcurricular = Id
    await this.loadCriterios();
    this.loading = false;
  }

  recuperarrequisitosProgramaAcademico(programa: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=ProgramaAcademicoId:' + programa + ',PeriodoId:' + periodo + '&sortby=Id&order=asc&limit=0').subscribe((res: any) => {
        console.log(res);
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
        console.log(res);
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
    // this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=ProgramaAcademicoId:' + this.selectedcurricular + ',PeriodoId:' + this.periodo + '&sortby=Id&order=asc&limit=0').subscribe((res: any) => {
    //     if (res !== null || res !== undefined && res.status == 200) {
    //       this.requisitosActuales = res;
    //       this.selectcriterio = false;
    //       this.criterio_selected = [];
    //       this.selectCriterio = [];
    //       this.requisitosActuales.forEach(async (element: any) => {
    //         if (this.requisitosActuales != "ICFES") {
    //           await this.selectCriterio.push(element.RequisitoId);
    //         }

    //       });
    //     }
    //   })
    console.log(this.selectedcurricular, this.periodo)
    await this.recuperarrequisitosProgramaAcademico(this.selectedcurricular, this.periodo);
    const response: any = await this.recuperarInscripciones(this.selectedcurricular, this.periodo)
    response.forEach((element: any) => {

      // Estados de inscripción admitidos u opcionados
      if (element.EstadoInscripcionId.Id == 2 || element.EstadoInscripcionId.Id == 3) {
        this.aspirantesAdmitidos.push(element);
      }

      // Estados de inscripción de no admitidos
      if (element.EstadoInscripcionId.Id == 4) {
        this.aspirantesNoAdmitidos.push(element);
      }
      this.viewAspirantesTables = true
    });

    // this.inscripcionService.get(`inscripcion?query=ProgramaAcademicoId:${this.selectedcurricular}&PeriodoId:${this.periodo}`).subscribe((response: any) => {
    //   if (response !== null || response !== undefined) {
    //     response.forEach((element: any) => {

    //       if (element.EstadoInscripcionId.Nombre == 'ADMITIDO' || element.EstadoInscripcionId.Nombre == 'OPCIONADO') {
    //         this.aspirantesAdmitidos.push(element);
    //       }

    //       if (element.EstadoInscripcionId.Nombre == 'NO ADMITIDO') {
    //         this.aspirantesNoAdmitidos.push(element);
    //       }
    //       this.viewAspirantesTables = true
    //     });
    //   }

    // });
  }
}
