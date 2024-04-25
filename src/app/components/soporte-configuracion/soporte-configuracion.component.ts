import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TAGS_INSCRIPCION_PROGRAMA } from '../evalucion-documentos-inscritos/def_suite_inscrip_programa/def_tags_por_programa';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaCalendarioMidServiceService } from 'src/app/services/sga-calendario-mid.service.service';
import { SgaDerechoPecuniarioMidService } from 'src/app/services/sga-derecho-pecuniario-mid.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'app-soporte-configuracion',
  templateUrl: './soporte-configuracion.component.html',
  styleUrls: ['./soporte-configuracion.component.scss']
})
export class SoporteConfiguracionComponent {
  periodo!: any
  nivel!: number
  proyectos: any;
  criterios: any;
  fecha!: string;
  nivel_load: any;
  subCriterios!: any;
  loading!: boolean;
  periodos: any = [];
  selectednivel: any;
  FechaGlobal!: number;
  nombrePeriodo!: string;
  criterio_selected!: any;
  proyectos_selected!: any;
  tagsObject: any = undefined;
  Calendario_academico: string = "";

  SubCriterio!: MatTableDataSource<any>
  dataSource = new MatTableDataSource<any>
  proyectoCurricular!: MatTableDataSource<any>
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  columns = ["orden", "convocatoria", "generacion", "usuario", "+"]
  displayedColumnsProyectoCurricular = ["nombre", "nivel", "facultad", "modalidad", "calendario"]
  displayedColumnsSubCriterios = ["nombre", "descripcion", "activo"]

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private sgaCalendarioMidService: SgaCalendarioMidServiceService,
    private sgaDerechoPecunarioMidService: SgaDerechoPecuniarioMidService
  ) { }

  ngOnInit() {
    this.tagsObject = { ...TAGS_INSCRIPCION_PROGRAMA };
    this.cargarPeriodo()
    this.loadLevel()
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  loadResumen() {
    this.loadCalendario()
    // this.loadDerechoPecuniarios()
    this.loadProyectosCurriculares()
    this.loadCriterioSubCriterio()
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
            console.log(this.periodo)
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

  loadCalendario() {
    this.parametrosService.get('periodo/' + this.periodo["Id"]).subscribe((response: any) => {
      if (response.Success === true && response.Status === '200') {
        console.log("calendario")
        console.log(response)
        this.nombrePeriodo = response.Data.Descripcion
        this.FechaGlobal = response.Data.Year
        this.loadProcessActivity()
      }
    })
  }

  loadProcessActivity() {
    this.sgaCalendarioMidService.get('calendario-academico/v2/' + 68).subscribe(
      (response: any) => {
        console.log("Procesos y actividades")
        console.log(response)
      })
  }


  // loadDerechoPecuniarios() {
  //   this.sgaDerechoPecunarioMidService
  //     .get('derechos-pecuniarios/vigencia/' + 39)
  //     .subscribe(
  //       (response) => {
  //         console.log(response)
  //       })

  // }

  loadProyectosCurriculares() {
    let proyecto: any = []
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          console.log("ProyectoCurriculares")
          console.log(response)
          if (response.length > 0) {
            response.forEach((item: any) => {
              if (item.NivelFormacionId.Nombre === this.selectednivel) {
                proyecto.push(item)
              }
            })
            this.proyectoCurricular = new MatTableDataSource(proyecto)
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        },
      );
    }
  }

  loadCriterioSubCriterio() {
    this.criterios = [];
    this.subCriterios = []
    this.sgaMidAdmisiones.get('admision/criterio').subscribe(
      (response: any) => {
        console.log("Criterios y subcriterios")
        console.log(response)
        if (response.status === 200 && response.success === true) {
          this.criterios = response.data;
        }

      })
  }











}
