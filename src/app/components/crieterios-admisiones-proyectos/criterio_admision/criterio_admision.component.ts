import { async } from '@angular/core/testing';
import { Criterio } from 'src/app/models/admision/criterio';
import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { UserService } from 'src/app/services/users.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../models/inscripcion/inscripcion'
import Swal from 'sweetalert2';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
// import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { MatTableDataSource } from '@angular/material/table';
import { OikosService } from 'src/app/services/oikos.service';
import { forEach } from 'lodash';

@Component({
  selector: 'criterio-admision',
  templateUrl: './criterio_admision.component.html',
  styleUrls: ['./criterio_admision.component.scss'],
})
export class CriterioAdmisionComponent implements OnChanges {



  @ViewChild('inputRef') inputRef!: ElementRef;
  @Input('criterios_select')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;

    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.getInfoInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename

  
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  ofertarOpcion2!: FormGroup;
  ofertarOpcion3!: FormGroup;

  inscripcion_id!: number;
  info_persona_id!: number;
  info_ente_id!: number;
  estado_inscripcion!: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion!: Inscripcion;
  preinscripcion!: boolean;
  step = 0;
  cambioTab = 0;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;
  facultad: any;
  facultades: any[] = [];
  proyectosFilteredFacultad!: any[];
  criterioEsExamenEstado: boolean = false;
  valorMinimo: any = 0;
  validarExistenciaExamenEstado: boolean = false;

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info: any;
  percentage_tab_expe = [];
  percentage_tab_acad: any;
  proyectos: any;
  criterios: any;
  periodos: any = [];
  niveles!: NivelFormacion[];

  show_icfes = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona!: boolean;
  loading!: boolean;
  ultimo_select!: number;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected!: any;
  criterio_selected!: any;
  selectTipoIcfes: any;
  selectTipo: any;
  selectTipoEntrevista: any;
  selectTipoPrueba: any;
  selectTabView: any;
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any;

