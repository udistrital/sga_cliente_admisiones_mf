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
import { SgaMidService } from 'src/app/services/sga_mid.service';





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
  columnspuntajeaspirantes: string[] = [ 'Credencial', 'Nombre'];

  constructor(
    private router: Router,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private InscripcionService: InscripcionService,
    private oikosService: OikosService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,
    private sgamidService: SgaMidService,
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
          if (res.Data) {
            console.log(res.Data)
            this.facultades = res.Data;
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
      this.oikosService.get('dependencia_tipo_dependencia?query=Activo:true,TipoDependenciaId:14&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          console.log(res);
          this.proyectosPregrado = res;
          //this.loading = false;
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
    this.viewCurriculares = true;
    console.log(data.ProyectosAcademicos, this.proyectosPregrado)
    const proyectoAcademicoIds = new Set(data.ProyectosAcademicos.map((item: any) => item.ProyectoAcademicoId));
    console.log(proyectoAcademicoIds)
    // Estos son los proyectos de la facultad
    const proyectosFiltrados = this.proyectosPregrado.filter(item => proyectoAcademicoIds.has(item.DependenciaId.Id));
    console.log(proyectosFiltrados)
    if (proyectosFiltrados) {
      this.proyectosCurriculares = proyectosFiltrados;
      console.log(this.proyectosCurriculares)
      this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
      this.datasourceCurriculares.paginator = this.paginator2;
      this.datasourceCurriculares.sort = this.sort2;
    }
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

          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  async consultarproyecto(Id: number) {
    this.loading = true;
    window.localStorage.setItem('IdProyecto', String(Id));
    this.viewVariables = true;
    this.selectedcurricular = Id
    await this.cargarPeriodo();
    await this.loadLevel();
    this.loading = false;
  }

  loadCriterios() {
    this.loading = true;
    this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=Activo:true,ProgramaAcademicoId:' + this.selectedcurricular + ',PeriodoId:' + this.periodo + '&sortby=Id&order=asc&limit=0')
    .subscribe((res: any) => {
      console.log(res);
      if (res !== null || res !== undefined && res.status == 200) {
        this.requisitosActuales = res;

        this.selectcriterio = false;
        this.criterio_selected = [];
        this.selectCriterio = [];
        this.requisitosActuales.forEach(async (element: any) => {
          if(this.requisitosActuales != "ICFES"){
            await this.selectCriterio.push(element.RequisitoId);
          }
           
        });
      }
      this.loading = false;
    })
  }

  async realizarBusqueda() {
    this.loading = true;
    console.log(this.columnspuntajeaspirantes)
    let inscritosData: any[] = [];
    const inscripciones: any = await this.recuperarInscripciones(this.selectedcurricular, this.periodo)
    console.log(inscripciones);
    for (const inscripcion of inscripciones) {
      const persona: any = await this.consultarTercero(inscripcion.PersonaId);
      if (Array.isArray(persona) && persona.length === 0) {
        continue;
      }
      console.log(persona);

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
    console.log(this.columnspuntajeaspirantes);
    console.log(data);
    for (const item of data) {
      console.log(item);
      for (const requisito of this.requisitosActuales) {
        console.log(requisito.RequisitoId.Nombre);
        item[requisito.RequisitoId.Nombre] = "";
      }
    }
    console.log(data);
    return data;
  }

  recuperarInscripciones(programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.InscripcionService.get(`inscripcion?query=Activo:true,ProgramaAcademicoId:${programaId},PeriodoId:${periodoId}&sortby=Id&order=asc&limit=0`)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async consultarTercero(personaId: any): Promise<any | []> {
    try {
      const response = await this.sgamidService.get('persona/consultar_persona/' + personaId).toPromise();
      return response;
    } catch (error) {
      this.loading = false;
      console.error(error);
      return [];
    }
  }

  // puntajeAspirantes() {
  //   this.InscripcionService.get(`inscripcion?query=Activo:true,ProgramaAcademicoId:${this.selectedcurricular},PeriodoId:${this.periodo}&sortby=Id&order=asc&limit=0`)
  //     .subscribe((res: any) => {
  //       this.viewTablePuntaje = true;
  //       console.log(res);
  //       if (res != null && res != undefined) {
  //         let IdPersonas: any[] = [];
  //         res.forEach((element: any) => {
  //           IdPersonas.push({ Id: element.PersonaId });
  //         });
  //         const dataEvaluacion = {
  //           IdPeriodo: this.periodo,
  //           IdPersona: IdPersonas,
  //           IdPrograma: this.selectedcurricular,
  //         };
  //         console.log(dataEvaluacion)

  //         this.sgaMidAdmisiones.put('admision/calcular_nota', dataEvaluacion).subscribe(
  //           (response: any) => {
  //             console.log(response);
  //             if (response.Status === 200) {
  //               this.popUpManager.showSuccessAlert(this.translate.instant('admision.calculo_exito'));
  //               this.requisitosActuales.forEach((element: any) => {
  //                 this.columnspuntajeaspirantes.push(element.RequisitoId.Nombre);
  //                 this.sgaMidAdmisiones.get(`admision/evaluacionpregrado/${this.periodo}/${this.selectedcurricular}`).subscribe((res: any) => {
  //                   console.log(res);
  //                   if (res.Status == 200 && res.Success == true) {
  //                     // Ordenar los datos por el puntaje total en orden descendente
  //                     res.Data.sort((a: any, b: any) => b.Total - a.Total);
  //                     this.datasourcePuntajeAspirantes = new MatTableDataSource(res.Data);
  //                     this.datasourcePuntajeAspirantes.paginator = this.paginator3;
  //                     this.datasourcePuntajeAspirantes.sort = this.sort3;
  //                   } else {
  //                     this.popUpManager.showErrorAlert(this.translate.instant('admision.inscritos_no_data'));
  //                   }
  //                 });
  //               });
  //               this.columnspuntajeaspirantes.push("Total");
  //             } else {
  //               this.popUpManager.showErrorToast(this.translate.instant('admision.calculo_error'));
  //             }
  //           },
  //           error => {
  //             this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
  //           },
  //         );
  //       } else {
  //         this.popUpManager.showErrorAlert(this.translate.instant('admision.inscritos_no_data'));
  //       }
  //     });
  // }

  ModuleEvaluarDoucimentos() {
    window.localStorage.setItem('IdPeriodoSelected', this.periodo);
    window.localStorage.setItem('Nivel', "1");
    this.router.navigate(['evaluacion-documentos-inscritos']);
  }

  ModuloevaluarAspirante() {
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
  
}

