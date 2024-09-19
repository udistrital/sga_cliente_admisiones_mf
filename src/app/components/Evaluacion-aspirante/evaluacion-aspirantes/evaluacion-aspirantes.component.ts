import { Component, OnInit, ViewChild } from "@angular/core";
import { Input, Output, EventEmitter } from "@angular/core";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { UserService } from "src/app/services/users.service";
import { ProyectoAcademicoService } from "src/app/services/proyecto_academico.service";
import { ParametrosService } from "src/app/services/parametros.service";
import { EvaluacionInscripcionService } from "src/app/services/evaluacion_inscripcion.service";
import { Inscripcion } from "src/app/models/inscripcion/inscripcion";
import { TercerosService } from "src/app/services/terceros.service";
import { SgaMidService } from "src/app/services/sga_mid.service";
import { SgaAdmisionesMid } from "src/app/services/sga_admisiones_mid.service";
import { HttpErrorResponse } from "@angular/common/http";
import { TipoCriterio } from "../../../models/admision/tipo_criterio";
// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2";
import { FormControl, Validators } from "@angular/forms";
import { PopUpManager } from "../../../managers/popUpManager";
import { CheckboxAssistanceComponent } from "./checkbox-assistance/checkbox-assistance.component";
import { ImplicitAutenticationService } from "src/app/services/implicit_autentication.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { CalendarioMidService } from "src/app/services/calendario_mid.service";
import { EventosService } from "src/app/services/eventos.service";

@Component({
  selector: "evaluacion-aspirantes",
  templateUrl: "./evaluacion-aspirantes.component.html",
  styleUrls: ["./evaluacion-aspirantes.component.scss"],
})
export class EvaluacionAspirantesComponent implements OnInit {
  toasterService: any;

