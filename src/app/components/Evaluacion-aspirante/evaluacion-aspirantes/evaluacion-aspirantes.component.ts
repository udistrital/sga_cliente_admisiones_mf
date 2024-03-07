import { Component, OnInit, ViewChild } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from 'src/app/services/users.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { TercerosService } from 'src/app/services/terceros.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoCriterio } from '../../../models/admision/tipo_criterio';
// import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { FormControl, Validators } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { CheckboxAssistanceComponent } from './checkbox-assistance/checkbox-assistance.component';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { AnyService } from 'src/app/services/any.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'evaluacion-aspirantes',
  templateUrl: './evaluacion-aspirantes.component.html',
  styleUrls: ['./evaluacion-aspirantes.component.scss'],
})
export class EvaluacionAspirantesComponent implements OnInit {
  toasterService: any;

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info = [];
  percentage_tab_expe = [];
  percentage_tab_acad = [];
  proyectos: any;
  criterios: any;
  periodos: any = [];
  show_icfes = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;
  Aspirantes: any;

  notas: boolean;
  save: boolean;
  asistencia!: boolean;
  info_persona!: boolean;
  loading!: boolean;
  ultimo_select!: number;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected!: any;
  criterio_selected!: any[];
  showTab: any;
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  btnCalculo: boolean = true;
  periodo: any;
  nivel_load: any;
  selectednivel: any;
  tipo_criterio!: TipoCriterio;
  dataSourceColumn :any = []
  nameColumns: any
  dataSource!: MatTableDataSource<any>;
  datasourceButtonsTable: boolean = false
  settings: any;
  columnas: any;
  criterio = [];
  cantidad_aspirantes: number = 0;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private evaluacionService: EvaluacionInscripcionService,
    private tercerosService: TercerosService,
    private sgaMidService: SgaMidService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private popUpManager: PopUpManager,

