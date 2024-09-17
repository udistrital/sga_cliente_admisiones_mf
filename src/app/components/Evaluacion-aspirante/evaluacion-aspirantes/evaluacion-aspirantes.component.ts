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
import {
  FormControl,
  Validators,
  FormBuilder,
  FormGroup,
  FormArray,
} from "@angular/forms";
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
  datavalor: any = [];
  datasourceButtonsTable: boolean = false;
  settings: any;

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

  dataSourceTable = new MatTableDataSource<any>([]);
  columnsTable: [] | any = [];
  titlesTable: [] | any = [];
  columns: [] | any = [];

  formGroupTable!: FormGroup;
  tableReady = false;
  dataColumsTable: {} | any = {};

  criterioEnEdicion: {} | any = {};

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
    private formBuilder: FormBuilder,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.dataSourceTable = new MatTableDataSource<any>([]);
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.save = true;
    this.notas = false;
    this.showTab = true;
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

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  changePeriodo() {
    this.CampoControl.setValue("");
    this.Campo1Control.setValue("");
  }

  loadLevel() {
    this.projectService.get("nivel_formacion?limit=0").subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
          if (window.localStorage.getItem("Nivel")) {
            this.selectednivel = this.nivel_load.find(
              (p: any) => p.Id == window.localStorage.getItem("Nivel")
            ).Id;
            this.loadProyectos();
            window.localStorage.removeItem("Nivel");
          }
        }
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("ERROR.general")
        );
        this.loading = false;
      }
    );
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

  cambiarSelectPeriodoSegunNivel(nivelSeleccionado: any) {
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
    this.loadProyectos();
  }

  consultarPeriodosDoctorado(idProyecto: number) {
    this.calendarioMidService
      .get(`calendario-proyecto/${idProyecto}`)
      .subscribe(
        (response: any) => {
          const CalendarioId = response.Data.CalendarioId;
          this.eventosService.get(`calendario/${CalendarioId}`).subscribe(
            (response2: any) => {
              if (
                response2.MultiplePeriodoId !== null &&
                response2.MultiplePeriodoId !== ""
              ) {
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
              }
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

  loadProyectos() {
    this.notas = false;
    this.selectprograma = false;
    this.criterio_selected = [];
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService
        .get("proyecto_academico_institucion?limit=0")
        .subscribe(
          (response: any) => {
            this.autenticationService.getRole().then((rol: any) => {
              let r = rol.find(
                (role: any) =>
                  role == "ADMIN_SGA" ||
                  role == "VICERRECTOR" ||
                  role == "ASESOR_VICE"
              ); // rol admin o vice
              if (r) {
                this.proyectos = <any[]>(
                  response.filter((proyecto: any) =>
                    this.filtrarProyecto(proyecto)
                  )
                );
                if (window.localStorage.getItem("IdProyecto")) {
                  const idProyecto = window.localStorage.getItem("IdProyecto");
                  const proyecto = this.proyectos.find(
                    (p: any) => p.Id == idProyecto
                  );
                  if (proyecto) {
                    this.proyectos_selected = proyecto.Id;
                    this.loadCriterios();
                  }
                }
                window.localStorage.removeItem("IdProyecto");
              } else {
                const id_tercero = this.userService.getPersonaId();
                this.sgaMidAdmisiones
                  .get("admision/dependencia_vinculacion_tercero/" + id_tercero)
                  .subscribe(
                    (respDependencia: any) => {
                      const dependencias = <Number[]>(
                        respDependencia.Data.DependenciaId
                      );
                      this.proyectos = <any[]>(
                        response.filter((proyecto: any) =>
                          dependencias.includes(proyecto.Id)
                        )
                      );
                      if (dependencias.length > 1) {
                        this.popUpManager.showAlert(
                          this.translate.instant("GLOBAL.info"),
                          this.translate.instant(
                            "admision.multiple_vinculacion"
                          )
                        );
                      }
                    },
                    (error: any) => {
                      this.popUpManager.showErrorAlert(
                        this.translate.instant(
                          "admision.no_vinculacion_no_rol"
                        ) +
                          ". " +
                          this.translate.instant("GLOBAL.comunicar_OAS_error")
                      );
                    }
                  );
              }
            });
          },
          (error) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("ERROR.general")
            );
            this.loading = false;
          }
        );
    }
  }

  loadCriterios() {
    this.evaluacionService
      .get(
        "requisito_programa_academico?query=ProgramaAcademicoId:" +
          this.proyectos_selected +
          ",PeriodoId:" +
          this.periodo.Id
      )
      .subscribe(
        (response: any) => {
          if (response[0].Id !== undefined && response[0] !== "{}") {
            this.criterios = <any>response;
            this.criterios = this.criterios.filter(
              (e: any) => e.PorcentajeGeneral !== 0
            );
            console.log(this.criterios);

            this.btnCalculo = false;
            this.selectcriterio = false;
            this.notas = false;
            this.criterio_selected = [];
            this.criterios.forEach(async (element: any) => {
              await this.criterio_selected.push(element.RequisitoId);
            });
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
            this.popUpManager.showToast(
              "info",
              this.translate.instant("admision.no_criterio")
            );
            // this.popUpManager.showToast('info', this.translate.instant('admision.no_criterio'), this.translate.instant('GLOBAL.info'));
          }
        },
        (error) => {
          this.popUpManager.showErrorToast(
            this.translate.instant("admision.error_cargar")
          );
        }
      );
  }

  async createTable() {
    await this.loadAspirantes().catch((e) => (this.loading = false));
    const IdCriterio = sessionStorage.getItem("tipo_criterio");
    this.dataColumsTable = await this.loadColumn(IdCriterio);

    this.titlesTable = Object.keys(this.dataColumsTable!); // [columna1, columna2, ...]
    const titles = this.titlesTable.map(
      (key: string) => this.dataColumsTable[key].title
    ); // [columna1 (40%), columna2 (39%), ...]
    const width = this.titlesTable.map(
      (key: string) => this.dataColumsTable[key].width
    );

    this.columnsTable = titles;
    this.widhtColumns = width;

    // Crear FormArray para las filas
    const formArray = this.formBuilder.array([]); // FormArray para contener FormGroups

    // Crear un FormGroup dinámico para cada fila basada en las columnas
    this.dataSourceTable.data.forEach((rowData: any) => {
      const rowGroup = this.formBuilder.group({}); // Crear un FormGroup para cada fila

      this.titlesTable.forEach((key: string) => {
        if (this.dataColumsTable[key].editable) {
          // console.log("AGREGANDO CONTROL A ", key);
          // Agregar controles dinámicos al FormGroup basado en las columnas
          switch (key) {
            case "Asistencia":
              rowGroup.addControl(
                key,
                new FormControl(rowData[key] || false, Validators.required)
              );
              break;
            default:
              rowGroup.addControl(
                key,
                new FormControl(rowData[key] || 0, [
                  Validators.required,
                  Validators.min(0),
                  Validators.max(100),
                ])
              );
              break;
          }
        }
      });

      this.columns = this.titlesTable.map((key: string) => {
        return {
          key: key,
          title: this.dataColumsTable[key].title,
        };
      });

      // Agregar la columna 'acciones'
      this.columns.push({
        key: "acciones",
        title: "acciones",
      });

      // Añadir cada FormGroup al FormArray
      formArray.push(rowGroup as any); // Aquí debe asegurarse que `rowGroup` es un `FormGroup`
    });

    // Asignar el FormArray al FormGroup general
    this.formGroupTable.setControl("rows", formArray);

    // Agregar columna de acciones
    this.columnsTable.push("acciones");

    // Establecer el paginador y el ordenamiento
    setTimeout(() => {
      this.dataSourceTable.paginator = this.paginator;
      this.dataSourceTable.sort = this.sort;
    }, 300);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  get rows(): FormArray {
    return this.formGroupTable.get("rows") as FormArray;
  }

  onEditConfirm(rowIndex: number, row: any): void {
    if (row.tieneEvaluacion) {
      this.popUpManager
        .showConfirmAlert(
          "info",
          this.translate.instant("admision.no_editar_evaluacion")
        )
        .then((confirmacion) => {
          if (!confirmacion.isConfirmed) {
            return;
          }
        });
    }
    const rowFormGroup = this.rows.at(rowIndex) as FormGroup;
    if (rowFormGroup.invalid) {
      const mensajeAlerta = `Por favor, complete los campos requeridos en la fila ${
        rowIndex + 1
      }
      antes de guardar los cambios.
      Recuerde que los campos de porcentaje deben ser números entre 0 y 100.`;
      this.popUpManager.showAlert("error", mensajeAlerta);
      return;
    }
    const rowValues = rowFormGroup.value;
    console.log("rowValues", rowValues);
    console.log("row", row);

    // Crear el objeto de datos para el aspirante
    const aspiranteData: any = {
      Aspirantes: row.Aspirantes,
      Id: row.Id,
      Asistencia: rowValues.Asistencia,
      subcriterios: [],
    };

    Object.keys(rowValues).forEach((key) => {
      const columnDef = this.dataColumsTable[key];
      const value = rowValues[key];
      console.log("key", key);
      if (columnDef) {
        if (key === "Asistencia") {
          aspiranteData.Asistencia = value === "true" || value === true;
        } else if (key === "Aspirantes") {
          // No es necesario asignar, ya lo tenemos en row.Aspirantes
        } else if (key === "acciones") {
          // No hacemos nada
        } else if (key === "Puntuacion") {
          aspiranteData.puntaje =
            typeof value === "number" ? String(value) : value;
        } else {
          // Es un subcriterio
          const criterioId = columnDef.criterioId || null;
          aspiranteData.subcriterios.push({
            titulo: key,
            puntaje: typeof value === "number" ? String(value) : value,
            criterioId: criterioId,
          });
        }
      }
    });

    // Preparar el objeto Evaluacion para enviar al backend
    const Evaluacion: any = {
      Aspirantes: [aspiranteData],
      PeriodoId: this.periodo.Id,
      ProgramaId: this.proyectos_selected,
      CriterioId: sessionStorage.getItem("tipo_criterio"),
    };

    console.log("GUARDAR", Evaluacion);

    // Llamar a guardarEvaluacion con el objeto Evaluacion
    this.guardarEvaluacion(Evaluacion);
  }

  devolverdatasourceButtonsTable() {
    this.datasourceButtonsTable = !this.datasourceButtonsTable;
  }

  async guardarEvaluacion(Evaluacion: any) {
    return new Promise((resolve, reject) => {
      // Puedes eliminar las validaciones adicionales si ya las haces en el formulario
      this.sgaMidAdmisiones.post("admision/evaluacion", Evaluacion).subscribe(
        (response: any) => {
          if (response.Status === 200) {
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
    });
  }

  async calcularEvaluacion() {
    const Evaluacion: any = {};
    Evaluacion.IdPersona = <Array<any>>[];
    Evaluacion.IdPeriodo = this.periodo.Id;
    Evaluacion.IdPrograma = this.proyectos_selected;
    this.ngOnChanges();
    await this.loadAspirantes();
    for (let i = 0; i < this.Aspirantes.length; i++) {
      Evaluacion.IdPersona[i] = { Id: this.Aspirantes[i].Id };
    }
    
    console.log("Evaluacion", Evaluacion);

    // this.sgaMidAdmisiones.put("admision/calcular_nota", Evaluacion).subscribe(
    //   (response: any) => {
    //     if (response.status === 200) {
    //       this.popUpManager.showSuccessAlert(
    //         this.translate.instant("admision.calculo_exito")
    //       );
    //     } else {
    //       this.popUpManager.showErrorToast(
    //         this.translate.instant("admision.calculo_error")
    //       );
    //     }
    //   },
    //   (error) => {
    //     this.popUpManager.showErrorToast(
    //       this.translate.instant("admision.error_cargar")
    //     );
    //   }
    // );
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
    this.tableReady = false;
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
    await this.ngOnChanges();
    await this.createTable();
    this.showTab = false;
    await this.loadInfo(event.Id);
    this.loading = false;
    this.tableReady = true;
  }

  async loadAspirantes() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones
        .get(
          "admision/aspirantespor?id_periodo=" +
            this.periodo.Id +
            "&id_proyecto=" +
            this.proyectos_selected +
            "&tipo_lista=2"
        )
        .subscribe(
          (response: any) => {
            if (response.Success == true && response.Status == 200) {
              this.Aspirantes = response.Data;
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
                this.dataSourceTable.paginator = this.paginator;
                this.dataSourceTable.sort = this.sort;
              }, 300);

              this.dataSourceTable.data = this.Aspirantes;

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
            if (response.Status === 200) {
              const data = <Array<any>>response.Data;
              console.log("data", data);
              if (data !== null) {
                // Inicializar la propiedad tieneEvaluacion para cada aspirante
                this.Aspirantes.forEach((aspirante: any) => {
                  aspirante.tieneEvaluacion = false;
                });

                // Iterar sobre cada evaluación
                data.forEach((evaluacionData) => {
                  console.log("aspirantes", this.Aspirantes);
                  // Encontrar el índice del aspirante en this.Aspirantes
                  const aspirantIndex = this.Aspirantes.findIndex(
                    (aspirante: any) =>
                      aspirante.Id === evaluacionData.tercero_id
                  );
                  if (aspirantIndex !== -1) {
                    // Obtener el FormGroup correspondiente a la fila
                    const rowFormGroup = this.rows.at(
                      aspirantIndex
                    ) as FormGroup;

                    // Establecer Asistencia
                    if (rowFormGroup.contains("Asistencia")) {
                      rowFormGroup
                        .get("Asistencia")
                        ?.setValue(evaluacionData.asistencia);
                    }

                    // Establecer valores de evaluación
                    evaluacionData.evaluacion.forEach((evalItem: any) => {
                      const titulo = evalItem.Titulo;
                      const puntaje = evalItem.Puntaje;

                      // Verificar si el FormControl existe y establecer el valor
                      if (rowFormGroup.contains(titulo)) {
                        rowFormGroup.get(titulo)?.setValue(puntaje);
                      }
                    });

                    // Marcar que el aspirante tiene evaluación
                    this.Aspirantes[aspirantIndex].tieneEvaluacion = true;
                  }
                });

                resolve(data);
              } else {
                this.btnCalculo = true;
                resolve(null);
              }
              this.save = false;
              this.verificarEvaluacion();
            } else if (response.Status === 404) {
              resolve(response);
            } else {
              this.popUpManager.showErrorToast(
                this.translate.instant("admision.error")
              );
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

  loadColumn(IdCriterio: any) {
    const nameColumns = [];
    return new Promise((resolve, reject) => {
      this.evaluacionService
        .get("requisito?query=RequisitoPadreId:" + IdCriterio + "&limit=0")
        .subscribe(
          (response: any) => {
            for (let i = 0; i < response.length; i++) {
              nameColumns.push(response[i].Nombre);
            }
            this.evaluacionService.get("requisito/" + IdCriterio).subscribe(
              async (res: any) => {
                this.criterioEnEdicion = await this.getDatosDelCriterio(
                  IdCriterio
                );
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
                if (res.Asistencia === true) {
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

                if (response.length > 1) {
                  porcentaje = await JSON.parse(
                    this.criterioEnEdicion.PorcentajeEspecifico
                  );

                  for (const key in porcentaje.areas) {
                    if (porcentaje.areas[key]["Porcentaje"] === 0) {
                      break;
                    }
                    for (const key2 in porcentaje.areas[key]) {
                      for (let i = 0; i < response.length; i++) {
                        if (porcentaje.areas[key][key2] == response[i].Id) {
                          this.columnsTable.push(response[i].Nombre);
                          data[response[i].Nombre] = {
                            title:
                              response[i].Nombre +
                              " (" +
                              porcentaje.areas[key].Porcentaje +
                              "%)",
                            editable: true,
                            filter: false,
                            criterioId: response[i].Id,
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
                  this.columnsTable.push("Puntuacion");
                  data.Puntuacion = {
                    title: "Puntaje",
                    editable: true,
                    type: "number",
                    filter: false,
                    width: "35%",
                    valuePrepareFunction: (value: any) => {
                      return value;
                    },
                  };
                }
                resolve(data);
              },
              (error) => {
                this.popUpManager.showErrorToast(
                  this.translate.instant("admision.error_cargar")
                );
                reject(error);
              }
            );
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

  ngOnInit() {
    this.formGroupTable = this.formBuilder.group({});
  }

  ngOnChanges() {
    this.columnsTable = [];
    this.dataSourceTable.data = [];
    this.Aspirantes = [];
    for (let i = 0; i < this.Aspirantes.length; i++) {
      this.Aspirantes[i].Asistencia = false;
    }
  }

  getPercentageSub(IdCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService
        .get(
          "requisito_programa_academico?query=ProgramaAcademicoId:" +
            this.proyectos_selected +
            ",PeriodoId:" +
            this.periodo.Id +
            ",RequisitoId:" +
            IdCriterio
        )
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

  getDatosDelCriterio(IdCriterio: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService
        .get(
          "requisito_programa_academico?query=ProgramaAcademicoId:" +
            this.proyectos_selected +
            ",PeriodoId:" +
            this.periodo.Id +
            ",RequisitoId:" +
            IdCriterio
        )
        .subscribe(
          (Res: any) => {
            resolve(Res[0]);
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

  findKeyByTitle(data: any, titleToFind: string): string | undefined {
    for (const key in data) {
      if (data[key].title === titleToFind) {
        return key;
      }
    }
    return undefined; // Retorna undefined si no se encuentra la clave
  }

  findIdByTitle(data: any, titleToFind: string): any {
    for (const key in data) {
      if (data[key].title === titleToFind) {
        if (data[key].criterioId) {
          return data[key].criterioId;
        }
      }
    }
    return undefined; // Retorna undefined si no se encuentra la clave
  }
}