  @Input("criterios_select")
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === "0") {
      this.selectedValue = undefined;
      window.localStorage.setItem("programa", this.selectedValue);
    }
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== "" &&
      this.inscripcion_id.toString() !== "0"
    ) {
    }
  }

  @Output() eventChange = new EventEmitter();

  @Output("result") result: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  inscripcion_id!: number;
  info_persona_id!: string | null;
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

  notas!: boolean;
  save!: boolean;
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
  dataSourceColumn: any = [];
  nameColumns: string[] = [];
  dataSource!: MatTableDataSource<any>;
  datavalor: any = [];
  datasourceButtonsTable: boolean = false;
  settings: any;
  columnas: any;
  widhtColumns: any;
  criterio = [];
  cantidad_aspirantes: number = 0;
  selectMultipleNivel: boolean = false;
  mostrarBoton = false;
  mostrarMensajeInicial = false;
  periodoMultiple: any;
  nombresPeriodos: string = "";

  CampoControl = new FormControl("", [Validators.required]);
  Campo1Control = new FormControl("", [Validators.required]);
  Campo2Control = new FormControl("", [Validators.required]);

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private evaluacionService: EvaluacionInscripcionService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private popUpManager: PopUpManager,
    private calendarioMidService: CalendarioMidService,
    private eventosService: EventosService,

    private autenticationService: ImplicitAutenticationService
  ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  async ngOnInit() {
    this.total = true;
    this.save = true;
    this.notas = false;
    this.showTab = true;
    await this.loadData();
    await this.createTable();
  }

  async activateTab() {
    this.showTab = true;
    await this.loadCriterios();
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: error.status + "",
        text: this.translate.instant("inscripcion.error_cargar_informacion"),
        confirmButtonText: this.translate.instant("GLOBAL.aceptar"),
      });
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get("periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0")
        .subscribe(
          (res: any) => {
            const r = <any>res;
            if (res !== null && r.Status === "200") {
              if (window.localStorage.getItem("IdPeriodoSelected")) {
                this.periodo = res.Data.find(
                  (p: any) =>
                    p.Id == window.localStorage.getItem("IdPeriodoSelected")
                );
              } else {
                this.periodo = res.Data.find((p: any) => p.Activo);
              }

              window.localStorage.setItem(
                "IdPeriodo",
                String(this.periodo["Id"])
              );
              resolve(this.periodo);
              const periodos = <any[]>res["Data"];
              periodos.forEach((element: any) => {
                this.periodos.push(element);
              });
            }
            window.localStorage.removeItem("IdPeriodoSelected");
          },
          (error: HttpErrorResponse) => {
            reject(error);
          }
        );
    });
  }

  buttonedit(row: any): void {
    row.mostrarBotones = !row.mostrarBotones;
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  changePeriodo() {
    this.CampoControl.setValue("");
    this.Campo1Control.setValue("");
  }

  async loadLevel() {
    const nivel: any = await this.recuperarNivelFormacion();
    this.nivel_load = nivel;
    if (window.localStorage.getItem("Nivel")) {
      this.selectednivel = this.nivel_load.find(
        (p: any) => p.Id == window.localStorage.getItem("Nivel")
      ).Id;
      await this.loadProyectos();
      window.localStorage.removeItem("Nivel");
    }
  }

  recuperarNivelFormacion() {
    return new Promise((resolve, reject) => {
      this.projectService.get("nivel_formacion?limit=0")
        .subscribe((response: any) => {
          if (response !== null || response !== undefined) {
            resolve(response);
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  filtrarProyecto(proyecto: any) {
    if (this.selectednivel === proyecto["NivelFormacionId"]["Id"]) {
      return true;
    }
    if (proyecto["NivelFormacionId"]["NivelFormacionPadreId"] !== null) {
      if (
        proyecto["NivelFormacionId"]["NivelFormacionPadreId"]["Id"] ===
        this.selectednivel
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async cambiarSelectPeriodoSegunNivel(nivelSeleccionado: any) {
    const nivelDoctorado = this.nivel_load.find(
      (nivel: any) => nivel.Nombre === "Doctorado"
    );
    if (nivelDoctorado) {
      const esDoctorado = nivelDoctorado.Id === nivelSeleccionado;
      this.selectMultipleNivel = esDoctorado;
      this.mostrarBoton = esDoctorado;
      this.mostrarMensajeInicial = esDoctorado;
    } else {
      this.selectMultipleNivel = false;
      this.mostrarBoton = false;
      this.mostrarMensajeInicial = false;
    }
    await this.loadProyectos();
  }

  consultarPeriodosDoctorado(idProyecto: number) {
    this.calendarioMidService
      .get(`calendario-proyecto/${idProyecto}`)
      .subscribe(
        (response: any) => {
          const CalendarioId = response.Data.CalendarioId;
          this.eventosService.get(`calendario/${CalendarioId}`).subscribe(
            (response2: any) => {
              const listaPeriodos: number[] = JSON.parse(
                response2.MultiplePeriodoId
              );
              listaPeriodos.forEach((periodoId) => {
                this.parametrosService
                  .get(`periodo/${periodoId}`)
                  .subscribe((response3: any) => {
                    this.nombresPeriodos =
                      this.nombresPeriodos + response3.Data.Nombre + ", ";
                  });
              });
            },
            (error: any) => {
              this.popUpManager.showErrorAlert(
                this.translate.instant("calendario.sin_calendario") +
                  ". " +
                  this.translate.instant("GLOBAL.comunicar_OAS_error")
              );
            }
          );
        },
        (error: any) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant("calendario.sin_calendario") +
              ". " +
              this.translate.instant("GLOBAL.comunicar_OAS_error")
          );
        }
      );
  }

  async loadProyectos() {
    this.notas = false;
    this.selectprograma = false;
    this.criterio_selected = [];
    if (!Number.isNaN(this.selectednivel)) {
      const proyectoAcademico: any = await this.recuperarProyectoAcademicoInstitucion();
      const rol: any = await this.autenticationService.getRole()
      let r = rol.find((role: any) => role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE");
      if (r) {
        this.proyectos = <any[]>(proyectoAcademico.filter((proyecto: any) => this.filtrarProyecto(proyecto)));
        if (window.localStorage.getItem("IdProyecto")) {
          const idProyecto = window.localStorage.getItem("IdProyecto");
          const proyecto = this.proyectos.find((p: any) => p.Id == idProyecto);
          if (proyecto) {
            this.proyectos_selected = proyecto.Id;
            await this.loadCriterios();
          }
        }
        window.localStorage.removeItem("IdProyecto");
      } else {
        const id_tercero = await this.userService.getPersonaId();
        const dependencia: any = await this.recuperarDependenciaVinculacionTercero(id_tercero);
        console.log(dependencia);
        const dependencias = <Number[]>(dependencia.Data.DependenciaId);
        this.proyectos = <any[]>(proyectoAcademico.filter((proyecto: any) => dependencias.includes(proyecto.Id)));
        if (dependencias.length > 1) {
          this.popUpManager.showAlert(this.translate.instant("GLOBAL.info"), this.translate.instant("admision.multiple_vinculacion"));
        }
      }
    }
  }

  recuperarProyectoAcademicoInstitucion() {
    return new Promise((resolve, reject) => {
      this.projectService.get("proyecto_academico_institucion?limit=0")
        .subscribe((response: any) => {
          if (response !== null || response !== undefined) {
            resolve(response);
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  recuperarDependenciaVinculacionTercero(id_tercero: any) {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get("admision/dependencia_vinculacion_tercero/" + id_tercero)
        .subscribe((response: any) => {
          resolve(response);
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant("admision.no_vinculacion_no_rol") + ". " + this.translate.instant("GLOBAL.comunicar_OAS_error"));
            this.loading = false;
            reject([]);
          });
    });
  }

  async loadCriterios() {
    const requisitoPrograma: any = await this.recuperarRequisitoProgramaAcademico(this.proyectos_selected, this.periodo.Id);
    if (requisitoPrograma[0].Id !== undefined && requisitoPrograma[0] !== "{}") {
      this.criterios = <any>requisitoPrograma;
      this.criterios = this.criterios.filter((e: any) => e.PorcentajeGeneral !== 0);
      this.btnCalculo = false;
      this.selectcriterio = false;
      this.notas = false;
      this.criterio_selected = [];
    
      for (const element of this.criterios) {
        this.criterio_selected.push(element.RequisitoId);
      }

      this.viewtab();
    } else {
      const Criterios = [];
      Criterios[0] = {
        RequisitoId: {
          Id: 0,
          Nombre: "",
        },
      };
      this.criterios = <any>Criterios;
      this.criterio_selected = [];
      this.notas = false;
      this.popUpManager.showToast("info", this.translate.instant("admision.no_criterio"));
    }
  }

  recuperarRequisitoProgramaAcademico(programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get("requisito_programa_academico?query=ProgramaAcademicoId:" + programaId + ",PeriodoId:" + periodoId)
        .subscribe((response: any) => {
          resolve(response);
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(this.translate.instant("admision.error_cargar"));
            this.loading = false;
            reject([]);
          });
    });
  }

  async createTable() {
    const IdCriterio = sessionStorage.getItem("tipo_criterio");
    console.log(IdCriterio);
    const data: any = await this.loadColumn(IdCriterio);
    const keys = Object.keys(data!);
    const titles = keys.map((key) => data[key].title);
    const width = keys.map((key) => data[key].width);

    this.columnas = titles;
    this.widhtColumns = width;
    this.dataSourceColumn = titles;
    this.dataSourceColumn.push("acciones");
    return this.settings;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  onEditConfirm(event: any) {
    this.guardarEvaluacion(event.newData);
  }

  devolverdatasourceButtonsTable() {
    this.datasourceButtonsTable = !this.datasourceButtonsTable;
  }

  async guardarEvaluacion(datos: any) {
    return new Promise((resolve, reject) => {
      const Evaluacion: any = {};
      // Evaluacion.Aspirantes = this.Aspirantes;
      // await this.dataSource.getElements().then(datos => Evaluacion.Aspirantes = datos)
      // Evaluacion.Aspirantes = this.dataSource.data;
      Evaluacion.Aspirantes = [datos];
      Evaluacion.PeriodoId = this.periodo.Id;
      Evaluacion.ProgramaId = this.proyectos_selected;
      Evaluacion.CriterioId = sessionStorage.getItem("tipo_criterio");
      const aux = Evaluacion.Aspirantes;
      // Bandera para campos vacios
      let vacio = false;
      // Bandera para solo numeros/rango 0-100
      let numero = false;
      const regex = /^[0-9]*$/;
      for (let i = 0; i < aux.length; i++) {
        if (
          aux[i]["Asistencia"] === "s" ||
          aux[i]["Asistencia"] === "si" ||
          aux[i]["Asistencia"] === "sí" ||
          aux[i]["Asistencia"] === "S" ||
          aux[i]["Asistencia"] === "SI" ||
          aux[i]["Asistencia"] === "SÍ" ||
          aux[i]["Asistencia"] === "true" ||
          aux[i]["Asistencia"] === "True" ||
          aux[i]["Asistencia"] === "TRUE"
        ) {
          aux[i]["Asistencia"] = true;
        } else {
          aux[i]["Asistencia"] = "";
        }
        for (let j = 0; j < this.columnas.length; j++) {
          if (
            aux[i][this.columnas[j]] === undefined ||
            aux[i][this.columnas[j]] === ""
          ) {
            vacio = true;
            break;
          } else {
            if (regex.test(aux[i][this.columnas[j]]) === true) {
              const auxNumero = parseInt(aux[i][this.columnas[j]], 10);
              if (auxNumero >= 0 && auxNumero <= 100) {
              } else {
                numero = true;
                break;
              }
            } else {
              numero = false;
              break;
            }
          }
        }
      }

      // Validaciones
      if (vacio === true) {
        this.popUpManager.showToast(this.translate.instant("admision.vacio"));
      } else if (numero === true) {
        this.popUpManager.showToast(this.translate.instant("admision.numero"));
      } else {
        this.sgaMidAdmisiones.post("admision/evaluacion", Evaluacion).subscribe(
          (response: any) => {
            if (response.status === 200) {
              this.criterio_selected.forEach((criterio) => {
                if (criterio.Id === Evaluacion.CriterioId) {
                  criterio["evaluado"] = true;
                }
              });
              this.loadInfo(parseInt(Evaluacion.CriterioId, 10));
              resolve("");
              this.popUpManager.showToast(
                this.translate.instant("admision.registro_exito")
              );
            } else {
              reject();
              this.popUpManager.showErrorToast(
                this.translate.instant("admision.registro_error")
              );
            }
          },
          (error) => {
            reject();
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error_cargar")
            );
          }
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
      Evaluacion.IdPersona[i] = { Id: this.Aspirantes[i].Id };
    }

    this.sgaMidAdmisiones.put("admision/calcular_nota", Evaluacion).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.popUpManager.showSuccessAlert(
            this.translate.instant("admision.calculo_exito")
          );
        } else {
          this.popUpManager.showErrorToast(
            this.translate.instant("admision.calculo_error")
          );
        }
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("admision.error_cargar")
        );
      }
    );
  }

  verificarEvaluacion() {
    let evaluado = true;
    this.criterio_selected.forEach((criterio) => {
      if (!criterio.evaluado) {
        evaluado = false;
      }
    });

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
    sessionStorage.setItem("tipo_criterio", String(event.Id));
    this.ngOnChanges();
    await this.createTable();
    this.showTab = false;
    await this.loadAspirantes().catch((e) => (this.loading = false));
    await this.loadInfo(event.Id);
    this.loading = false;
  }

  async loadAspirantes() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get("admision/aspirantespor?id_periodo=" + this.periodo.Id + "&id_proyecto=" + this.proyectos_selected + "&tipo_lista=2")
        .subscribe((response: any) => {
            if (response.success == true && response.status == 200) {
              this.Aspirantes = response.data;
              this.cantidad_aspirantes = this.Aspirantes.length;

              // Agrega claves con el nombre de las columnas a cada aspirante
              this.Aspirantes.forEach((aspirante: any) => {
                this.datavalor.forEach((columna: any) => {
                  if (!aspirante.hasOwnProperty(columna)) {
                    aspirante[columna] = 0;
                  }
                });
              });

              setTimeout(() => {
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }, 300);

              this.dataSource = new MatTableDataSource(this.Aspirantes);

              resolve(this.Aspirantes);
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
            Swal.fire({
              icon: "warning",
              title: this.translate.instant("admision.titulo_no_aspirantes"),
              text: this.translate.instant("admision.error_no_aspirantes"),
              confirmButtonText: this.translate.instant("GLOBAL.aceptar"),
            });
          }
        );
    });
  }

  async loadInfo(IdCriterio: number) {
    this.datavalor = [];
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones
        .get(
          "admision/evaluacion/" +
            this.proyectos_selected +
            "/" +
            this.periodo.Id +
            "/" +
            IdCriterio
        )
        .subscribe(
          async (response: any) => {
            if (response.status === 200) {
              const data = <Array<any>>response.data.areas;
              if (data !== undefined) {
                await data.forEach(async (asistente) => {
                  if (asistente["Asistencia"] === "") {
                    asistente["Asistencia"] = false;
                  }
                  this.Aspirantes.forEach((aspirante: any) => {
                    if (asistente.Aspirantes === aspirante.Aspirantes) {
                      for (const columna in asistente) {
                        aspirante[columna] = asistente[columna];
                      }
                    }
                  });
                  //  [this, this.dataSource.load(this.Aspirantes)]
                  const valor = Object.keys(this.Aspirantes[0]);
                  const arreglo = valor.filter((elemento) => elemento !== "Id");
                  this.datavalor = arreglo;
                  this.dataSource = new MatTableDataSource(this.Aspirantes);
                });

                this.Aspirantes.forEach((item: any) => {
                  this.datavalor.forEach((column: any) => {
                    if (!item.hasOwnProperty(column)) {
                      item[column] = "";
                    }
                  });
                });

                const tieneAsistencia = this.columnas.some(
                  (item: any) => item === "Asistencia"
                );
                if (tieneAsistencia) {
                } else {
                  this.Aspirantes.forEach((item: any, index: any) => {
                    delete this.Aspirantes[index].Asistencia;
                  });
                }
                const valor = Object.keys(this.Aspirantes[0]);
                const arreglo = valor.filter((elemento) => elemento !== "Id");
                this.datavalor = arreglo;
                this.dataSource = new MatTableDataSource(this.Aspirantes);
              } else {
                this.btnCalculo = true;
              }
              this.save = false;
              this.verificarEvaluacion();
              resolve(data);
            } else if (response.status === 404) {
              this.Aspirantes.forEach((aspirante: any) => {
                this.columnas.forEach((columna: any) => {
                  aspirante[columna] = "";
                  if (columna === "Asistencia") {
                    aspirante[columna] = false;
                  }
                });
              });
              this.dataSource = new MatTableDataSource(this.Aspirantes);
              this.btnCalculo = true;
              resolve(response);
            } else {
              this.popUpManager.showErrorToast(
                this.translate.instant("admision.error")
              );
              this.dataSource = new MatTableDataSource<any>([]);
              resolve("error");
            }
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error")
            );
            reject(error);
          }
        );
    });
  }

  itemSelect(event: any): void {
    this.datasourceButtonsTable = true;
    if (this.asistencia !== undefined) {
      event.data.Asistencia = this.asistencia;
    }
  }

  async loadColumn(IdCriterio: any) {
    this.nameColumns = [];
    const requisitoPrincipal: any = await this.recuperarRequisitoByPadre(IdCriterio);
    for (let i = 0; i < requisitoPrincipal.length; i++) {
      this.nameColumns.push(requisitoPrincipal[i].Nombre);
    }
    const requisitoSecundario: any = await this.recuperarRequisito(IdCriterio);
    const data: any = {};
    let porcentaje: any;

    // Columna de aspirantes
    data.Aspirantes = {
      title: this.translate.instant("admision.aspirante"),
      editable: false,
      filter: false,
      sort: true,
      sortDirection: "asc",
      width: "55%",
      valuePrepareFunction: (value: any) => {
        return value;
      },
    };

    // Columna de asistencia si lo requiere
    if (requisitoSecundario.Asistencia === true) {
      data.Asistencia = {
        title: this.translate.instant("admision.asistencia"),
        editable: true,
        filter: false,
        width: "4%",
        type: "custom",
        renderComponent: CheckboxAssistanceComponent,
        onComponentInitFunction: (instance: any) => {
          instance.save.subscribe((data: any) => {
            // sessionStorage.setItem('EstadoInscripcion', data);
            this.asistencia = data;
            if (data === "") {
              this.asistencia = false;
            }
          });
        },
      };
    }

    if (requisitoPrincipal.length > 0) {
      const idPrograma = sessionStorage.getItem("IdProyecto");
      const programaBuscar = this.proyectos_selected ? this.proyectos_selected : idPrograma;
      console.log(this.proyectos_selected, idPrograma)
      porcentaje = await this.getPercentageSub(programaBuscar, this.periodo.Id, IdCriterio);

      for (const key in porcentaje.areas) {
        if (porcentaje.areas[key]["Porcentaje"] === 0) {
          break;
        }
        for (const key2 in porcentaje.areas[key]) {
          for (let i = 0; i < requisitoPrincipal.length; i++) {
            if (porcentaje.areas[key][key2] == requisitoPrincipal[i].Nombre) {
              this.columnas.push(requisitoPrincipal[i].Nombre);
              data[requisitoPrincipal[i].Nombre] = {
                title: requisitoPrincipal[i].Nombre + " (" + porcentaje.areas[key].Porcentaje + "%)",
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
      this.popUpManager.showInfoToast(this.translate.instant("admision.no_data"));
    }

    return data;
  }

  recuperarRequisitoByPadre(idCriterio: any) {
    console.log(idCriterio);
    return new Promise((resolve, reject) => {
      this.evaluacionService.get("requisito?query=RequisitoPadreId:" + idCriterio + "&limit=0")
        .subscribe((response: any) => {
          resolve(response);
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(this.translate.instant("admision.error_cargar"));
            this.loading = false;
            reject(error);
          });
    });
  }

  recuperarRequisito(idCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get("requisito/" + idCriterio)
        .subscribe((response: any) => {
          resolve(response);
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(this.translate.instant("admision.error_cargar"));
            this.loading = false;
            reject(error);
          });
    });
  }

  ngOnChanges() {
    this.columnas = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.Aspirantes = [];
    for (let i = 0; i < this.Aspirantes.length; i++) {
      this.Aspirantes[i].Asistencia = false;
    }
  }

  getPercentageSub(programaId: any, periodoId: any, IdCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get("requisito_programa_academico?query=ProgramaAcademicoId:" + programaId + ",PeriodoId:" + periodoId + ",RequisitoId:" + IdCriterio)
        .subscribe(
          (Res: any) => {
            const porcentaje = JSON.parse(Res[0].PorcentajeEspecifico);
            resolve(porcentaje);
          },
          (error) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error_cargar")
            );
            reject(error);
          }
        );
    });
  }

  ajustarTitulo(titulo: string) {
    if (titulo === titulo.toUpperCase()) {
      return titulo;
    }
    return titulo.toLowerCase();
  }

  async viewtab() {
    if (this.criterio_selected.length === 0) {
      this.notas = false;
    } else {
      this.notas = true;
      this.verificarEvaluacion();
    }
  }
}