    private autenticationService: ImplicitAutenticationService,) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.total = true;
    this.save = true;
    this.notas = false;
    this.showTab = true;
    // this.dataSource = new LocalDataSource();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }


  async activateTab() {
    this.showTab = true;
    await this.loadCriterios();
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

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

  changePeriodo() {
    this.CampoControl.setValue('');
    this.Campo1Control.setValue('');
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
    this.notas = false;
    this.selectprograma = false;
    this.criterio_selected = [];
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
                this.sgaMidService.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
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
          this.loading = false;
        },
      );
    }
  }

  loadCriterios() {
    this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' + this.proyectos_selected + ',PeriodoId:' + this.periodo.Id).subscribe(
      (response: any) => {
        if (response[0].Id !== undefined && response[0] !== '{}') {
          this.criterios = <any>response;
          this.criterios = this.criterios.filter((e: any) => e.PorcentajeGeneral !== 0);
          // this.btnCalculo = true;
          this.btnCalculo = false;
          this.selectcriterio = false;
          this.notas = false;
          this.criterio_selected = [];
          this.criterios.forEach(async (element: any) => {
            await this.criterio_selected.push(element.RequisitoId)
            // await this.loadInfo(element.RequisitoId.Id);
          });
          this.viewtab();
        } else {
          const Criterios = [];
          Criterios[0] = {
            RequisitoId: {
              Id: 0,
              Nombre: '',
            },
          };
          this.criterios = <any>Criterios;
          this.criterio_selected = [];
          this.notas = false;
          this.popUpManager.showToast('info', this.translate.instant('admision.no_criterio'),);
          // this.popUpManager.showToast('info', this.translate.instant('admision.no_criterio'), this.translate.instant('GLOBAL.info'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      },
    );
  }

  createTable() {
    return new Promise(async (resolve, reject) => {
      const IdCriterio = sessionStorage.getItem('tipo_criterio');
      const data:any = await this.loadColumn(IdCriterio)
      console.log(IdCriterio)
      console.log(data)
      const keys = Object.keys(data!);
      const titles = keys.map(key => data[key].title);
      console.log(titles)
      this.columnas = titles
      this.columnas = titles
   
      this.dataSourceColumn = (titles)
      this.dataSourceColumn.push('acciones')
      console.log(this.dataSourceColumn)

      this.settings = {
        columns: data,
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
            '<i class="nb-edit" title="' + this.translate.instant('GLOBAL.tooltip_editar_registro') +
            '"></i>',
          saveButtonContent:
            '<i class="nb-checkmark-circle" title="' + this.translate.instant('admision.tooltip_guargar') +
            '"></i>',
          cancelButtonContent:
            '<i class="nb-close-circled" title="' + this.translate.instant('admision.tooltip_cancelar') +
            '"></i>',
          confirmSave: true,
        },
      };
      resolve(this.settings)
    })
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  onEditConfirm(event: any) {
    console.log(event)
    this.guardarEvaluacion(event.newData).then(() => event.confirm.resolve(event.newData))
  }

  devolverdatasourceButtonsTable() {
    this.datasourceButtonsTable = false
  }

  async guardarEvaluacion(datos: any) {
    return new Promise((resolve, reject) => {
      const Evaluacion: any = {};

      Evaluacion.Aspirantes = [datos]
      Evaluacion.PeriodoId = this.periodo.Id;
      Evaluacion.ProgramaId = this.proyectos_selected;
      Evaluacion.CriterioId = sessionStorage.getItem('tipo_criterio');
      const aux = Evaluacion.Aspirantes;
      // Bandera para campos vacios
      let vacio = false;
      // Bandera para solo numeros/rango 0-100
      let numero = false;
      const regex = /^[0-9]*$/;
      for (let i = 0; i < aux.length; i++) {
        if (aux[i]['Asistencia'] === 's' || aux[i]['Asistencia'] === 'si' || aux[i]['Asistencia'] === 'sí' ||
          aux[i]['Asistencia'] === 'S' || aux[i]['Asistencia'] === 'SI' || aux[i]['Asistencia'] === 'SÍ' ||
          aux[i]['Asistencia'] === 'true' || aux[i]['Asistencia'] === 'True' || aux[i]['Asistencia'] === 'TRUE') {
          aux[i]['Asistencia'] = true;
        } else {
          aux[i]['Asistencia'] = ''
        }
        for (let j = 0; j < this.columnas.length; j++) {
          if (aux[i][this.columnas[j]] === undefined || aux[i][this.columnas[j]] === '') {
            vacio = true;
            break;
          } else {
            if (regex.test(aux[i][this.columnas[j]]) === true) {
              const auxNumero = parseInt(aux[i][this.columnas[j]], 10)
              if (auxNumero >= 0 && auxNumero <= 100) {
              } else {
                numero = true;
                break;
              }
            } else {
              numero = true;
              break;
            }
          }
        }
      }

      // Validaciones
      if (vacio === true) {
        this.popUpManager.showToast('info', this.translate.instant('admision.vacio'));
        // this.popUpManager.showToast('info', this.translate.instant('admision.vacio'), this.translate.instant('GLOBAL.info'));
      } else if (numero === true) {
        this.popUpManager.showToast('info', this.translate.instant('admision.vacio'));
        // this.popUpManager.showToast('info', this.translate.instant('admision.numero'), this.translate.instant('GLOBAL.info'));
      } else {
        this.sgaMidService.post('admision/registrar_evaluacion', Evaluacion).subscribe(
          (response: any) => {
            if (response.Response.Code === '200') {
              this.criterio_selected.forEach(criterio => {
                if (criterio.Id === Evaluacion.CriterioId) {
                  criterio['evaluado'] = true;
                }
              })
              this.loadInfo(parseInt(Evaluacion.CriterioId, 10));
              resolve('')
              this.popUpManager.showToast('success', this.translate.instant('admision.registro_exito'));
              // this.popUpManager.showToast('success', this.translate.instant('admision.registro_exito'), this.translate.instant('GLOBAL.operacion_exitosa'));
              // this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
            } else {
              reject()
              this.popUpManager.showErrorToast(this.translate.instant('admision.registro_error'));
            }
          },
          error => {
            reject()
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          },
        );
      }
    });
  }

  async calcularEvaluacion() {
    const Evaluacion: any = {};
    Evaluacion.IdPersona = <Array<any>>[];
    Evaluacion.IdPeriodo = this.periodo.Id;
    Evaluacion.IdPrograma = this.proyectos_selected;
    this.ngOnChanges();
    await this.loadAspirantes();
    await this.loadInfo(this.criterios[0].RequisitoId.Id);
    for (let i = 0; i < this.Aspirantes.length; i++) {
      Evaluacion.IdPersona[i] = { 'Id': this.Aspirantes[i].Id };
    }

    this.sgaMidService.put('admision/calcular_nota', Evaluacion).subscribe(
      (response: any) => {

        if (response.Response.Code === '200') {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.calculo_exito'));
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('admision.calculo_error'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      },
    );
  }

  verificarEvaluacion() {
    let evaluado = true;
    this.criterio_selected.forEach(criterio => {
      if (!criterio.evaluado) {
        evaluado = false;
      }
    })

    if (evaluado) {
      this.btnCalculo = false;
    }
  }

  async perfil_editar(event: any) {
    this.loading = true;
    this.save = true;
    this.tipo_criterio = new TipoCriterio();
    this.tipo_criterio.Periodo = this.periodo.Nombre;
    let proyecto;
    for (let i = 0; i < this.proyectos.length; i++) {
      if (this.proyectos_selected === this.proyectos[i].Id) {
        proyecto = this.proyectos[i].Nombre;
      }
    }
    this.tipo_criterio.ProgramaAcademico = proyecto;
    this.tipo_criterio.Nombre = event.Nombre;
    sessionStorage.setItem('tipo_criterio', String(event.Id));
    await this.ngOnChanges();
    await this.createTable()
    this.showTab = false;
    await this.loadAspirantes().catch(e => this.loading = false);
    await this.loadInfo(event.Id);
    this.loading = false;
  }

  async loadAspirantes() {
    return new Promise((resolve, reject) => {
      console.log(this.nivel_load)
      console.log('admision/getlistaaspirantespor?id_periodo=' + this.periodo.Id + '&id_proyecto=' + this.proyectos_selected + '&tipo_lista=2')
      this.sgaMidService.get('admision/getlistaaspirantespor?id_periodo=' + this.periodo.Id + '&id_proyecto=' + this.proyectos_selected + '&tipo_lista=2')
        .subscribe(
          (response: any) => {
            console.log(response)
            if (response.Success && response.Status == "200") {
              this.Aspirantes = response.Data;
              this.cantidad_aspirantes = this.Aspirantes.length;
              console.log(this.Aspirantes)
              this.dataSource = new MatTableDataSource(this.Aspirantes);
              setTimeout(() => {
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }, 300);

              resolve(this.Aspirantes)
            }
          },
          (error: HttpErrorResponse) => {
            reject(error)
            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('admision.titulo_no_aspirantes'),
              text: this.translate.instant('admision.error_no_aspirantes'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        );

      /* this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:5,ProgramaAcademicoId:' +
        this.proyectos_selected + ',PeriodoId:' + this.periodo.Id + '&sortby=Id&order=asc').subscribe(
          (response: any) => {
            if (Object.keys(response[0]).length !== 0) {
              const data = <Array<any>>response.filter((inscripcion) => (inscripcion.PersonaId !== undefined));

              data.forEach(element => {
                this.tercerosService.get('tercero/' + element.PersonaId).subscribe(
                  async (res: any) => {
                    const aspiranteAux = {
                      Id: res.Id,
                      Aspirantes: res.NombreCompleto,
                    };
                    this.Aspirantes.push(aspiranteAux);

                    if (data.length === this.Aspirantes.length) {
                      this.dataSource.load(this.Aspirantes);
                      resolve(this.Aspirantes);
                    }
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));

                  },
                );
              });

            } else {
              reject('Error');
              Swal.fire({
                icon: 'warning',
                title: this.translate.instant('admision.titulo_no_aspirantes'),
                text: this.translate.instant('admision.error_no_aspirantes'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          },
          error => {
            reject(error);
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          },
        ); */
    });

  }

  async loadInfo(IdCriterio: number) {
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('admision/consultar_evaluacion/' + this.proyectos_selected + '/' + this.periodo.Id + '/' + IdCriterio).subscribe(
        async (response: any) => {
          if (response.Response.Code === '200') {
            const data = <Array<any>>response.Response.Body[0].areas;
            if (data !== undefined) {
              await data.forEach(async asistente => {
                if (asistente['Asistencia'] === '') {
                  asistente['Asistencia'] = false
                }

                this.Aspirantes.forEach((aspirante: any) => {
                  if (asistente.Aspirantes === aspirante.Aspirantes) {
                    for (const columna in asistente) {
                      aspirante[columna] = asistente[columna]
                    }
                  }
                })
                //  [this, this.dataSource.load(this.Aspirantes)]
              })

            } else {
              this.btnCalculo = true;
            }
            this.save = false;
            this.verificarEvaluacion();
            resolve(data);
          } else if (response.Response.Code === '404') {
            this.Aspirantes.forEach((aspirante: any) => {
              this.columnas.forEach((columna: any) => {
                aspirante[columna] = '';
                if (columna === 'Asistencia') {
                  aspirante[columna] = false;
                }
              });
            })
            // this.dataSource.load(this.Aspirantes);
            this.dataSource = new MatTableDataSource(this.Aspirantes)
            this.btnCalculo = true;
            resolve(response);
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            // this.dataSource.load([]);
            this.dataSource = new MatTableDataSource()
            resolve('error');
          }
        },
        (error: any) => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  itemSelect(event: any): void {
    this.datasourceButtonsTable = true
    if (this.asistencia !== undefined) {
      event.data.Asistencia = this.asistencia;
    }
  }

  loadColumn(IdCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito?query=RequisitoPadreId:' + IdCriterio + '&limit=0').subscribe(
        (response: any) => {
          this.evaluacionService.get('requisito/' + IdCriterio).subscribe(
            async (res: any) => {
              const data: any = {};
              let porcentaje: any;

              // Columna de aspirantes
              data.Aspirantes = {
                title: this.translate.instant('admision.aspirante'),
                editable: false,
                filter: false,
                sort: true,
                sortDirection: 'asc',
                width: '55%',
                valuePrepareFunction: (value: any) => {
                  return value;
                },
              };

              // Columna de asistencia si lo requiere
              if (res.Asistencia === true) {
                data.Asistencia = {
                  title: this.translate.instant('admision.asistencia'),
                  editable: true,
                  filter: false,
                  width: '4%',
                  type: 'custom',
                  renderComponent: CheckboxAssistanceComponent,
                  onComponentInitFunction: (instance: any) => {
                    instance.save.subscribe((data: any) => {
                      // sessionStorage.setItem('EstadoInscripcion', data);
                      this.asistencia = data;
                      if (data === '') {
                        this.asistencia = false;
                      }
                    });
                  },
                };
              }

              if (response.length > 1) {
                porcentaje = await this.getPercentageSub(IdCriterio)

                for (const key in porcentaje.areas) {
                  if (porcentaje.areas[key]['Porcentaje'] === 0) {
                    break;
                  }
                  for (const key2 in porcentaje.areas[key]) {
                    for (let i = 0; i < response.length; i++) {
                      if (porcentaje.areas[key][key2] == response[i].Nombre) {
                        this.columnas.push(response[i].Nombre);
                        data[response[i].Nombre] = {
                          title: response[i].Nombre + ' (' + porcentaje.areas[key].Porcentaje + '%)',
                          editable: true,
                          filter: false,
                          valuePrepareFunction: (value: any) => {
                            return value;
                          },
                        };
                        break;
                      }
                    }
                  }
                }

              } else {
                this.columnas.push('Puntuacion');
                data.Puntuacion = {
                  title: 'Puntaje',
                  editable: true,
                  type: 'number',
                  filter: false,
                  width: '35%',
                  valuePrepareFunction: (value: any) => {
                    return value;
                  },
                }
              }
              resolve(data);
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
              reject(error);
            },
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          reject(error);
        },
      );

    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.columnas = [];
    // this.dataSource.load([]);
    this.dataSource = new MatTableDataSource()
    this.Aspirantes = [];
    for (let i = 0; i < this.Aspirantes.length; i++) {
      this.Aspirantes[i].Asistencia = false;
    }
  }

  getPercentageSub(IdCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' +
        this.proyectos_selected + ',PeriodoId:' + this.periodo.Id + ',RequisitoId:' + IdCriterio).subscribe(
          (Res: any) => {
            const porcentaje = JSON.parse(Res[0].PorcentajeEspecifico);
            resolve(porcentaje);
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
            reject(error);
          },
        );
    });
  }

  ajustarTitulo(titulo: string) {
    if (titulo === titulo.toUpperCase()) {
      return titulo
    }
    return titulo.toLowerCase()
  }

  async viewtab() {
    if (this.criterio_selected.length === 0) {
      this.notas = false;
    } else {
      this.notas = true;
      this.verificarEvaluacion()
    }
  }

}
