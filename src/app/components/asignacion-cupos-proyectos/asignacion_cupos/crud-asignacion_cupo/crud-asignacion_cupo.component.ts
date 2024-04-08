import { FORM_ASIGNACION_CUPO_POSGRADO } from './form-asignacion_cupo_posgrado';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_ASIGNACION_CUPO } from './form-asignacion_cupo';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { MatSelect } from '@angular/material/select';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { InscripcionService } from 'src/app/services/inscripcion.service';

@Component({
  selector: 'crud-asignacion-cupo',
  templateUrl: './crud-asignacion_cupo.component.html',
  styleUrls: ['./crud-asignacion_cupo.component.scss'],
})
export class CrudAsignacionCupoComponent implements OnInit, OnChanges {
  // config: ToasterConfig;

  @Input() info_proyectos: any;
  @Input() info_periodo: any;
  @Input() info_nivel!: boolean;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_actualizar_estados: any;
  info_info_persona: any;
  info_cupos: any;
  info_criterio_icfes_post: any;
  showFormPregrado: boolean = false;
  showFormPosgrado: boolean = false;
  formAsigancionCupoPregrado: any;
  formAsigancionCupoPosgrado: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean!: boolean;
  loading: boolean;
  percentage!: number;
  aceptaTerminos!: boolean;
  showListadoAspirantes: boolean = false;
  programa!: number;
  aspirante!: number;
  periodo: any;
  show_calculos_cupos = false;
  porcentaje_subcriterio_total!: number;
  settings_emphasys: any;
  settings_emphasys1: any;
  arr_cupos: any[] = [];
  show_listado: boolean = false;
  info_consultar_aspirantes: any;
  niveles!: NivelFormacion[];
  show_posgrado: boolean = false;

  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private evaluacionService: EvaluacionInscripcionService,
    // private toasterService: ToasterService,
    private inscripcionService: InscripcionService,) {
    this.formAsigancionCupoPregrado = FORM_ASIGNACION_CUPO;
    this.construirFormPregrado();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirFormPregrado();
    });

    this.formAsigancionCupoPosgrado = FORM_ASIGNACION_CUPO_POSGRADO;
    this.construirFormPostgrado();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirFormPostgrado();
    });

    this.loading = false;
  }

  construirFormPregrado() {
    this.formAsigancionCupoPregrado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formAsigancionCupoPregrado.campos.length; i++) {
      this.formAsigancionCupoPregrado.campos[i].label = this.translate.instant('GLOBAL.' + this.formAsigancionCupoPregrado.campos[i].label_i18n);
      this.formAsigancionCupoPregrado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formAsigancionCupoPregrado.campos[i].label_i18n);
    }
  }

  construirFormPostgrado() {

    this.formAsigancionCupoPosgrado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formAsigancionCupoPosgrado.campos.length; i++) {
      this.formAsigancionCupoPosgrado.campos[i].label = this.translate.instant('GLOBAL.' + this.formAsigancionCupoPosgrado.campos[i].label_i18n);
      this.formAsigancionCupoPosgrado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formAsigancionCupoPosgrado.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexFormPregrado(nombre: String): number {
    for (let index = 0; index < this.formAsigancionCupoPregrado.campos.length; index++) {
      const element = this.formAsigancionCupoPregrado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getIndexFormPosgrado(nombre: String): number {
    for (let index = 0; index < this.formAsigancionCupoPosgrado.campos.length; index++) {
      const element = this.formAsigancionCupoPosgrado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  onCreateEmphasys(event: any) {
    const projetc = event.value;
    if (!this.arr_cupos.find((proyectos: any) => projetc.Id === proyectos.Id) && projetc.Id) {
      this.arr_cupos.push(projetc);
      const matSelect: MatSelect = event.source;
      matSelect.writeValue(null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.error_proyecto_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onDeleteEmphasys(event: any) {
    const findInArray = (value:any, array:any, attr:any) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    }
    this.arr_cupos.splice(findInArray(event.data.Id, this.arr_cupos, 'Id'), 1);
  }

  createCupos() {
    this.showListadoAspirantes = false;
    this.show_listado = false;
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('GLOBAL.confirmar_actualizar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          console.info(JSON.stringify(this.info_cupos));
          
          this.sgaMidAdmisiones.post('admision/cupos', this.info_cupos)
            .subscribe(res => {
              console.log(res)

              const r = <any>res
              if (r !== null && r.status === 200) {
                this.loading = false;
                //this.cambiarestados();
                this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_cupos') + ' ' + this.translate.instant('GLOBAL.confirmarCrear'));
                this.showListadoAspirantes = true;
                this.eventChange.emit(true);
              } else {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.crear') + '-' +
                    this.translate.instant('GLOBAL.info_cupos'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }



  ngOnInit() {
    this.show_posgrado = this.info_nivel;
  }

  ngOnChanges() {
    this.show_posgrado = this.info_nivel;

    if (this.info_proyectos != undefined && this.info_proyectos != null) {
      this.evaluacionService.get('cupos_por_dependencia/?query=DependenciaId:' + Number(this.info_proyectos.Id) + ',PeriodoId:' + Number(this.info_periodo.Id) + '&limit=1').subscribe(
        (response: any) => {
          if (response !== null && response !== undefined && response[0].Id !== undefined) {

            if (this.show_posgrado) {
              this.formAsigancionCupoPosgrado.campos[this.getIndexFormPosgrado('CuposAsignados')].valor = response[0].CuposHabilitados;
            } else {
              this.formAsigancionCupoPregrado.campos[this.getIndexFormPregrado('CuposAsignados')].valor = response[0].CuposHabilitados;
              this.formAsigancionCupoPregrado.campos[this.getIndexFormPregrado('CuposOpcionados')].valor = response[0].CuposOpcionados;
            }
          } else {
            if (this.show_posgrado) {
              this.formAsigancionCupoPosgrado.campos[this.getIndexFormPosgrado('CuposAsignados')].valor = 0;
            } else {
              this.formAsigancionCupoPregrado.campos[this.getIndexFormPregrado('CuposAsignados')].valor = 0;
              this.formAsigancionCupoPregrado.campos[this.getIndexFormPregrado('CuposOpcionados')].valor = 0;
            }
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  validarForm(event:any) {
    if (event.valid) {
      const cupos = event.data.InfoCupos.CuposAsignados
      const datos = [{ Nombre: 'Comunidades Negras', Cupos: Math.trunc((Number(cupos) / 40) * 2) },
      { Nombre: 'Desplazados víctimas del conflicto  armado', Cupos: Math.trunc((Number(cupos) / 40) * 1) },
      { Nombre: 'Comunidades indígenas', Cupos: Math.trunc((Number(cupos) / 40) * 2) },
      { Nombre: 'Mejor Bachiller de los Colegios Públicos del Distrito Capital', Cupos: Math.trunc((Number(cupos) / 40) * 1) },
      { Nombre: 'Beneficiarios de la ley 1084 de 2006 ', Cupos: 1 },
      { Nombre: 'Beneficiarios del Programa de Reincorporación y/o Reintegración en el marco del programa para la paz', Cupos: 1 }];
      const data = <Array<any>>datos;
      // this.source_emphasys.load(data);
      this.show_calculos_cupos = true;
      this.calculocupos(event.data.InfoCupos)
    }
  }

  calculocupos(InfoCupos: any): void {
    // Se definen el calculos de los cupos segun historia de usuario la funcion redondea segun decimas por encima por encima de .5
    this.info_cupos = <any>InfoCupos;
    if (this.show_posgrado) {
      this.info_cupos.CuposOpcionados = 0;
      this.info_cupos.CuposEspeciales = {
        ComunidadesNegras: '0',
        DesplazadosVictimasConflicto: '0',
        ComunidadesIndiginas: '0',
        MejorBachiller: '0',
        Ley1084: '0',
        ProgramaReincorporacion: '0',
      }
    } else {
      this.info_cupos.CuposEspeciales = {
        ComunidadesNegras: String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40) * 2)),
        DesplazadosVictimasConflicto: String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40) * 1)),
        ComunidadesIndiginas: String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40) * 2)),
        MejorBachiller: String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40) * 1)),
        Ley1084: '1',
        ProgramaReincorporacion: '1',
      }
    }
    const proyectos = [];
    proyectos.push(this.info_proyectos);
    this.info_cupos.Proyectos = proyectos;
    this.info_cupos.Periodo = this.info_periodo;
    // this.info_cupos.CuposOpcionados = Number(Math.trunc((Number(this.info_cupos.CuposAsignados) ) * 0.5 ))
    this.createCupos();

  }

  cambiarestados() {
    this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + Number(this.info_proyectos.Id) + ',PeriodoId:' + this.info_periodo.Id + '&sortby=Id&order=asc').subscribe(
      (res: any) => {
        const r = <any>res
        if (res !== '[{}]') {
          if (r !== null && r.Type !== 'error') {
            this.loading = false;
            let filtro = r.filter((filtro:any) => filtro.EstadoInscripcionId.Id === 2 || filtro.EstadoInscripcionId.Id === 4 || filtro.EstadoInscripcionId.Id === 5);
            filtro = filtro.sort((puntaje_mayor:any, puntaje_menor:any) => puntaje_menor.NotaFinal - puntaje_mayor.NotaFinal)
            const data = <Array<any>>filtro;
            // this.source_emphasys.load(data);

            data.forEach((element, index) => {
              if (element.PersonaId != undefined) {
                if ((index + 1) <= this.info_cupos.CuposAsignados) {
                  element.EstadoInscripcionId.Id = 2;
                  this.inscripcionService.put('inscripcion/', element)
                    .subscribe(res => {
                      this.loading = false;
                    },
                      (error: HttpErrorResponse) => {
                        this.loading = false;
                        Swal.fire({
                          icon: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.info_estado'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                } else {
                  element.EstadoInscripcionId.Id = 4;
                  this.inscripcionService.put('inscripcion/', element)
                    .subscribe(res => {
                      this.loading = false;
                    },
                      (error: HttpErrorResponse) => {
                        this.loading = false;
                        Swal.fire({
                          icon: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.info_estado'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              }
            });

          } else {
            // this.showToast('error', this.translate.instant('GLOBAL.error'),
            //   this.translate.instant('GLOBAL.error'));
          }
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('admision.no_data'));
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
            this.translate.instant('GLOBAL.info_estado'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }
}
