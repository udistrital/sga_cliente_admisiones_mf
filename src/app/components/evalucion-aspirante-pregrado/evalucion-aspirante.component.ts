import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { ParametrosService } from '../../services/parametros.service';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';


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
  requisitos!: any[];
  requisitosPrograma: any = [];
  requisitosActuales: any = [];
  facultades!: any[]
  proyectosCurriculares!: any[]

  selectednivel: undefined;
  selectCriterio: undefined;
  proyectos_selected: undefined;
  datasourceFacultades !: MatTableDataSource<any>;
  datasourceCurriculaes !: MatTableDataSource<any>;

  periodoControl = new FormControl('', [Validators.required]);
  nivelControl = new FormControl('', [Validators.required]);
  criterioControl = new FormControl('', [Validators.required]);

  columnsFacultades = ['#', 'facultad', 'estado', '%', 'accion'];
  columnsCurriculares = ['#', 'curricular', 'estado', 'color', 'accion'];


  constructor(
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private oikosService: OikosService,
  ) { }

  async ngOnInit() {
    await this.cargarFacultades();
    await this.cargarProyectosCurriculares();

    this.datasourceCurriculaes = new MatTableDataSource<any>([]);
    // await this.cargarPeriodo()
    // this.loadLevel();
    // this.cargarRequisitos();
    //this.loadCriterioSubCriterio();
    //this.datasourceFacultades = new MatTableDataSource<any>([]);
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          console.log(res)
          this.datasourceFacultades = new MatTableDataSource<any>(res);

          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarProyectosCurriculares() {
    return new Promise((resolve, reject) => {
       this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          console.log(res)
          this.datasourceFacultades = new MatTableDataSource<any>(res);

          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }



  // selectPeriodo() {
  //   this.selectednivel = undefined;
  //   this.proyectos_selected = undefined;
  // }

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

  // loadCriterioSubCriterio() {
  //   this.criterios = [];
  //   this.subCriterios = []
  //   this.sgaMidAdmisiones.get('admision/criterio').subscribe(
  //     (response: any) => {
  //       console.log("Criterios")
  //       console.log(response)
  //       if (response.status === 200 && response.success === true) {
  //         this.criterios = response.data;
  //       }

  //     })

  // }

  async onPeriodoChange(event: any) {
    let requisitos: any[] = []
    this.requisitosPrograma = await this.retornarRequisitosPrograma(event.value);
    for (const requisitoP of this.requisitosPrograma) {
      console.log(requisitoP)
      const requ = this.requisitos.find((item: any) => requisitoP.RequisitoId.Id == item.Id)
      if (requ) {
        requisitos.push(requ)
      }
    }
    console.log(requisitos)
    this.requisitosActuales = requisitos;

    // const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    // this.proyectosCurriculares = facultad.Opciones;
  }

  retornarRequisitosPrograma(id: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.get('requisito_programa_academico?query=Activo:true,PeriodoId:' + id + '&limit=0')
        .subscribe((res: any) => {
          console.log(res);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarRequisitos() {
    return new Promise((resolve, reject) => {
      this.evaluacionInscripcionService.get('requisito?Activo:true&limit=0')
        .subscribe((res: any) => {
          console.log(res);
          this.requisitos = res
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  realizarBusqueda() {
    const periodo = this.periodoControl.value;
    const nivel = this.nivelControl.value;
    console.log(periodo, nivel)
  }


  loadExamen() { }
}
