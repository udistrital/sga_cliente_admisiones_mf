import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { ParametrosService } from '../../services/parametros.service';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';


@Component({
  selector: 'udistrital-evalucion-aspirante',
  templateUrl: './evalucion-aspirante.component.html',
  styleUrls: ['./evalucion-aspirante.component.scss']
})
export class EvalucionAspirantePregradoComponent {

  periodo!: any;
  criterio!: any;
  criterios: any = [];
  subCriterios: any = [];
  popUpManager: any;
  loading!: boolean;
  periodos: any = [];
  nivel_load: any = [];
  criterio_load: any = [];
  selectednivel: undefined;
  selectCriterio: undefined;
  proyectos_selected: undefined;
  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculaes !: MatTableDataSource<any>;
  CampoControl = new FormControl('', [Validators.required]);
  columnsFacultades = ['#', 'facultad', 'estado', '%', 'accion'];
  columnsCurriculares = ['#', 'curricular', 'estado', 'color', 'accion'];


  constructor(private parametrosService :ParametrosService, private projectService:  ProyectoAcademicoService,    private translate: TranslateService, private sgaMidAdmisiones: SgaAdmisionesMid) {}

  ngOnInit() {
    this.cargarPeriodo()
    this.loadLevel();
    this.loadCriterioSubCriterio();
    this.datasourceFacultades = new MatTableDataSource<any>([]);
    this.datasourceCurriculaes = new MatTableDataSource<any>([]);
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
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
        console.log(response)
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

  loadCriterioSubCriterio() {
    this.criterios = [];
    this.subCriterios = []
    this.sgaMidAdmisiones.get('admision/criterio').subscribe(
      (response: any) => {
        console.log("Criterios")
        console.log(response)
        if (response.status === 200 && response.success === true) {
          this.criterios = response.data;
        }

      })

  }




  loadExamen() {}
}
