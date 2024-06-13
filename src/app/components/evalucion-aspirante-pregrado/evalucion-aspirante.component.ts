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





@Component({
  selector: 'udistrital-evalucion-aspirante',
  templateUrl: './evalucion-aspirante.component.html',
  styleUrls: ['./evalucion-aspirante.component.scss']
})


export class EvalucionAspirantePregradoComponent {

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


  viewSubcriterios: boolean = false;
  viewTablePuntaje: boolean = false;
  viewCurriculares: boolean = false;

  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculares !: MatTableDataSource<any>;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  datasourcePuntajeAspirantes!: MatTableDataSource<any>;
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
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,

  ) { }


  async ngOnInit() {
    await this.cargarFacultades();
  }



  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get('admision/facultad/inscritos')
        .subscribe((res: any) => {
          console.log(res)
          if (res.data) {
            this.facultades = res.data;
            this.datasourceFacultades = new MatTableDataSource<any>(this.facultades);
            this.datasourceFacultades.paginator = this.paginator1;
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_no_data'));
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }


  cargarProyectosCurriculares(id: number) {
    this.viewCurriculares = true;
    this.sgaMidAdmisiones.get(`admision/academicos/inscritos/${id}`).subscribe((res: any) => {
      if (res.status == 200) {
        console.log(res)
        if (res.data) {
          this.proyectosCurriculares = res.data;
          this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
          this.datasourceCurriculares.paginator = this.paginator2;
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_no_data'));
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_error'));
      }
    })
  }


  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          console.log(res)
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


  consultarproyecto(Id: number) {
    window.localStorage.setItem('IdProyecto', String(Id));
    this.viewVariables = true;
    this.selectedcurricular = Id
    this.cargarPeriodo();
    this.loadLevel();
  }


  loadCriterios() {
    this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=ProgramaAcademicoId:' + this.selectedcurricular +
      ',PeriodoId:' + this.periodo).subscribe((res: any) => {
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
      })
  }


  realizarBusqueda() {
    this.viewSubcriterios = true;
  }




  puntajeAspirantes() {
    this.InscripcionService.get(`inscripcion?query=ProgramaAcademicoId:${this.selectedcurricular}&PeriodoId:${this.periodo}&limit=0&Activo=true`)
      .subscribe((res: any) => {
        if (res != null && res != undefined) {
          let IdPersonas: any[] = [];
          res.forEach((element: any) => {
            IdPersonas.push({ Id: element.PersonaId });
          });
          const dataEvaluacion = {
            IdPeriodo: this.periodo,
            IdPersona: IdPersonas,
            IdPrograma: this.selectedcurricular,
          };

          this.sgaMidAdmisiones.put('admision/calcular_nota', dataEvaluacion).subscribe(
            (response: any) => {
              if (response.status === 200) {
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.calculo_exito'));
                this.requisitosActuales.forEach((element: any) => {
                  this.columnspuntajeaspirantes.push(element.RequisitoId.Nombre);
                  this.sgaMidAdmisiones.get("admision/evaluacionpregrado/40/5").subscribe((res: any) => {
                    if (res.status == 200 && res.success == true) {
                      // Ordenar los datos por el puntaje total en orden descendente
                      res.data.sort((a: any, b: any) => b.Total - a.Total);
                      this.datasourcePuntajeAspirantes = new MatTableDataSource(res.data);
                      this.datasourcePuntajeAspirantes.paginator = this.paginator3;
                    } else {
                      this.popUpManager.showErrorAlert(this.translate.instant('admision.inscritos_no_data'));
                    }
                  });
                });
                this.columnspuntajeaspirantes.push("Total");
              } else {
                this.popUpManager.showErrorToast(this.translate.instant('admision.calculo_error'));
              }
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
            },
          );
          this.viewTablePuntaje = true;
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('admision.inscritos_no_data'));
        }
      });
  }

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
}

