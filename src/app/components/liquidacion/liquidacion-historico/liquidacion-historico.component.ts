import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { OikosService } from 'src/app/services/oikos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';

@Component({
  selector: 'app-liquidacion-historico',
  templateUrl: './liquidacion-historico.component.html',
  styleUrls: ['./liquidacion-historico.component.scss']
})
export class LiquidacionHistoricoComponent {
  datosTabla: any;
  tablahistorico:boolean=true

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

  constructor(
    private _formBuilder: FormBuilder, 
    private oikosService: OikosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
    private inscripcionMidService: InscripcionMidService,
  )
  {}

  async ngOnInit() {
    await this.cargarSelects();
  }

  async cargarSelects() {
    this.loading = true;
    await this.cargarFacultades();
    await this.cargarPeriodos();
    this.loading = false;
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
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
            this.popUpManager.showErrorAlert(this.translate.instant('admision.periodo_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async realizarBusqueda() {
    this.loading = true;
    const proyecto = this.proyectoControl.value;
    const periodo = this.periodoControl.value;

    this.inscripciones = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo)

    this.datosTabla = {
      "inscripciones": this.inscripciones,
      "visible": true
    }
    this.loading = false;
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }
}
