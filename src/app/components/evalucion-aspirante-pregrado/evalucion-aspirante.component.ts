import { Router } from '@angular/router';
import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from '../../services/parametros.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';
import { MatSort } from '@angular/material/sort';
import { TercerosService } from 'src/app/services/terceros.service';





@Component({
  selector: 'udistrital-evalucion-aspirante',
  templateUrl: './evalucion-aspirante.component.html',
  styleUrls: ['./evalucion-aspirante.component.scss']
})


export class EvalucionAspirantePregradoComponent {
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild(MatSort) sort2!: MatSort;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  @ViewChild(MatSort) sort3!: MatSort;

  criterios: any;
  notas: boolean = false;
  periodo!: any;
  loading!: boolean;
  facultades!: any[];
  periodos: any = [];
  nivel_load: any = [];
  criterio_selected: any;
  selectCriterio!: any[];
  selectednivel: undefined;
  btnCalculo: boolean = true;
  selectedcurricular!: number;
  requisitosActuales: any = [];
  proyectosCurriculares!: any[];
  viewVariables: boolean = false;
  viewVariablesPuntajeMinimo: boolean = false;
  selectcriterio: boolean = true;
  proyectosPregrado!: any[];

  viewSubcriterios: boolean = false;
  viewTablePuntaje: boolean = false;
  viewCurriculares: boolean = false;

  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculares !: MatTableDataSource<any>;
  datasourcePuntajeAspirantes!: MatTableDataSource<any[]>;

  nivelControl = new FormControl('', [Validators.required]);
  periodoControl = new FormControl('', [Validators.required]);
  criterioControl = new FormControl('', [Validators.required]);

  columnsCurriculares = ['curricular', 'estado', 'accion'];
  columnsFacultades = ['facultad', 'estado', '%', 'accion'];
  columnspuntajeaspirantes: string[] = ['Credencial', 'Nombre'];

