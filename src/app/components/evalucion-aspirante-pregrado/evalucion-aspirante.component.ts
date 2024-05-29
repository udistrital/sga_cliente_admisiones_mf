import { Router } from '@angular/router';
import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ParametrosService } from '../../services/parametros.service';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';




@Component({
  selector: 'udistrital-evalucion-aspirante',
  templateUrl: './evalucion-aspirante.component.html',
  styleUrls: ['./evalucion-aspirante.component.scss']
})


export class EvalucionAspirantePregradoComponent {
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  viewCurriculares: boolean = false;
  viewVariables: boolean = false;
  viewSubcriterios: boolean = false;
  viewTablePuntaje: boolean = false;
  selectcriterio: boolean = true;
  notas:boolean = false;
  btnCalculo: boolean = true;
  periodo!: any;
  popUpManager: any;
  loading!: boolean;
  periodos: any = [];
  nivel_load: any = [];
  requisitosActuales: any = [];
  facultades!: any[]
  proyectosCurriculares!: any[]
  selectedcurricular!: number
  selectednivel: undefined;
  selectCriterio!: any[] ;
  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculares !: MatTableDataSource<any>;
  datasourcePuntajeAspirantes!: MatTableDataSource<any>;
  periodoControl = new FormControl('', [Validators.required]);
  nivelControl = new FormControl('', [Validators.required]);
  criterioControl = new FormControl('', [Validators.required]);
  columnsFacultades = [ 'facultad', 'estado', '%', 'accion'];
  columnsCurriculares = [ 'curricular', 'estado',  'accion'];
  columnspuntajeaspirantes: string[] = ['#', 'credencia', 'Nombres', 'Apellidos', 'puntajeExamendeestado'];
  data = [
    { '#': 1, 'credencia': 'C1', 'Nombres': 'Juan', 'Apellidos': 'Perez', 'puntajeExamendeestado': 80, 'criterio1': 'Criterio 1', 'criterio2': 'Criterio 2', 'total': 100 },
  ];
  criterio_selected: any;
  criterios: any;





  constructor(
    private router: Router,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
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
      if(res.status == 200){
        console.log(res)
        if (res.data) {
          this.proyectosCurriculares = res.data;
          this.datasourceCurriculares = new MatTableDataSource<any>(this.proyectosCurriculares);
          this.datasourceCurriculares.paginator = this.paginator2;
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_no_data'));
        }
      }else{
        this.popUpManager.showErrorAlert(this.translate.instant('admision.proyectos_error'));
      }
    })
  }



  consultarproyecto(Id: number) {
    this.viewVariables = true;
    this.selectedcurricular = Id
    this.cargarPeriodo();
    this.loadLevel();
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

loadCriterios() {
    this.EvalaucionInscripcionServices.get('requisito_programa_academico?query=ProgramaAcademicoId:' + this.selectedcurricular +
      ',PeriodoId:' + this.periodo).subscribe((res: any) => {
        if (res !== null || res !== undefined && res.status == 200) {
          this.requisitosActuales = res;
          this.requisitosActuales = this.requisitosActuales.filter((e: any) => e.PorcentajeGeneral !== 0);
          this.selectcriterio = false;
          this.criterio_selected = [];
          this.selectCriterio = []; 
          this.requisitosActuales.forEach(async (element: any) => {
            console.log(element)
            await this.selectCriterio.push(element.RequisitoId);
          });
        }
      })
  }
  realizarBusqueda() {
    this.viewSubcriterios = true;
  }

  navigateToRoute() {
    this.router.navigate(['evaluacion-documentos-inscritos']);
  }

  puntajeAspirantes() {
    this.viewTablePuntaje = true;

    this.requisitosActuales.forEach((element: any) => {
      this.columnspuntajeaspirantes.push(element.RequisitoId.Nombre)
    });
    this.columnspuntajeaspirantes.push("Total")

    let mapData = this.data.map((row: any) => {
      let mappedRow: any = {};
      this.columnspuntajeaspirantes.forEach((column: any) => {
        mappedRow[column] = row[column];
      });
      return mappedRow;
    });
    this.datasourcePuntajeAspirantes = new MatTableDataSource(mapData);
  }
}