  settings: any;
  settingsSubcriterio: any;
  dataSourceColumns = ["criterio", "porentaje", "acciones"]
  dataSource!: MatTableDataSource<any>;
  dataSourceSubcriterio!: MatTableDataSource<any>;
  porcentajeCriterioTable: boolean = false
  porcentajeSubcriterioTable: boolean = false
  data: any[] = [];
  dataSubcriterios: any[] = [];
  porcentajeTotal: number = 0;
  porcentajeSubcriterioTotal: number = 0;
  // requisitoPost: any;
  mostrarSubcriterio: boolean = false;
  requisitoId!: number | undefined;
  areas: any;
  criteriosAreas: any;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  constructor(
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private evaluacionService: EvaluacionInscripcionService,
    private admisiones: EvaluacionInscripcionService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private oikosService: OikosService,
    private builder: FormBuilder,
  ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    // this.dataSource = new LocalDataSource();
    this.ofertarOpcion2 = this.builder.group({
      opcion:[false, Validators.required],
    });
    this.ofertarOpcion3 = this.builder.group({
      opcion:[false, Validators.required],
    });
    this.total = true;
    this.data = [];
    this.porcentajeTotal = 0;
    this.porcentajeSubcriterioTotal = 0;
    this.nivel_load()
    this.loadData();
    this.loadCriterios();
    this.cargarFacultad();
    this.loadProyectos();
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();

      await this.cargarPeriodo();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  buttonedit(row: any): void {
    row.mostrarBotones = !row.mostrarBotones;
  
    if (row.mostrarBotones) {
      // Si se activa el modo de edición, desactiva el resto de los modos de edición en otras filas
      this.data.forEach((item: any) => {
        if (item !== row) {
          item.mostrarBotones = false;
        }
      });

      setTimeout(() => {
        this.inputRef.nativeElement.focus();
      });
    }
  }
  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      // (response: NivelFormacion[]) => {
      (response: any) => {
        this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null && nivel.Nombre == 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  // cargarPeriodo() {
  //   return new Promise((resolve, reject) => {
  //     this.parametrosService.get('periodo?query=Activo:true&sortby=Id&order=desc&limit=1')
  //       .subscribe(res => {
  //         const periodos = <any[]>res['Data'];
  //         if (res !== null && res['Success']) {
  //           this.periodo = <any>periodos[0];
  //           window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
  //           resolve(this.periodo);
  //           periodos.forEach(element => {
  //             this.periodos.push(element);
  //           });
  //         }
  //       },
  //         (error: HttpErrorResponse) => {
  //           reject(error);
  //         });
  //   });
  // }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          console.log(this.periodos)
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find((p: any) => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach((element: any) => {
              console.log(element)
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  setPercentage_info(number: any, tab: string | number) {
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_acad(number: any, tab: any) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }
  setPercentage_total() {
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 2;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    if (this.info_inscripcion !== undefined) {
      if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
        this.percentage_total = 100;
      }
      if (this.percentage_total >= 100) {
        if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
          this.total = false;
        }
      }
    }
  }

  limpiarDatos() {
    this.criterios.forEach((criterio: any) => {
      criterio['Porcentaje'] = 0
      criterio.Subcriterios.forEach((sub: any) => {
        sub['Porcentaje'] = 0
      });
    })
  }

  activeCriterios() {
    this.selectcriterio = false;
    this.criterio_selected = [];
    this.limpiarDatos()
    console.log(this.periodo)
    this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' + this.proyectos_selected +
      ',PeriodoId:' + this.periodo.Id).subscribe(response => {
        const r = <any>response;
        if (r[0].Id !== undefined && r[0] !== '{}' && r.Type !== 'error') {
          r.forEach((element: any) => {
            const criterio_aux: any = this.criterios.find((e: any) => e.Id === element.RequisitoId.Id)
            const subcriterios_aux = JSON.parse(element.PorcentajeEspecifico).areas
            criterio_aux['Porcentaje'] = element.PorcentajeGeneral
            const ofertarOpcion_aux2 = element.OfertarOpcion2
            const ofertarOpcion_aux3 = element.OfertarOpcion3

            if (element.PuntajeMinimoExamenEstado) {
              const valorMinimo_aux = element.PuntajeMinimoExamenEstado
              this.valorMinimo = valorMinimo_aux
            }
          
            criterio_aux.Subcriterios.forEach((sub: any) => {
              if (subcriterios_aux != undefined) {
                subcriterios_aux.forEach((sub_aux: any) => {
                  if (sub_aux.Id === sub.Id) {
                    sub['Porcentaje'] = parseInt(sub_aux['Porcentaje'], 10)
                  }
                });
              }
            });
            this.criterio_selected.push(criterio_aux)
            this.ofertarOpcion2.controls['opcion'].setValue(ofertarOpcion_aux2);
            this.ofertarOpcion3.controls['opcion'].setValue(ofertarOpcion_aux3);
            
          });

          this.Campo2Control = new FormControl(this.criterio_selected)
          this.viewtab();
        } else {
          this.criterio_selected = []
          this.ofertarOpcion2.controls['opcion'].setValue(false);
          this.ofertarOpcion3.controls['opcion'].setValue(false);
          this.valorMinimo = 0;
          this.Campo2Control = new FormControl(this.criterio_selected)
          // this.viewtab();
          this.selectTipo = false
        }
      },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
        },
      );

    if (this.criterio_selected.length === 0) {
      this.selectTipo = false
    }
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

  cargarFacultad(){
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_tipo_dependencia/?query=Activo:true&limit=0')
        .subscribe((response: any) => {
          if (response != null && response.Status != '404' 
              && Object.keys(response[0]).length > 0) {
                for (let obj of response) {
                  if (obj.TipoDependenciaId.Id == 2) {
                    this.facultades.push(obj.DependenciaId);
                  }
                }
                resolve(this.facultades);
          } else {
            reject({Facultad: "Bad answer"});
          }
        },
        (error: HttpErrorResponse) => {
          reject({Facultad: error});
        });
    });

  }

  filtrarPorFacultades(selProyecto:any) {
    console.log("1111111111111",this.proyectos);
    if (this.proyectos && this.proyectos.length > 0) {
      this.proyectosFilteredFacultad = this.proyectos.filter(
        (proyect: any) => {
          if (proyect.FacultadId == selProyecto) {
            return true;
          } else {
            return false;
          }
        }      
      );
    }

    console.log("AAAAAAAAAA",this.proyectosFilteredFacultad);
    // this.proyecto = undefined;
    // this.tipoInscrip = undefined;
  }