  constructor(
    private router: Router,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private InscripcionService: InscripcionService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,
    private tercerosService: TercerosService
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.cargarProyectosPregrado();
    await this.cargarFacultades();
    this.loading = false;
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get('admision/facultad/inscritos')
        .subscribe((res: any) => {
          if (res.data) {
            this.facultades = res.data;
            this.datasourceFacultades = new MatTableDataSource<any>(this.facultades);
            this.datasourceFacultades.paginator = this.paginator1;
            this.datasourceFacultades.sort = this.sort1;
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_no_data'));
            this.loading = false;
          }
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            this.loading = false;
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

  cargarProyectosCurriculares(data: any) {
    this.loading = true;
    this.viewCurriculares = false;
    this.viewVariables = false;
    this.viewSubcriterios = false;
    const proyectoAcademicoIds = new Set(data.ProyectosAcademicos.map((item: any) => item.ProyectoAcademicoId));
    // Estos son los proyectos de la facultad
    const proyectosFiltrados = this.proyectosPregrado.filter(item => proyectoAcademicoIds.has(item.Id));
    if (proyectosFiltrados) {
      this.proyectosCurriculares = proyectosFiltrados;
      this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
      this.datasourceCurriculares.paginator = this.paginator2;
      this.datasourceCurriculares.sort = this.sort2;
    }
    this.viewCurriculares = true;
    this.loading = false;
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
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

          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadLevel() {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?limit=0')
        .subscribe((response: any) => {
          if (response !== null || response !== undefined) {
            this.nivel_load = <any>response;
            resolve(response);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  async filtrarAspirantesPuntajeMinimo(id: number) {
    this.loading = true;
    this.selectedcurricular = id;
    await this.cargarPeriodo();
    this.viewVariablesPuntajeMinimo = true;
    this.loading = false;
  }

  async realizarBusquedaPuntajeMinimo() {
    const body = {
      proyecto: this.selectedcurricular + "",
      periodo: this.periodo + ""
    }
    await this.actualizarAspirantes(body)
  }

  actualizarAspirantes(body: any) {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.put(`admision/puntaje-minimo`, body)
        .subscribe((res: any) => {
          this.viewVariablesPuntajeMinimo = false;
          this.popUpManager.showAlert(this.translate.instant('admision.actualizacion_aspirantes_puntaje_minimo'), this.translate.instant('admision.exito_actualizar_aspirantes'))
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.error_actualizar_aspirantes'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  async consultarproyecto(Id: number) {
    this.loading = true;
    this.viewVariables = false;
    this.viewSubcriterios = false;
    window.sessionStorage.setItem('IdProyecto', String(Id));
    window.localStorage.setItem('IdProyecto', String(Id));
    this.viewVariables = true;
    this.selectedcurricular = Id
    await this.cargarPeriodo();
    await this.loadLevel();
    this.loading = false;
  }

  async loadCriterios() {
    this.loading = true;
    const requisito: any = await this.recuperarRequisitoProgramaAcademico(this.selectedcurricular, this.periodo);
    this.requisitosActuales = requisito;

    this.selectcriterio = false;
    this.criterio_selected = [];
    this.selectCriterio = [];

    for (const element of this.requisitosActuales) {
      if (this.requisitosActuales != "ICFES") {
        this.selectCriterio.push(element.RequisitoId);
      }
    }
    this.loading = false;
  }

  recuperarRequisitoProgramaAcademico(programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=Activo:true,ProgramaAcademicoId:' + programaId + ',PeriodoId:' + periodoId + '&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          if (res !== null || res !== undefined && res.status == 200) {
            resolve(res);
          } else {
            this.loading = false;
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  async realizarBusqueda() {
    this.loading = true;
    this.viewSubcriterios = false;
    let inscritosData: any[] = [];
    const inscripciones: any = await this.recuperarInscripciones(this.selectedcurricular, this.periodo)
    for (const inscripcion of inscripciones) {
      const persona: any = await this.consultarTercero(inscripcion.PersonaId);
      if (Array.isArray(persona) && persona.length === 0) {
        continue;
      }

      const dataInscrito: any = {
        "Credencial": 123,
        "Nombre": persona.NombreCompleto
      }
      inscritosData.push(dataInscrito);
    }
    inscritosData = this.agregarColumnasCriterios(inscritosData)
    this.datasourcePuntajeAspirantes = new MatTableDataSource(inscritosData);
    this.datasourcePuntajeAspirantes.paginator = this.paginator3;
    this.datasourcePuntajeAspirantes.sort = this.sort3;
    this.viewSubcriterios = true;
    this.loading = false;
  }

  agregarColumnasCriterios(data: any) {
    this.requisitosActuales.forEach((element: any) => {
      this.columnspuntajeaspirantes.push(element.RequisitoId.Nombre);
    });
    for (const item of data) {
      for (const requisito of this.requisitosActuales) {
        item[requisito.RequisitoId.Nombre] = "";
      }
    }
    return data;
  }

  //TODO: AÑADIR ESTADO DE INSCRIPCIÓN A ESTA PETICIÓN PARA QUE SE MUESTREN LOS INSCRITOS
  recuperarInscripciones(programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.InscripcionService.get(`inscripcion?query=Activo:true,ProgramaAcademicoId:${programaId},PeriodoId:${periodoId}&sortby=Id&order=asc&limit=0`)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  async consultarTercero(personaId: any): Promise<any | []> {
    try {
      const response = await this.tercerosService.get('personas/' + personaId).toPromise();
      return response;
    } catch (error) {
      this.loading = false;
      console.error(error);
      return [];
    }
  }

  ModuleEvaluarDoucimentos() {
    window.localStorage.setItem('IdPeriodoSelected', this.periodo);
    window.localStorage.setItem('Nivel', "1");
    this.router.navigate(['evaluacion-documentos-inscritos']);
  }

  ModuloevaluarAspirante(data: any) {
    const criterio: any = this.requisitosActuales.find((item: any) => item.RequisitoId.Nombre === data)
    //console.log(data, this.requisitosActuales, criterio);
    window.sessionStorage.setItem('tipo_criterio', criterio.RequisitoId.Id.toString());
    window.localStorage.setItem('IdPeriodoSelected', this.periodo);
    window.localStorage.setItem('Nivel', "1");
    this.router.navigate(['evaluacion-aspirantes']);

  }

  applyFilterFacultades(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasourceFacultades.filter = filterValue.trim().toLowerCase();

    if (this.datasourceFacultades.paginator) {
      this.datasourceFacultades.paginator.firstPage();
    }
  }

  applyFilterCurriculares(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasourceCurriculares.filter = filterValue.trim().toLowerCase();

    if (this.datasourceCurriculares.paginator) {
      this.datasourceCurriculares.paginator.firstPage();
    }
  }

  applyFilterPuntaje(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasourcePuntajeAspirantes.filter = filterValue.trim().toLowerCase();

    if (this.datasourcePuntajeAspirantes.paginator) {
      this.datasourcePuntajeAspirantes.paginator.firstPage();
    }
  }

  descargarExcel() {
    this.sgaMidAdmisiones.get('reporte/inscripcion-evaluacion/id_periodo/id_proyecto?id_periodo=' + this.periodo + '&id_proyedcto=' + localStorage.getItem('IdProyecto'))
      .subscribe((response: any) => {
        if (response.data) {
          this.loading = true;
          const base64Excel = response.data.Excel;
          const binaryString = atob(base64Excel);

          // Paso 2: Crear un array de bytes
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Paso 3: Crear un Blob a partir de los datos decodificados
          const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          // Paso 4: Crear un enlace de descarga
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'ListadoEvaluacion.xlsx';
          // Paso 5: Hacer clic en el enlace de descarga programáticamente
          link.click();
          this.loading = false;
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('evaluacionPregrado.error_descarga'));
          this.loading = false;
        }
      }),
      (error: any) => {
        this.popUpManager.showErrorAlert(this.translate.instant('evaluacionPregrado.error_descarga'));
        console.error(error);
        this.loading = false;
      };
  }

}

