import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { OikosService } from 'src/app/services/oikos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';


@Component({
  selector: 'app-liquidacion-historico',
  templateUrl: './liquidacion-historico.component.html',
  styleUrls: ['./liquidacion-historico.component.scss']
})
export class LiquidacionHistoricoComponent {
  datosTabla: any;

  nivelControl = new FormControl('', [Validators.required]);
  proyectoControl = new FormControl('', [Validators.required]);
  facultadControl = new FormControl('', [Validators.required]);
  periodoControl = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);

  facultades!: any[]
  proyectosCurriculares!: any[]
  periodos!: any[]
  loading: boolean = false;
  inscripciones: any = [];

  niveles: NivelFormacion[] = [];
  selectedLevel: any;
  tablaHistorico! : boolean;
  initialized = false;

  selectedProyecto! : any;
  selectedPeriodo! : any;

  constructor(
    private _formBuilder: FormBuilder, 
    private oikosService: OikosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
    private inscripcionMidService: InscripcionMidService,
    private projectService: ProyectoAcademicoService,
  )
  {}

  async ngOnInit() {
    await this.cargarSelects();
  }

  async cargarSelects() {
    this.loading = true;
    await this.cargarFacultades();
    await this.cargarPeriodos();
    await this.nivel_load();
    this.loading = false;
  }

  async nivel_load() {
      this.projectService.get('nivel_formacion?query=Activo:true').subscribe(
        (response: any) => {
          for (let i = 0; i < response.length; i++) {
            if (response[i].Id === 1 || response[i].Id === 2) {
              this.niveles.push(response[i]);
            }
          }
        },
        error => {
          console.error(error);
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    this.proyectosCurriculares = facultad.Opciones;
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.periodo_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  async realizarBusqueda() {
    this.loading = true;
    this.initialized = true;
    const proyecto = this.proyectoControl.value;
    const periodo = this.periodoControl.value;

    if (this.selectedLevel === 1) {
      this.tablaHistorico = true;
      this.inscripciones = await this.buscarInscripciones(proyecto, periodo);

      this.datosTabla = {
        "inscripciones": this.inscripciones,
        "visible": true
      }
      this.loading = false;


    } else {
      this.tablaHistorico = false;
      this.datosTabla = {
        "proyecto": this.proyectosCurriculares,
        "periodo": this.selectedPeriodo,
        "visible": true
      }
      this.loading = false;
    }

    
  }

  async buscarInscripciones(proyecto: any, periodo: any) {
    const inscripcionesLegalizadas: any = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo);
    const inscripcionesMatriculadas: any = await this.buscarInscripcionesMatriculados(proyecto, periodo);
    const inscripcionesNoLegalizadas: any = await this.buscarInscripcionesNoLegalizados(proyecto, periodo);

    const legalizados = Object.keys(inscripcionesLegalizadas[0]).length === 0 
      ? Object.keys(inscripcionesMatriculadas[0]).length === 0 ? [] : inscripcionesMatriculadas
      : Object.keys(inscripcionesMatriculadas[0]).length === 0 ? inscripcionesLegalizadas : inscripcionesLegalizadas.concat(inscripcionesMatriculadas)

    const inscripciones = legalizados.length === 0
      ? Object.keys(inscripcionesNoLegalizadas[0]).length === 0 ? [] : inscripcionesNoLegalizadas
      : Object.keys(inscripcionesNoLegalizadas[0]).length === 0 ? legalizados : legalizados.concat(inscripcionesNoLegalizadas)

    return inscripciones;
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.error(error);
            this.loading = false;
            reject([]);
          });
    });
  }

  buscarInscripcionesMatriculados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:11&sortby=Id&order=asc&limit=0')
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

  buscarInscripcionesNoLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:12&sortby=Id&order=asc&limit=0')
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
}
