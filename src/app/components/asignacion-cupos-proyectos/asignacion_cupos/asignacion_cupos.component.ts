import { Component, OnInit, OnChanges } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { FormControl, Validators } from '@angular/forms';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';
import { UserService } from 'src/app/services/users.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TipoInscripcion } from 'src/app/models/inscripcion/tipo_inscripcion';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { firstValueFrom } from 'rxjs';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-asignacion-cupos',
  templateUrl: './asignacion_cupos.component.html',
  styleUrls: ['./asignacion_cupos.component.scss'],
})
export class AsignacionCuposComponent implements OnInit, OnChanges {

  periodo: any;
  selectednivel: any;
  show_cupos = false;
  periodos: any[] = [];
  proyectos: any[] = [];
  inscripcion!: Inscripcion;
  niveles!: NivelFormacion[];
  esPosgrado: boolean = false;
  nivelSelect!: NivelFormacion[];
  selectprograma: boolean = true;
  tipoinscripcion!: TipoInscripcion[];
  tipins_selected!:any;
  proyectos_selected!: any[] | undefined;
 tipo_inscirpcion: any;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);


  constructor(
    private userService: UserService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private projectService: ProyectoAcademicoService,
    private autenticationService: ImplicitAutenticationService,
  ) {

    this.cargarPeriodo();
    this.nivel_load();

  }

  selectPeriodo() {
    if(this.show_cupos){
      this.show_cupos = false;
    }
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
    this.tipins_selected = undefined;
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
            periodos.forEach(element => {

              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      // (response: NivelFormacion[]) => {
      (response: any) => {
        this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null)//&& nivel.Nombre === 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  inscripcion_load() {
    if (this.show_cupos) { this.show_cupos = false; }
    this.inscripcionService.get('tipo_inscripcion?query=Activo:true&limit=0').subscribe(
      (response: any) => {
        this.tipoinscripcion = response.filter((tipoInscripcion: any) => tipoInscripcion.Nombre != null)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  filtrarProyecto(proyecto: any) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }


  loadProyectos() {
    if (this.show_cupos) { this.show_cupos = false; }
    this.proyectos_selected = undefined;
    this.tipins_selected = undefined;
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.autenticationService.getRole().then(
            // (rol: Array <String>) => {
            (rol: any) => {
              let r = rol.find((role: any) => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
              if (r) {
                this.proyectos = <any[]>response.filter(
                  (proyecto: any) => this.filtrarProyecto(proyecto),
                );

              } else {
                const id_tercero = this.userService.getPersonaId();
                this.sgaAdmisiones.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
                  (respDependencia: any) => {
                    const dependencias = <Number[]>respDependencia.Data.DependenciaId;
                    this.proyectos = <any[]>response.filter(
                      (proyecto: any) => dependencias.includes(proyecto.Id)
                    );
                    if (dependencias.length > 1) {
                      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('admision.multiple_vinculacion'));//+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                      //this.proyectos.forEach(p => { p.Id = undefined })
                    }
                  },
                  (error: any) => {
                    this.popUpManager.showErrorAlert(this.translate.instant('admision.no_vinculacion_no_rol') + ". " + this.translate.instant('GLOBAL.comunicar_OAS_error'));
                  }
                );
              }
            }
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }



  async perfil_editar(event: any) {
    this.show_cupos = false;
    switch (event) {
      case 'info_cupos':
        await this.validarNvel();
        this.show_cupos = true;
        break;
      default:
        this.show_cupos = false;
        break;
    }
  }

  async validarNvel(): Promise<void> {
    this.esPosgrado = false;
    try {
      const response: any = await firstValueFrom(this.projectService.get('nivel_formacion?query=Id:' + Number(this.selectednivel)));
      this.nivelSelect = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null);
      if (this.nivelSelect[0].Nombre === 'Posgrado') {
        this.esPosgrado = true;
      }
    } catch (error) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  ngOnInit() {

  }

  ngOnChanges() {

  }

}
