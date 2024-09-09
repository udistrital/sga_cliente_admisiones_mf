
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';

@Component({
  selector: 'app-multiple-programa',
  templateUrl: './multiple-programa.component.html',
  styleUrls: ['./multiple-programa.component.scss']
})
export class MultipleProgramaComponent {

  //Datos seleccionados del formulario
  periodo_selected: any;
  tipo_inscripcion_selected: any;
  proyectos_origen_selected: any;
  proyectos_destino_selected: any;

  //Data cargada en los selects de los formularios
  periodos: any = [];
  proyectos: any = [];
  tiposInscripcion: any = [];

  //Control de los selects
  selectprograma: boolean = true;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private projectService: ProyectoAcademicoService,
  ) {
    this.cargarPeriodo();
    this.cargarTipoInscripcion();
    this.cargarProyectos();
  }

  guardarConfiguracionMultiplePrograma() {
    return new Promise((resolve, reject) => {
      if (
        this.periodo_selected !== undefined &&
        this.tipo_inscripcion_selected !== undefined &&
        this.proyectos_origen_selected !== undefined &&
        this.proyectos_destino_selected) {

        const data = {
          //Id: 0,
          Activo: true,
          //CuposHabilitados: 0,
          //CuposOpcionados: 0,
          PeriodoId: this.periodo_selected,
          ProyectoAcademicoId: this.proyectos_origen_selected,
          ProyectoOrigenId: this.proyectos_destino_selected,
          TipoInscripcionId:{Id:this.tipo_inscripcion_selected} ,
          //CupoId: 0,
          FechaCreacion: new Date(),
          FechaModificacion: new Date(),
        }
        this.inscripcionService.post(`cupo_inscripcion`, data).subscribe((response: any) => {
          if (response != null || response != undefined || response != "") {
            alert("Configuracion guardada");
            this.popUpManager.showErrorToast(this.translate.instant('Configuracion Gardada Exitasamente'))
          }
        }, (error) => {
          this.popUpManager.showErrorToast(
            this.translate.instant("ERROR.general")
          );
        });
      }
      else {
        this.popUpManager.showErrorToast(this.translate.instant("ERROR.campos"));
      }
    });
  }

  SubirDocumento() { }

  cargarProyectos() {
    return new Promise((resolve, reject) => {
      this.projectService.get("proyecto_academico_institucion?limit=0")
        .subscribe((response: any) => {

          if (response !== null && response !== undefined) {
            const proyectos = <any[]>response;
            proyectos.forEach(element => {
              this.proyectos.push(element);
            });
            resolve(proyectos);
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  selectPeriodo() {
    this.tipo_inscripcion_selected = undefined;
    this.proyectos_origen_selected = undefined;
    this.proyectos_destino_selected = undefined;
  }

  cargarTipoInscripcion() {
    this.inscripcionService.get("tipo_inscripcion?limit=0").subscribe(
      (response: any) => {
        if (response !== undefined && response !== null) {
          const tiposInscripcionFiltrados = response.filter((p: any) => p.Nombre === "Doble Programa" || p.Nombre === "Doble Titulacion");
          this.tiposInscripcion = tiposInscripcionFiltrados
        }
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("ERROR.general")
        );
      }
    );
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((response: any) => {
          const r = <any>response;
          if (response !== null && r.Status === '200') {
            this.periodo_selected = response.Data.find((p: any) => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo_selected['Id']));
            resolve(this.periodo_selected);
            const periodos = <any[]>response['Data'];
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

}



