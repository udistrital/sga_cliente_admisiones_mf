import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { IdiomaService } from 'src/app/services/idioma.service';
import { UserService } from 'src/app/services/users.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { DocumentoService } from 'src/app/services/documento.service';
import { ProyectoAcademicoService } from '../../../services/proyecto_academico.service';
import Swal from 'sweetalert2';
import { ListService } from 'src/app/store/services/list.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment-timezone';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosComponent } from '../../evalucion-documentos-inscritos/dialogo-documentos/dialogo-documentos.component';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { TAGS_INSCRIPCION_PROGRAMA } from '../../evalucion-documentos-inscritos/def_suite_inscrip_programa/def_tags_por_programa';
import { TimeService } from 'src/app/services/time.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-inscripcion_general',
  templateUrl: './inscripcion_general.component.html',
  styleUrls: ['./inscripcion_general.component.scss'],
})
export class InscripcionGeneralComponent implements OnInit, OnChanges {
  toasterService: any;
  hide_header_labels!: boolean;
  basic_info_button: boolean = false;
  formacion_academica_button: boolean = false;
  documentos_programa_button: boolean = false;
  detalle_inscripcion: boolean = false;
  experiencia_laboral: boolean = false;
  produccion_academica: boolean = false;
  es_transferencia: boolean = false;
  nivel: any;

  tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};

  @Input('inscriptionSettings')
  set nameInscription(inscriptionSettings: any) {
    const {
      basic_info_button,
      hide_header_labels,
      formacion_academica_button,
      documentos_programa_button,
      nivel,
      select_tipo,
      detalle_inscripcion,
      experiencia_laboral,
      produccion_academica,
      es_transferencia,
    } = inscriptionSettings;

    this.nivel = nivel;
    this.selectTipo = select_tipo;
    this.hide_header_labels = !!hide_header_labels;
    this.basic_info_button = basic_info_button;
    this.formacion_academica_button = formacion_academica_button;
    this.documentos_programa_button = documentos_programa_button;
    this.detalle_inscripcion = detalle_inscripcion;
    this.experiencia_laboral = experiencia_laboral;
    this.produccion_academica = produccion_academica;
    this.es_transferencia = es_transferencia;
  }

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() changeTab: EventEmitter<any> = new EventEmitter();
  @Output() ocultarBarra: EventEmitter<boolean> = new EventEmitter();

  inscripcion_id!: number;
  info_persona_id: number;
  info_ente_id!: number;
  estado_inscripcion!: number;
  estado_inscripcion_nombre: string = "";
  estaInscrito: boolean = false;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion!: Inscripcion;
  step = 0;
  enfasisSelected: any = null;
  cambioTab = 0;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  Campo1Control = new FormControl('', [Validators.required]);
  enfasisControl = new FormControl('', [Validators.required]);

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_idio: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info:any = [];
  percentage_tab_expe:any = [];
  percentage_tab_acad:any = [];
  percentage_tab_idio:any = [];
  percentage_tab_proy:any = [];
  percentage_tab_prod:any = [];
  percentage_tab_desc:any = [];
  percentage_tab_docu:any = [];
  posgrados!: any[];
  tipo_inscripciones = [];

  show_info_pregrado = false;
  show_info_externa = false;
  show_info = false;
  show_profile = false;
  show_acad_pregrado = false;
  show_acad = false;
  show_idiomas = false;
  show_expe = false;
  show_proy = false;
  show_prod = false;
  show_desc = false;
  show_docu = false;
  showRegreso: boolean = true;

  info_contacto!: boolean;
  info_familiar!: boolean;
  info_persona!: boolean;
  info_caracteristica!: boolean;
  info_inscripcion: any;
  loading!: boolean;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tipo_documentos!: any[];
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  periodo: any;
  imprimir: boolean = false;

  tieneEnfasis: boolean = false;
  enfasis: any = [];

  puedeInscribirse: boolean = false;
  soloPuedeVer: boolean = false;

  constructor(
    private listService: ListService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
    private dialog: MatDialog,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private timeService: TimeService,
  ) {
    sessionStorage.setItem('TerceroId', this.userService.getPersonaId().toString());
    this.info_persona_id = this.userService.getPersonaId();
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.total = true;
    //this.loading = true;
    this.listService.findPais();
    this.loadData();
  }

  activateTab() {
    // No se muestra la vista de inscripción sino la de preinscripción
    this.changeTab.emit(false);
  }

  async loadData() {
    this.estado_inscripcion_nombre = <string>sessionStorage.getItem('IdEstadoInscripcion')!.toUpperCase();
    this.inscripcion = new Inscripcion();
    this.inscripcion.Id = parseInt(sessionStorage.getItem('IdInscripcion')!, 10);
    this.inscripcion.ProgramaAcademicoId = sessionStorage.getItem('ProgramaAcademico');
    const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
    const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)
    const IdPrograma = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10)
    // Se carga el nombre del periodo al que se inscribió
    this.loadPeriodo(IdPeriodo);
    // Se carga el tipo de inscripción
    this.loadTipoInscripcion(IdTipo);
    // Se carga el nivel del proyecto
    this.loadNivel(IdPrograma);
  }

  loadProject() {
    this.loading = true;
    this.posgrados = new Array;
    const IdNivel = parseInt(sessionStorage.getItem('IdNivel')!, 10);
    this.loading = true;
    let periodo = localStorage.getItem('IdPeriodo');
    this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + IdNivel + '/periodo/' + periodo).subscribe(
      (response:any) => {
        const r = <any>response;
        this.loading = false;
        if (response !== null && response !== '{}' && r.Type !== 'error' && r.length !== 0) {
          const inscripcionP = <Array<any>>response;
          this.posgrados = inscripcionP;
          this.selectedValue = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
        } else {
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_inscripcion'));
        }
      },
      (error:any) => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadNivel(IdPrograma: number) {
    this.loading = true;
    this.programaService.get('proyecto_academico_institucion/?query=Id:' + IdPrograma).subscribe(
      (response: any) => {
        let IdNivel;
        if (response[0].NivelFormacionId.NivelFormacionPadreId !== null) {
          IdNivel = response[0].NivelFormacionId.NivelFormacionPadreId.Id;
          this.loading = false;
        } else {
          IdNivel = response[0].NivelFormacionId.Id;
          this.loading = false;
        }
        this.programaService.get('nivel_formacion/' + IdNivel).subscribe(
          (res: any) => {
            this.loading = false;
            this.inscripcion.Nivel = res.Nombre;
            this.inscripcion.IdNivel = res.Id;
            sessionStorage.setItem('IdNivel', res.Id)
            this.loadProject();
          },
          error => {
            this.loading = false;
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  async checkEventoInscripcion() {
    if(this.selectedValue) {
      let EventosPrograma = this.posgrados.find((EventsProgram) => EventsProgram.ProyectoId == this.selectedValue);
      if (EventosPrograma) {
        if (EventosPrograma.EventoInscripcion) {
          let fechafin = moment(EventosPrograma.EventoInscripcion.FechaFinEvento,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
          fechafin.setDate(fechafin.getDate() + 1);

          const realhora = await this.timeService.getDate("BOG");
          let ahora = moment(realhora).tz("America/Bogota").toDate();

          if(fechafin > ahora) {
            this.puedeInscribirse = true;
          } else {
            if(!this.estaInscrito){
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_puede_inscribirse'));
            }
            this.puedeInscribirse = false;
          }
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
          this.puedeInscribirse = false;
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
        this.puedeInscribirse = false;
      }
    }
    localStorage.setItem("goToEdit", String(this.puedeInscribirse && !this.soloPuedeVer));
    return this.puedeInscribirse;
  }

  loadTipoInscripcion(IdTipo: number) {
    this.loading = true;
    this.inscripcionService.get('tipo_inscripcion/' + IdTipo).subscribe(
      (response: any) => {
        this.loading = false;
        this.inscripcion.TipoInscripcion = response.Nombre;
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadPeriodo(IdPeriodo: number) {
    this.loading = true;
    this.parametrosService.get('periodo/' + IdPeriodo).subscribe(
      (response: any) => {
        this.loading = false;
        this.inscripcion.PeriodoId = response.Data.Nombre;
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  create_inscription(data:any) {
    const info_inscripcion_temp = {
      Id: 0,
      PersonaId: this.info_persona_id || 4,
      ProgramaAcademicoId: this.selectedValue.Id || 0, // Cambiar por el periodo
      PeriodoId: this.periodo.Id,
      AceptaTerminos: true,
      FechaAceptaTerminos: new Date(),
      Activo: true,
      EstadoInscripcionId: {
        Id: 1,
      },
      TipoInscripcionId: this.tipo_inscripcion_selected,
    }
    this.loading = true;
    this.inscripcionService.post('inscripcion', info_inscripcion_temp)
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.inscripcion_id = r.Id;
          this.loading = false;
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('inscripcion.error_registrar_informacion'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  setPercentage_info(number:any, tab:any) {
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_info_externo(number:any, tab:any) {
    this.percentage_tab_info[tab] = (number * 100) / 3;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_acad(number:any, tab:any) {
    this.percentage_tab_acad[tab] = (number * 100) / 1;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  setPercentage_idio(number:any, tab:any) {
    this.percentage_tab_idio[tab] = (number * 100) / 1;
    this.percentage_idio = Math.round(UtilidadesService.getSumArray(this.percentage_tab_idio));
    this.setPercentage_total();
  }

  setPercentage_acad_pre(number:any, tab:any) {
    this.percentage_tab_acad[tab] = (number * 100);
    if (!this.es_transferencia) {
      this.percentage_tab_acad[tab] = (number * 100) / 2;
    }
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  setPercentage_expe(number:any, tab:any) {
    this.percentage_tab_expe[tab] = (number * 100) / 1;
    this.percentage_expe = Math.round(UtilidadesService.getSumArray(this.percentage_tab_expe));
    this.setPercentage_total();
  }

  setPercentage_proy(number:any, tab:any) {
    this.percentage_tab_proy[tab] = (number * 100) / 1;
    this.percentage_proy = Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy));
    this.setPercentage_total();
  }

  setPercentage_desc(number:any, tab:any) {
    this.percentage_tab_desc[tab] = (number * 100) / 1;
    this.percentage_desc = Math.round(UtilidadesService.getSumArray(this.percentage_tab_desc));
    this.setPercentage_total();
  }

  setPercentage_docu(number:any, tab:any) {
    this.percentage_tab_docu[tab] = (number * 100) / 1;
    this.percentage_docu = Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu));
    this.setPercentage_total();
  }

  setPercentage_prod(number:any, tab:any) {
    this.percentage_tab_prod[tab] = (number * 100) / 1;
    this.percentage_prod = Math.round(UtilidadesService.getSumArray(this.percentage_tab_prod));
    this.setPercentage_total();
  }

  setPercentage_total() {

    let conteoObligatorios = 0;
    let sumaPorcentajes = 0;

    if (this.tagsObject.info_persona.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_info);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.formacion_academica.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_acad);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.idiomas.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_idio);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.experiencia_laboral.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_expe);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.produccion_academica.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_prod);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.documento_programa.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_docu);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.descuento_matricula.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_desc);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.propuesta_grado.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_proy);
      conteoObligatorios += 1;
    }

    this.percentage_total = Math.round(sumaPorcentajes / conteoObligatorios);

    this.result.emit(this.percentage_total);
    if (sessionStorage['EstadoInscripcion']) {
      if (this.percentage_total >= 100) {
        this.total = false;
        let enAlgunaVista = this.show_profile || this.show_info_pregrado ||
                            this.show_acad_pregrado || this.show_expe || 
                            this.show_proy || this.show_prod || this.show_desc ||
                            this.show_docu || this.show_info || this.show_acad || 
                            this.show_info_externa || this.show_idiomas;
        if (!enAlgunaVista && this.estado_inscripcion_nombre == "INSCRIPCIÓN SOLICITADA"){
          this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), this.translate.instant('inscripcion.mensaje_100_inscripcion'), "info", false)
        }
      } else {
        this.total = true;
      }
    }
    // if (this.info_inscripcion !== undefined) {
    //   if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
    //     this.percentage_total = 100;
    //   }
    //   if (this.percentage_total >= 100) {
    //     if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
    //       this.total = false;
    //     }
    //   }
    // }
  }

  loadPercentageInfoCaracteristica(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_complementarios/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[1] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[1] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageInfoContacto(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('inscripciones/info_complementaria_tercero/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[2] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[2] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageInfoFamiliar(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_familiar/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2)) + 0.01;
            this.percentage_tab_info[3] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[3] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageFormacionAcademica() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('formacion_academica?Id=' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res.Response.Code === '200' && (Object.keys(res.Response.Body[0]).length > 0)) {
            this.percentage_acad = 100;
            this.percentage_tab_acad[0] = 100;
            this.loading = false;
          } else {
            this.percentage_acad = 0;
            this.percentage_tab_acad[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad)
        },
          (error:any) => {
            this.loading = false;
            reject(error)
          });
    });
  }

  loadPercentageFormacionAcademicaPregado(factor:any) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_formacion_pregrado/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res.Status === '200') {
            this.percentage_acad = this.percentage_acad + (100 / factor);
            this.percentage_tab_acad[0] = (100 / factor);
            this.loading = false;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad)
        },
          (error:any) => {
            this.loading = false;
            reject(error)
          });
    });
  }
  
  loadPercentageIdiomas() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.idiomaService.get('conocimiento_idioma?query=Activo:true,TercerosId:' + this.info_persona_id + '&limit=0')
        .subscribe((res:any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_idio = 100;
            this.percentage_tab_idio[0] = 100;
            this.loading = false;
          } else {
            this.percentage_idio = 0;
            this.percentage_tab_idio[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageExperienciaLaboral() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.info_persona_id)
        .subscribe((res: any) => {
          if (res.Data.Code === '200') {
            this.percentage_expe = 100;
            this.percentage_tab_expe[0] = 100;
            this.loading = false;
          } else {
            this.percentage_expe = 0;
            this.percentage_tab_expe[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_expe);
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageProduccionAcademica() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('produccion_academica/pr_academica/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res.Response.Code === '200') {
            this.percentage_prod = 100;
            this.percentage_tab_prod[0] = 100;
            this.loading = false;
          } else {
            this.percentage_prod = 0;
            this.percentage_tab_prod[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_prod);
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
    this.loading = false;
  }

  loadPercentageDocumentos() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
        this.inscripcion.Id + ',DocumentoProgramaId.ProgramaId:' + parseInt(sessionStorage['ProgramaAcademicoId'], 10) + ',DocumentoProgramaId.TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10) + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo')!, 10) + ',DocumentoProgramaId.Activo:true,DocumentoProgramaId.Obligatorio:true&limit=0').subscribe(
          (res: any) => {
            if (Object.keys(res[0]).length > 0) {
              this.percentage_docu = Math.round((res.length / this.tipo_documentos.length) * 100);
              if(this.percentage_docu >= 100){
                this.percentage_docu = 100;
              }
              this.percentage_tab_docu[0] = Math.round(this.percentage_docu);
              this.loading = false;
              resolve(this.percentage_docu);
            } else {
              this.percentage_docu = 0;
              this.percentage_tab_docu[0] = 0;
              this.loading = false;
              resolve(this.percentage_docu);
            }
          },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageDescuentos() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' + 'PersonaId=' +
        Number(window.localStorage.getItem('persona_id')) + '&DependenciaId=' +
        Number(window.sessionStorage.getItem('ProgramaAcademicoId')) + '&PeriodoId=' + Number(window.sessionStorage.getItem('IdPeriodo')))
        .subscribe((res: any) => {
          if (res.Data.Code === '200') {
            this.percentage_desc = 100;
            this.percentage_tab_desc[0] = 100;
            this.loading = false;
          } else {
            this.percentage_desc = 0;
            this.percentage_tab_desc[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_desc)
        },
          (error:any) => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageTrabajoDeGrado() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' +
        Number(window.sessionStorage.getItem('IdInscripcion'))).subscribe((res: any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_proy = 100;
            this.percentage_tab_proy[0] = 100;
            this.loading = false;
          } else {
            this.percentage_proy = 0;
            this.percentage_tab_proy[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_proy)

        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadLists() {  
    return new Promise((resolve, reject) => {
    this.inscripcionService.get('documento_programa?query=Activo:true,ProgramaId:' + parseInt(sessionStorage['ProgramaAcademicoId'], 10) + ',TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10) + ',PeriodoId:'+sessionStorage.getItem('IdPeriodo') + ',Obligatorio:true&limit=0').subscribe(
      (response:any) => {
        if (Object.keys(response[0]).length > 0) {
          this.tipo_documentos = <any[]>response;
        } else {
          this.tipo_documentos = [];
        }
        resolve(this.tipo_documentos)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        reject(error)
      },
    );
    });
  }

  ngOnInit() {
  }

  async getPorcentajes() {

    // Consulta si hay información en el tab de información personal
    if (this.percentage_info === 0 && this.tagsObject.info_persona.selected) {
      if (this.selectTipo === 'Transferencia externa' || this.nivel == 'Pregrado') {
        await this.loadPercentageInfoCaracteristica(3);
        await this.loadPercentageInfoContacto(3);
        await this.loadPercentageInfoFamiliar(3);
      } else {
        await this.loadPercentageInfoCaracteristica(2);
        await this.loadPercentageInfoContacto(2);
      }
    }

    // Consulta si hay información en formación académica
    if (this.percentage_acad === 0 && this.tagsObject.formacion_academica.selected) {
      if (this.nivel == 'Pregrado') {
        let factor = 1
        if (this.selectTipo != 'Transferencia interna' && this.selectTipo != 'Reingreso' && this.selectTipo != 'Transferencia externa') {
          let factor = 2
          ////////////////////////////////////////////////////////////////////////////////
          ////// TO DO: Preguntas de ingreso a al univerisdad en inscripción normal //////
          ////////////////////////////////////////////////////////////////////////////////
        }
        await this.loadPercentageFormacionAcademicaPregado(factor);
      } else {
        await this.loadPercentageFormacionAcademica();
      }
    }

    // Consulta si hay información en idiomas
    if (this.percentage_idio === 0 && this.tagsObject.idiomas.selected) {
      if (this.nivel == 'Pregrado') {
        let factor = 1
        if (this.selectTipo != 'Transferencia interna' && this.selectTipo != 'Reingreso' && this.selectTipo != 'Transferencia externa') {
          let factor = 2
          ////////////////////////////////////////////////////////////////////////////////
          ////// TO DO: Preguntas de ingreso a al univerisdad en inscripción normal //////
          ////////////////////////////////////////////////////////////////////////////////
        }
      } else {
        await this.loadPercentageIdiomas();
      }
    }

    // Consulta si hay información en experiencia laboral
    if (this.percentage_expe === 0 && this.tagsObject.experiencia_laboral.selected) {
      await this.loadPercentageExperienciaLaboral();
    }

    // Consulta si hay información en produccion academica
    if (this.percentage_prod === 0 && this.tagsObject.produccion_academica.selected) {
      await this.loadPercentageProduccionAcademica();
    }
    // Consulta si hay información en documentos solicitados
    if (this.percentage_docu === 0 && this.tagsObject.documento_programa.selected) {
      await this.loadLists().then(async () => {
        await this.loadPercentageDocumentos();
      })
    }

    // Consulta si hay información en descuento
    if (this.percentage_desc === 0 && this.tagsObject.descuento_matricula.selected) {
      await this.loadPercentageDescuentos();
    }

    // Consulta si hay información en propuesta trabajo de grado
    if (this.percentage_proy === 0 && this.tagsObject.propuesta_grado.selected) {
      await this.loadPercentageTrabajoDeGrado();
    }
    this.setPercentage_total();
  }

  resetPercentages() {
    this.percentage_total = 0;
    this.percentage_info = 0;
    this.percentage_acad = 0;
    this.percentage_idio = 0;
    this.percentage_expe = 0;
    this.percentage_prod = 0;
    this.percentage_docu = 0;
    this.percentage_desc = 0;
    this.percentage_proy = 0;
    this.percentage_tab_info = [];
    this.percentage_tab_acad = [];
    this.percentage_tab_idio = [];
    this.percentage_tab_expe = [];
    this.percentage_tab_prod = [];
    this.percentage_tab_docu = [];
    this.percentage_tab_desc = [];
    this.percentage_tab_proy = [];
  }

  realizarInscripcion() {
    if(this.Campo1Control.status == "VALID" && this.enfasisControl.status == "VALID") {

      this.loading = true;
      this.inscripcionService.get('inscripcion/' + parseInt(sessionStorage['IdInscripcion'], 10)).subscribe(
        (response: any) => {
          this.loading = false;
          const inscripcionPut: any = response;
          inscripcionPut.ProgramaAcademicoId = parseInt(sessionStorage['ProgramaAcademicoId'], 10);
          
          if (this.tieneEnfasis) {
            if (this.enfasisSelected) {
              inscripcionPut.EnfasisId = parseInt(this.enfasisSelected, 10);
            } else {
              inscripcionPut.EnfasisId = parseInt(this.enfasisControl.value!,10);
            }
          }

          this.loading = true;
          this.inscripcionService.get('estado_inscripcion?query=Nombre:INSCRITO').subscribe(
            (response: any) => {
              this.loading = false;
              const estadoInscripcio: any = response[0];
              inscripcionPut.EstadoInscripcionId = estadoInscripcio;

              this.loading = true;
              this.inscripcionService.put('inscripcion/', inscripcionPut)
                .subscribe(res_ins => {
                  this.loading = false;
                  const r_ins = <any>res_ins;
                  if (res_ins !== null && r_ins.Type !== 'error') {
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
                    this.imprimir = true;
                    localStorage.setItem("goToEdit", String(false));
                    this.perfil_editar('perfil');
                  }
                },
                  (error: any) => {
                    this.loading = false;
                    if (error.System.Message.includes('duplicate')) {
                      Swal.fire({
                        icon: 'info',
                        text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                      });
                    } else {
                      this.loading = false;
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                          this.translate.instant('GLOBAL.admision'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    }
                  });
            },
            error => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        },
        error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    } else {
      this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'),this.translate.instant('enfasis.select_enfasis'));
      this.enfasisControl.markAsTouched();
    }

  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event:any): void {
    this.ocultarBarra.emit(true);
    switch (event) {
      case 'info_contacto':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        break;
      case 'info_caracteristica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_docu = false;
        this.show_desc = false;
        this.show_prod = false;
        break;
      case 'info_persona':
        if (this.selectTipo === 'Pregrado') {
          this.viewtag = 'Informacion_pregrado'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Posgrado') {
          this.viewtag = 'Informacion_posgrado'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso') {
          if (this.nivel === 'Pregrado') {
            this.viewtag = 'Informacion_pregrado'
            this.selecttabview(this.viewtag);
          }
          if (this.nivel === 'Posgrado') {
            this.viewtag = 'Informacion_posgrado'
            this.selecttabview(this.viewtag);
          }
        }
        if (this.inscripcion.TipoInscripcion === 'Transferencia externa') {
          this.viewtag = 'Informacion_externa'
          this.selecttabview(this.viewtag);
        }
        break;
      case 'info_familiar':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_familiar = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        break;
      case 'experiencia_laboral':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_acad = false;
        this.show_docu = false;
        this.show_idiomas = false;
        this.show_expe = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_prod = false;
        break;
      case 'formacion_academica':
        if (this.selectTipo === 'Pregrado') {
          this.viewtag = 'Formacion_pregrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Posgrado') {
          this.viewtag = 'Formacion_posgrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso' || this.selectTipo === 'Transferencia externa') {
          if (this.nivel === 'Pregrado') {
            this.viewtag = 'Formacion_pregrago'
            this.selecttabview(this.viewtag);
          }
          if (this.nivel === 'Posgrado') {
            this.viewtag = 'Formacion_posgrago'
            this.selecttabview(this.viewtag);
          }
        }
        break;
      case 'idiomas':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = true;
        this.show_expe = false;
        this.show_docu = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case 'produccion_academica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.show_docu = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = true;
        break;
      case 'documento_programa':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case 'descuento_matricula':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = true;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case 'propuesta_grado':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_docu = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_proy = true;
        this.info_persona = false;
        this.show_desc = false;
        this.show_prod = false;
        break;
      case 'perfil':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = true;
        this.show_acad = false;
        this.show_idiomas = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        break;
      case 'salir_preinscripcion':
        this.activateTab();
        break;
      default:
        this.show_info = false;
        this.show_docu = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.imprimir = false;
        this.showRegreso = true;
        break;
    }
  }

  selecttabview(viewtag:any) {
    switch (viewtag) {
      case ('Informacion_pregrado'):
        this.showRegreso = false;
        this.show_info_pregrado = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_pregrago'):
        this.showRegreso = false;
        this.show_info_pregrado = false;
        this.show_profile = false;
        this.show_acad_pregrado = true;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_posgrado'):
        this.showRegreso = false;
        this.show_info = true;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_posgrago'):
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = true;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_externa'):
        this.showRegreso = false;
        this.show_info_externa = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
    }

  }

  selectTab(event:any): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.info_persona')) {
      if (this.info_persona)
        this.perfil_editar('info_persona');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.info_caracteristica')) {
      this.perfil_editar('info_caracteristica');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.informacion_contacto')) {
      this.perfil_editar('info_contacto');
    }
  }

  ngOnChanges() {
  }

  async tipo_inscripcion(select:any) {
    if (select == 'programa') {
      this.enfasisSelected = undefined;
      this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
    
      if (this.inscripcion.IdNivel === 1) {
        this.selectedTipo = 'Pregrado'
      } else {
        this.selectedTipo = 'Posgrado'
      }

      if (this.selectedValue !== undefined) {
        sessionStorage.setItem('ProgramaAcademicoId', this.selectedValue);
        this.programaService.get('proyecto_academico_enfasis/?query=ProyectoAcademicoInstitucionId.Id:' + this.selectedValue)
          .subscribe((enfasis: any) => {
            this.enfasis = enfasis.map((e:any) => (e.EnfasisId));
            this.tieneEnfasis = this.enfasis.length > 0;
            this.enfasisSelected = parseInt(sessionStorage.getItem('IdEnfasis')!);
          })
      } else {
        this.tieneEnfasis = false;
        this.enfasis = [];
      }
    
      switch (this.selectedTipo) {
        case ('Pregrado'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Posgrado'):
          this.selectTipo = 'Posgrado';
          this.selectprograma = true;
          break;
        case ('Transferencia interna'):
          this.selectprograma = false;
          this.selectTipo = 'Transferencia interna';
          break;
        case ('Reingreso'):
          this.selectprograma = false;
          this.selectTipo = 'Reingreso';
          break;
        case ('Transferencia externa'):
          this.selectprograma = true;
          this.selectTipo = 'Transferencia externa';
          break;
        case ('Profesionalización tecnólogos'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Ciclos propedéuticos'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Movilidad Académica'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
      }
    }

    if (select == 'enfasis') {
      if (this.enfasisSelected) {
        this.resetPercentages();
        const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
        const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)
        if(await this.loadSuitePrograma(IdPeriodo, this.selectedValue, IdTipo)) {
          if (this.estado_inscripcion_nombre !== "INSCRIPCIÓN SOLICITADA") {
            this.Campo1Control.disable();
            this.enfasisControl.disable();
            this.estaInscrito = true;
            this.soloPuedeVer = true;
            this.puedeInscribirse = false;
            localStorage.setItem("goToEdit", String(this.puedeInscribirse));
            if (this.estado_inscripcion_nombre == "INSCRITO CON OBSERVACIÓN"){
              this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), 
                    this.translate.instant('inscripcion.informar_estado_inscrito_obs'), "info", false);
            }
          } else if (await this.checkEventoInscripcion()) {
            this.percentage_total = 0;
            await this.getPorcentajes();
          }
        }
      }
    }
  }

  redirectBecauseObservations() {
    if (this.estado_inscripcion_nombre == "INSCRITO CON OBSERVACIÓN"){
      this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), 
            this.translate.instant('inscripcion.info_boton_cambio_inscrito'), "info", false);
      this.perfil_editar('perfil');
    }
  }

  loadSuitePrograma(periodo:any, proyecto:any, tipoInscrip:any) {
    return new Promise((resolve) => {
    this.loading = true;
    this.evaluacionInscripcionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:'+periodo+',DependenciaId:'+proyecto+',TipoInscripcionId:'+tipoInscrip)
        .subscribe((response: any) => {
          if (response != null && response.Status == '200') {
            if (Object.keys(response.Data[0]).length > 0) {
              this.tagsObject = JSON.parse(response.Data[0].ListaTags);
              this.loading = false;
              resolve(this.tagsObject)
            } else {
              this.loading = false;
              this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
              this.puedeInscribirse = false;
              this.soloPuedeVer = false;
              this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
              resolve(false);
            }
          } else {
            this.loading = false;
            this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
            this.puedeInscribirse = false;
            this.soloPuedeVer = false;
            this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
            resolve(false);
          }
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
          this.puedeInscribirse = false;
          this.soloPuedeVer = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          resolve(false);
        });
  });
  }

  mostrarBarraExterna() {
    this.ocultarBarra.emit(false);
    this.setPercentage_total();
  }

  revisarDocumento(doc: any) {
      const assignConfig = new MatDialogConfig();
      assignConfig.width = '1300px';
      assignConfig.height = '750px';
      assignConfig.data = { documento: doc }
      const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);
//      dialogo.afterClosed().subscribe(data => {});
  }
}