  loadProyectos() {
    // window.localStorage.setItem('IdNivel', String(this.selectednivel.id));
    this.selectprograma = false;
    this.loading = true;
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
      (res: any) => {
        this.autenticationService.getRole().then(
          // (rol: Array <String>) => {
          (rol: any) => {
            let r = rol.find((role: any) => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
            if (r) {
              this.proyectos = <any[]>res.filter(
                (proyecto: any) => this.filtrarProyecto(proyecto),
              );
            } else {
              const id_tercero = this.userService.getPersonaId();
              this.sgaMidService.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
                (respDependencia: any) => {
                  const dependencias = <Number[]>respDependencia.Data.DependenciaId;
                  this.proyectos = <any[]>res.filter(
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
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.programa_academico'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  loadCriterios() {
    this.evaluacionService.get('requisito/?query=Activo:true&limit=0')
      .subscribe((res: any) => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.criterios = <Criterio[]>res.filter((c: any) => c['RequisitoPadreId'] === null);
          this.criterios.forEach((criterio: any) => {
            criterio['Porcentaje'] = 0
            this.admisiones.get('requisito?limit=0&query=Activo:true,RequisitoPadreId.Id:' + criterio.Id).subscribe(
              (response: any) => {
                if (response.length > 0 && Object.keys(response[0]).length > 0) {
                  criterio.Subcriterios = <Criterio[]>response;
                  criterio.Subcriterios.forEach((sub: any) => {
                    sub['Porcentaje'] = 0
                  });
                } else {
                  criterio.Subcriterios = [];
                }
                console.log("AAAAAAAAAAAAAAAAAAAAAAAA",this.criterios)
              },
              error => {
                criterio.Subcriterios = [];
                this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
              },
            );
          });
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.programa_academico'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event: any): void {
    switch (event) {
      case 'info_icfes':
        this.show_icfes = true;
        break;
      case 'info_entrevista':
        this.preinscripcion = true;
        break;
      case 'info_entrevista':
        this.show_icfes = false;
        break;
      default:
        this.show_icfes = false;
        break;
    }
  }

 

  ngOnChanges() {
  }

  viewtab() {
    if (this.criterio_selected.length === 0) {
      this.Campo2Control = new FormControl(this.criterio_selected)
      this.selectTipo = false
      this.criterioEsExamenEstado = false;
      this.valorMinimo = 0;
    } else {
      console.log("22222222222222222222222222222222222",this.criterio_selected)
      // Porcentaje: element.PorcentajeGeneral,
      this.criterio_selected.forEach((criterio: any) => {
        if(criterio.ExamenEstado){
          this.validarExistenciaExamenEstado = true;
        }
        criterio['Criterio'] = criterio.Nombre
        criterio['Porcentaje'] = criterio.Porcentaje
        criterio.Subcriterios.forEach((subcriterio: any) => {
          subcriterio['Porcentaje'] = subcriterio.Porcentaje
        });
      })

      if(this.validarExistenciaExamenEstado){
        this.criterioEsExamenEstado = true;
      }else{
        this.criterioEsExamenEstado = false;
      }
      this.validarExistenciaExamenEstado = false;
      this.selectTipo = true
      this.data = [];
      // this.dataSource = new LocalDataSource();
      console.log("22222222222222222222222222222222222",this.criterio_selected)
      for (let i = 0; i < this.criterio_selected.length; i++) {
        this.createTable(this.criterio_selected[i]);
        this.selectTipoIcfes = true;
      }
      this.calcularPorcentaje();
    }
  }

  createSubCriterios(subcriterios: any) {
    this.dataSubcriterios = [];
    for (let i = 0; i < subcriterios.length; i++) {
      this.dataSubcriterios.push({
        Id: subcriterios[i].Id,
        Criterio: subcriterios[i].Nombre,
        Porcentaje: subcriterios[i].Porcentaje,
        CodigoAbreviacion: subcriterios[i].CodigoAbreviacion,
      });
    }
  }

  createTable(criterio: any) {
    this.data.push({
      Id: criterio.Id,
      Criterio: criterio.Nombre,
      Porcentaje: criterio.Porcentaje,
      Subcriterios: criterio.Subcriterios,
    });

    // this.dataSource.load(this.data);
    console.log(this.data)
    this.dataSource = new MatTableDataSource(this.data)
    this.settings = {
      columns: {
        Criterio: {
          title: this.translate.instant('admision.criterio'),
          editable: false,
          filter: false,
          width: '55%',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Porcentaje: {
          title: this.translate.instant('admision.porcentaje'),
          editable: true,
          filter: false,
          valuePrepareFunction: (value: any) => {
            this.calcularPorcentaje();
            return value;
          },
        },
      },
      actions: {
        edit: true,
        add: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        width: '5%',
      },
      edit: {
        editButtonContent:
          '<i class="nb-edit" title="' + this.translate.instant('admision.tooltip_editar') +
          '"></i>',
        saveButtonContent:
          '<i class="nb-checkmark" title="' + this.translate.instant('admision.tooltip_guargar') +
          '"></i>',
        cancelButtonContent:
          '<i class="nb-close" title="' + this.translate.instant('admision.tooltip_cancelar') +
          '"></i>',
      },
    }
  }
  devolverBotoneditarCriterio() {
    this.porcentajeCriterioTable = false
    this.devolverBotoneditarSubciterio()
  }
  devolverBotoneditarSubciterio() {
    this.porcentajeSubcriterioTable = false
  }
  onEdit(event: any) {
    this.porcentajeCriterioTable = true

    this.requisitoId = undefined;
    this.mostrarSubcriterio = false;
    if (event.data.Porcentaje == '') {
      event.data.Porcentaje == 0;
    }
    this.calcularPorcentaje();
    if (!event.isSelected) {
      this.requisitoId = event.data.Id;
      if (event.data.Subcriterios.length > 0) {
        this.mostrarSubcriterio = true;
        this.createSubCriterios(event.data.Subcriterios);
      } else {
        this.dataSubcriterios = [];
        this.dataSubcriterios.push({});
      }
      // this.dataSourceSubcriterio = new LocalDataSource();
      const subcriterios = event.data.Subcriterios;
      if (subcriterios != undefined && subcriterios.length > 0) {
        // this.dataSourceSubcriterio.load(this.dataSubcriterios);
        this.dataSourceSubcriterio = new MatTableDataSource(subcriterios)

        this.settingsSubcriterio = {
          columns: {
            Criterio: {
              title: this.translate.instant('admision.subCriterio'),
              editable: false,
              filter: false,
              width: '55%',
              valuePrepareFunction: (value: any) => {
                return value;
              },
            },
            Porcentaje: {
              title: this.translate.instant('admision.porcentaje'),
              editable: true,
              filter: false,
              valuePrepareFunction: (value: any) => {
                this.calcularPorcentajeSubcriterio();
                return value;
              },
            },
          },
          actions: {
            edit: true,
            add: false,
            delete: false,
            position: 'right',
            columnTitle: this.translate.instant('GLOBAL.acciones'),
            width: '5%',
          },
          edit: {
            editButtonContent:
              '<i class="nb-edit" title="' +
              this.translate.instant('admision.tooltip_editar') +
              '"></i>',
            saveButtonContent:
              '<i class="nb-checkmark" title="' +
              this.translate.instant('admision.tooltip_guargar') +
              '"></i>',
            cancelButtonContent:
              '<i class="nb-close" title="' +
              this.translate.instant('admision.tooltip_cancelar') +
              '"></i>',
          },
        }
      } else {
        this.dataSubcriterios.push({});
      }
      this.calcularPorcentaje();
    }
  }

  onEditSubcriterio($event: any) {
    this.porcentajeSubcriterioTable = true
    if ($event.data.Porcentaje == '') {
      $event.data.Porcentaje == 0;
    }
    this.calcularPorcentajeSubcriterio();
  }

  calcularPorcentaje() {
    this.porcentajeTotal = 0;
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.porcentajeTotal += +this.dataSource.data[i].Porcentaje;
    }
  }

  calcularPorcentajeSubcriterio() {
    console.log(this.dataSourceSubcriterio)
    this.porcentajeSubcriterioTotal = 0;
    for (let i = 0; i < this.dataSourceSubcriterio.data.length; i++) {
      this.porcentajeSubcriterioTotal += +this.dataSourceSubcriterio.data[i].Porcentaje;
    }
  }

  async guardarSubcriterio() {
    this.calcularPorcentajeSubcriterio();
    if (this.porcentajeSubcriterioTotal != 100) {
      this.popUpManager.showErrorToast(this.translate.instant('admision.porcentajeIncompleto'));
    } else {

      this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:'
        + this.proyectos_selected + ',PeriodoId:' + this.periodo.Id + ',Activo:true&limit=0')
        .subscribe((res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            if (res.length >= 1) {
              for (let j = 0; j < this.dataSource.data.length; j++) {

                for (let i = 0; i < res.length; i++) {
                  if (this.requisitoId == r[i].RequisitoId.Id) {
                    const requisitoPut = r[i];
                    // for recorrer subcriterios
                    // let PorcentajeEspecifico = [];
                    const objectConcat = [{}];
                    for (let i = 0; i < this.dataSubcriterios.length; i++) {
                      // PorcentajeEspecifico.push({
                      //   Subcriterio: this.dataSubcriterios[i].Criterio,
                      //   Porcentaje: this.dataSubcriterios[i].Porcentaje,
                      //   Abreviación: ""
                      // });
                      const object: any = {};
                      object['Id'] = this.dataSubcriterios[i].Id
                      object['Nombre'] = this.dataSubcriterios[i].Criterio
                      object['Porcentaje'] = this.dataSubcriterios[i].Porcentaje;
                      object['Abreviación'] = this.dataSubcriterios[i].CodigoAbreviacion;

                      objectConcat[i] = object;
                    }
                    this.areas = {};
                    this.areas.areas = objectConcat;
                    requisitoPut.PorcentajeEspecifico = JSON.stringify(this.areas);

                    this.requisitoPut(requisitoPut);

                    break;
                  }
                }
              }
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.programa_academico'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  async guardar() {
    this.calcularPorcentaje();
    if (this.porcentajeTotal != 100) {
      this.popUpManager.showErrorToast(this.translate.instant('admision.porcentajeIncompleto'));
    } else {

      if (this.proyectos_selected){

        this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' +
        this.proyectos_selected + ',PeriodoId:' + this.periodo.Id + ',Activo:true&limit=0')
        .subscribe((res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            if (res.length > 1) {
              for (let j = 0; j < this.dataSource.data.length; j++) {
                let existe = false;

                for (let i = 0; i < r.length; i++) {
                  if (this.dataSource.data[j].Id == r[i].RequisitoId.Id) {
                    var requisitoPut = r[i];
                    requisitoPut.PorcentajeGeneral = +this.dataSource.data[j].Porcentaje;
                    existe = true;
                    break;
                  }
                }

                if (!existe) {
                  // post
                  this.requisitoPost(j);
                } else {
                  // put
                  this.requisitoPut(requisitoPut);
                }

              }
            } else {

              for (let i = 0; i < this.dataSource.data.length; i++) {
                this.requisitoPost(i);
              }
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.programa_academico'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });

      }else if (this.facultades && this.facultades.length > 0){
        console.log("No hay proyecto seleccionado", this.facultades)
        console.log(this.proyectosFilteredFacultad)

        forEach(this.proyectosFilteredFacultad, (proyecto: any) => {
          this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' +
          proyecto.Id + ',PeriodoId:' + this.periodo.Id + ',Activo:true&limit=0')
          .subscribe((res: any) => {
            this.proyectos_selected = proyecto.Id;
            const r = <any>res;
            if (res !== null && r.Type !== 'error') {
              if (res.length > 1) {
                for (let j = 0; j < this.dataSource.data.length; j++) {
                  let existe = false;
  
                  for (let i = 0; i < r.length; i++) {
                    if (this.dataSource.data[j].Id == r[i].RequisitoId.Id) {
                      var requisitoPut = r[i];
                      requisitoPut.PorcentajeGeneral = +this.dataSource.data[j].Porcentaje;
                      existe = true;
                      break;
                    }
                  }
  
                  if (!existe) {
                    // post
                    this.requisitoPost(j);
                  } else {
                    // put
                    this.requisitoPut(requisitoPut);
                  }
  
                }
              } else {
  
                for (let i = 0; i < this.dataSource.data.length; i++) {
                  this.requisitoPost(i);
                }
              }
            }
          },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.programa_academico'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        })
      }
    }
  }

  private requisitoPost(i: number) {
    const requisitoPost: any = {};
    requisitoPost.Id = 0;
    requisitoPost.ProgramaAcademicoId = this.proyectos_selected;
    requisitoPost.PeriodoId = this.periodo.Id;
    requisitoPost.PorcentajeGeneral = +this.dataSource.data[i].Porcentaje;
    requisitoPost.RequisitoId = { 'Id': this.dataSource.data[i].Id };
    requisitoPost.Activo = true;
    requisitoPost.PorcentajeEspecifico = '{}';
    requisitoPost.OfertarOpcion2 = this.ofertarOpcion2.value.opcion;
    requisitoPost.OfertarOpcion3 = this.ofertarOpcion3.value.opcion;
    requisitoPost.PuntajeMinimoExamenEstado = Number(this.valorMinimo);

    console.log("ACAAAAAAAAAAAAAAAAAAA",requisitoPost)

    this.evaluacionService.post('requisito_programa_academico', requisitoPost)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
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

  private requisitoPut(requisitoPut: any) {
    this.evaluacionService.put('requisito_programa_academico', requisitoPut)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
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

  cargarRequisito(Id: number) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito/' + Id)
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            // this.requisitoPost.RequisitoId = res;
            resolve(res);
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  loadColumn() {
    return new Promise((resolve) => {
      const data: any = this.data;

      data[0].Criterio = {
        title: this.translate.instant('admision.criterio'),
        editable: false,
        filter: false,
        width: '55%',
        valuePrepareFunction: (value: any) => {
          return value;
        },
      }
      data[0].Porcentaje = {
        title: this.translate.instant('admision.porcentaje'),
        editable: true,
        filter: false,
        valuePrepareFunction: (value: any) => {
          return value;
        },
      }
      resolve(data)
    });
  }

}
