import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
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
  viewVariables: boolean = true;
  viewSubcriterios: boolean = true;
  viewTablePuntaje: boolean = true;
  viewCurriculares: boolean = true;


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

  
  notas: boolean = false;
  periodo!: any;
  loading!: boolean;
  periodos: any = [];
  nivel_load: any = [];
  criterio_selected: any;
  selectCriterio!: any[];
  selectedcurricular!: number;
  requisitosActuales: any = [];
  proyectosCurriculares!: any[];
  selectcriterio: boolean = true;


  constructor(

    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,

  ) { }

  async ngOnInit() {
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
            if (this.requisitosActuales != "ICFES") {
              await this.selectCriterio.push(element.RequisitoId);
            }

          });
        }
      })
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

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
      },
      (error: any) => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
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


  consultarproyecto(Id: number) {
    window.localStorage.setItem('IdProyecto', String(Id));
    this.viewVariables = true;
    this.selectedcurricular = Id
    this.cargarPeriodo();
    this.loadLevel();
  }



}
