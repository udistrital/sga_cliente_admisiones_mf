import { Component, OnInit, OnChanges, ViewChild } from "@angular/core";
import { Input, Output, EventEmitter } from "@angular/core";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Inscripcion } from "../../../models/inscripcion/inscripcion";
// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2";
import { FormControl, Validators } from "@angular/forms";
import { ProyectoAcademicoService } from "src/app/services/proyecto_academico.service";
import { PopUpManager } from "../../../managers/popUpManager";
import { ParametrosService } from "src/app/services/parametros.service";
import { NivelFormacion } from "src/app/models/proyecto_academico/nivel_formacion";
import { InscripcionService } from "src/app/services/inscripcion.service";
import { TercerosService } from "src/app/services/terceros.service";
import { EvaluacionInscripcionService } from "src/app/services/evaluacion_inscripcion.service";
import * as _ from "lodash";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { IAppState } from "src/app/store/app.state";
import { Store } from "@ngrx/store";
import { ListService } from "src/app/store/services/list.service";
import { SgaAdmisionesMid } from "src/app/services/sga_admisiones_mid.service";
import { UserService } from "src/app/services/users.service";
import { ImplicitAutenticationService } from "src/app/services/implicit_autentication.service";
import {
  Destination,
  EmailTemplated,
} from "../../../models/notificaciones_mid/email_templated";
import { NotificacionesMidService } from "src/app/services/notificaciones_mid.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { State } from "./estado-inscripcion";
import { InscripcionMidService } from "src/app/services/sga_inscripcion_mid.service";
@Component({
  // tslint:disable-next-line: component-selector
  selector: "ngx-listado-aspirante",
  templateUrl: "./listado_aspirante.component.html",
  styleUrls: ["./listado_aspirante.component.scss"],
})
export class ListadoAspiranteComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() eventChange = new EventEmitter();

  @Output("result") result: EventEmitter<any> = new EventEmitter();

  inscritos: any = [];
  admitidos!: any[];
  datos_persona: any;
  inscripcion!: Inscripcion;
  preinscripcion!: boolean;
  step = 0;
  cambioTab = 0;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;
  infoActulizacion: any;

  proyectos: any = [];
  periodos: any = [];

  loading!: boolean;
  programa_seleccionado: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected: any;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any;
  buttoncambio: boolean = true;
  info_consultar_aspirantes: any;
  settings_emphasys: any;
  arr_cupos: any[] = [];
  editButtonTable: boolean = false;
  source_emphasys!: any;
  source_emphasysColumns = [
    "#",
    "numero_documento",
    "nombre_completo",
    "Telefono",
    "correoelectronico",
    "Puntaje",
    "tipo_de_inscripcion",
    "enfasis",
    "estado",
    "estado_de_recibo",
    "acciones",
  ];
  show_listado = false;
  niveles!: NivelFormacion[];
  Aspirantes = [];
  cuposProyecto!: number;
  cuposOpcionados!: number;
  estadoAdmitido: any = null;
  estadoOpcionado: any = null;
  estadoNoAdmitido: any = null;
  estados: any = [];
  IdIncripcionSolicitada = null;
  InfoContacto: any;
  cantidad_aspirantes: number = 0;
  cantidad_inscrip_solicitada: number = 0;
  cantidad_admitidos: number = 0;
  cantidad_opcionados: number = 0;
  cantidad_no_admitidos: number = 0;
  cantidad_inscritos: number = 0;
  cantidad_inscritos_obs: number = 0;
  mostrarConteos: boolean = false;
  info_persona_id: any;

  stateTransitions: Record<State, State[]> = {
    "Inscripción solicitada": [],
    INSCRITO: [
      "INSCRITO con Observación",
      "ADMITIDO",
      "OPCIONADO",
      "NO ADMITIDO",
    ],
    "INSCRITO con Observación": [
      "INSCRITO",
      "ADMITIDO",
      "OPCIONADO",
      "NO ADMITIDO",
    ],
    ADMITIDO: [
      "INSCRITO",
      "INSCRITO con Observación",
      "OPCIONADO",
      "NO ADMITIDO",
    ],
    OPCIONADO: [
      "INSCRITO",
      "INSCRITO con Observación",
      "ADMITIDO",
      "NO ADMITIDO",
    ],
    "NO ADMITIDO": [
      "INSCRITO",
      "INSCRITO con Observación",
      "ADMITIDO",
      "OPCIONADO",
    ],
  };

  CampoControl = new FormControl("", [Validators.required]);
  Campo1Control = new FormControl("", [Validators.required]);
  Campo2Control = new FormControl("", [Validators.required]);
  cuposAsignados: number = 0;
  constructor(
    private translate: TranslateService,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private inscripcionMidService: InscripcionMidService,
    private usuarioService: UserService,
    private tercerosService: TercerosService,
    private proyectoAcademicoService: ProyectoAcademicoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private sgaMidAdmisioens: SgaAdmisionesMid,
    private userService: UserService,
    private autenticationService: ImplicitAutenticationService,
    private notificacionesMidService: NotificacionesMidService
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.useLanguage(event.lang);
    });
    this.listService.findInfoContacto();
    
    this.show_listado = false;
    this.inscripcionService
      .get("estado_inscripcion")
      .subscribe((state: any) => {
        this.estados = state.map((e: any) => {
          if (e.Nombre === "ADMITIDO") {
            this.estadoAdmitido = e;
          } else if (e.Nombre === "OPCIONADO") {
            this.estadoOpcionado = e;
          } else if (e.Nombre === "NO ADMITIDO") {
            this.estadoNoAdmitido = e;
          }
          if (e.Nombre === "Inscripción solicitada") {
            this.IdIncripcionSolicitada = e.Id;
          }
          return {
            value: e.Id,
            title: e.Nombre,
          };
        });
      });
  }

  async ngOnInit() {
    this.loadLists();
    this.cargarPeriodo();
    this.nivel_load();
    this.info_persona_id = await this.usuarioService.getPersonaId();
    this.source_emphasys = new MatTableDataSource([]);
  }

  buttonedit(row: any): void {
    row.mostrarBotones = !row.mostrarBotones;
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get("periodo?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0")
        .subscribe(
          (res: any) => {
            const r = <any>res;
            if (res !== null && r.Status === "200") {
              this.periodo = res.Data.find((p: any) => p.Activo);
              window.localStorage.setItem(
                "IdPeriodo",
                String(this.periodo["Id"])
              );
              resolve(this.periodo);
              const periodos = <any[]>res["Data"];
              periodos.forEach((element) => {
                this.periodos.push(element);
              });
            }
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

  nivel_load() {
    this.projectService.get("nivel_formacion?limit=0").subscribe(
      (response: any) => {
        this.niveles = response.filter(
          (nivel: any) =>
            nivel.NivelFormacionPadreId === null && nivel.Nombre === "Posgrado"
        );
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("ERROR.general")
        );
      }
    );
  }

  cargarCantidadCupos() {
    this.inscripcionService
      .get(
        "cupo_inscripcion?query=ProyectoAcademicoId:" +
          Number(this.proyectos_selected.Id) +
          ",PeriodoId:" +
          Number(this.periodo.Id) +
          ",Activo:true&limit=1"
      )
      .subscribe(
        (response: any) => {
          if (
            response !== null &&
            response !== undefined &&
            response[0].Id !== undefined
          ) {
            this.cuposProyecto = response[0].CuposHabilitados;
            this.cuposOpcionados = response[0].CuposOpcionados;
          } else {
            this.cuposProyecto = 0;
            this.popUpManager.showErrorAlert(
              this.translate.instant("cupos.sin_cupos_periodo")
            );
          }
        },
        (error) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant("cupos.sin_cupos_periodo")
          );
        }
      );
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  activar_button() {
    this.buttoncambio = false;
    this.cargarCantidadCupos();
    this.mostrartabla();
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

  hasTransition(currentState: string) {
    if (currentState == null) {
      return true;
    }
    if (!((currentState as State) in this.stateTransitions)) {
      return false;
    }

    const allowedStates = this.stateTransitions[currentState as State] || [];

    return allowedStates.length > 0;
  }

  canChangeState(currentState: State, newState: string): boolean {
    if (!(newState in this.stateTransitions)) {
      return false;
    }
    const allowedStates = this.stateTransitions[currentState] || [];
    return allowedStates.includes(newState as State);
  }

  filtrarEstados(currentState: any) {
    if (!(currentState in this.stateTransitions)) {
      return [];
    }

    return this.estados.filter((e: any) =>
      this.canChangeState(currentState as State, e.title)
    );
  }

  onSaveConfirm(event: any) {
    const newState = this.estados.filter(
      (data: any) => data.value === parseInt(event.NuevoEstadoInscripcionId, 10)
    )[0];
    if (newState.value == this.IdIncripcionSolicitada) {
      this.popUpManager.showErrorAlert(
        this.translate.instant("inscripcion.no_cambiar_inscripcion_solicitada")
      );
    } else {
      Swal.fire({
        title: this.translate.instant("GLOBAL." + "confirmar_actualizar"),
        text: newState.title,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.translate.instant("GLOBAL." + "actualizar"),
      }).then((result: any) => {
        if (result.value) {
          const updateState = {
            ...event.Inscripcion,
            ...{ EstadoInscripcionId: { Id: newState.value } },
          };
          event.EstadoInscripcionId.Id = newState.value;
          event.EstadoInscripcionId.Nombre = newState.title;
          event.TerceroId = this.info_persona_id;
          this.inscripcionMidService
            .post("inscripciones/actualizar-inscripcion", updateState)
            .subscribe(() => {
              Swal.fire(
                this.translate.instant("GLOBAL." + "operacion_exitosa"),
                "",
                "success"
              );
              const data_notificacion = {
                Email: event.Email,
                NombreAspirante: event.NombreAspirante,
                estado: newState.title,
              };
            // this.notificar_cambio_estado(data_notificacion);
            this.calcularMetaDatos();
            this.ordenarTabla();
            event.mostrarBotones = !event.mostrarBotones;
            });
        } else {
          event.confirm.reject();
        }
      });
    }
  }

  loadProyectos() {
    this.show_listado = false;
    this.selectprograma = false;
    this.proyectos = [];
    if (!Number.isNaN(this.selectednivel) && this.selectednivel !== undefined) {
      this.projectService
        .get("proyecto_academico_institucion?limit=0")
        .subscribe(
          (response: any) => {
            this.autenticationService.getRole().then(
              (rol: any) => {
                let r = rol.find(
                  (role: any) =>
                    role == "ADMIN_SGA" ||
                    role == "VICERRECTOR" ||
                    role == "ASESOR_VICE"
                );
                if (r) {
                  this.proyectos = <any[]>(
                    response.filter((proyecto: any) =>
                      this.filtrarProyecto(proyecto)
                    )
                  );
                } else {
                  const id_tercero = this.userService.getPersonaId();
                  this.sgaMidAdmisioens
                    .get(
                      "admision/dependencia_vinculacion_tercero/" + id_tercero
                    )
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
              }
            );
          },
          (error) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("ERROR.general")
            );
          }
        );
    }
  }

  mostrartabla() {
    this.show_listado = true;
    this.Aspirantes = [];
    this.inscritos = [];
    this.admitidos = [];

    this.loading = true;
    this.sgaMidAdmisioens
      .get(
        "admision/aspirantespor?id_periodo=" +
          this.periodo.Id +
          "&id_proyecto=" +
          this.proyectos_selected.Id +
          "&tipo_lista=3"
      )
      .subscribe(
        (response: any) => {
          if (response.Success == true && response.Status == 200) {
            this.Aspirantes = response.Data;
            this.ordenarTabla();
            this.calcularMetaDatos();
            this.loading = false;
            this.mostrarConteos = true;
          }
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.mostrarConteos = false;
          this.popUpManager.showErrorToast(
            this.translate.instant("admision.no_data")
          );
        }
      );
  }

  private calcularMetaDatos() {
    this.admitidos = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre === "ADMITIDO"
      );
      this.inscritos = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre === "INSCRITO"
      );
      this.cuposAsignados = this.admitidos.length;
      this.cantidad_inscrip_solicitada = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre ===
          "Inscripción solicitada"
      ).length;
      this.cantidad_admitidos = this.admitidos.length;
      this.cantidad_opcionados = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre === "OPCIONADO"
      ).length;
      this.cantidad_no_admitidos = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre === "NO ADMITIDO"
      ).length;
      this.cantidad_inscritos = this.inscritos.length;
      this.cantidad_inscritos_obs = this.Aspirantes.filter(
        (inscripcion: any) =>
          inscripcion.EstadoInscripcionId.Nombre ===
          "INSCRITO con Observación"
      ).length;
      this.cantidad_aspirantes =
        this.cantidad_inscrip_solicitada +
        this.cantidad_admitidos +
        this.cantidad_opcionados +
        this.cantidad_no_admitidos +
        this.cantidad_inscritos +
        this.cantidad_inscritos_obs;
  }

  private ordenarTabla() {
    const estadoPrioridad: { [key: string]: number } = {
        'ADMITIDO': 1,
        'INSCRITO': 2,
        'OPCIONADO': 3,
        'NO ADMITIDO': 4,
        'INSCRITO con Observación': 5,
        'Inscripción solicitada': 6
    };

    
    this.Aspirantes.sort((a: any, b: any) => {
        const prioridadA = estadoPrioridad[a.EstadoInscripcionId.Nombre] || 999;
        const prioridadB = estadoPrioridad[b.EstadoInscripcionId.Nombre] || 999;

        if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
        } else {
            return b.NotaFinal - a.NotaFinal;
        }
    });

    this.source_emphasys.data = this.Aspirantes;
    this.source_emphasys.paginator = this.paginator;
    this.source_emphasys.sort = this.sort;
  }

  enfasis(idEnf: any) {
    const promiseEnfasis = new Promise((resolve, reject) => {
      this.proyectoAcademicoService
        .get("enfasis/" + idEnf)
        .subscribe((response) => {
          resolve(response);
        });
    });
    return promiseEnfasis;
  }

  documento(idPersona: any) {
    const promiseIdentificacion = new Promise((resolve, reject) => {
      this.tercerosService
        .get("datos_identificacion?query=Activo:true,TerceroId:" + idPersona)
        .subscribe((response: any) => {
          resolve(response[0].Numero);
        });
    });
    return promiseIdentificacion;
  }

  telefono(idTercero: any, idtel: any) {
    return new Promise((resolve, reject) => {
      this.tercerosService
        .get(
          "info_complementaria_tercero?query=TerceroId.Id:" +
            idTercero +
            ",InfoComplementariaId.Id:" +
            idtel +
            "&sortby=Id&order=desc&fields=Dato&limit=1"
        )
        .subscribe(
          (response: any) => {
            if (
              response != null &&
              response.Status != "404" &&
              Object.keys(response[0]).length > 0
            ) {
              let dataTel = JSON.parse(response[0].Dato);
              resolve(dataTel.principal);
            } else {
              reject("Bad answer");
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
          }
        );
    });
  }

  async actualizarInscripcion(inscrito: any) {
    const updateState = inscrito.Inscripcion;
    updateState.EstadoInscripcionId.Id = inscrito.EstadoInscripcionId.Id;
    updateState.TerceroId = this.info_persona_id;

    return new Promise((resolve, reject) => {
      this.inscripcionMidService.post("inscripciones/actualizar-inscripcion", updateState)
        .subscribe((response: any) => {
          resolve(response.Data);
          const data_notificacion = {
            Email: inscrito.Email,
            NombreAspirante: inscrito.NombreAspirante,
            estado: inscrito.EstadoInscripcionId.Id === this.estadoAdmitido.Id ? "ADMITIDO" :
                     inscrito.EstadoInscripcionId.Id === this.estadoOpcionado.Id ? "OPCIONADO" :
                     "NO ADMITIDO",
          };
        }, (error: any) => {
          reject(error);
        });
    });
}

async asignacionDeCuposPorPrioridad() {
    const cuposAdmitidosDisponible = this.cuposProyecto - this.cantidad_admitidos;
    const cuposOpcionadosDisponible = this.cuposOpcionados - this.cantidad_opcionados;

    const inscritosOrdenados = _.orderBy(this.inscritos, [(i: any) => i.NotaFinal], ["desc"]);

    const totalInscritos = inscritosOrdenados.length;
    
    Swal.fire({
      title: `${this.translate.instant("cupos.asignanacion_automatica")}`,
      html: `${this.translate.instant("cupos.asignacion_automatica_explicacion")}`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: this.translate.instant("GLOBAL.cancelar"),
      confirmButtonText: this.translate.instant("GLOBAL.asignar"),
    }).then(async (result: any) => {
      if (result.value) {

        if (totalInscritos <= 0) {
            Swal.fire({
              title: this.translate.instant("GLOBAL.info"),
              text: `${this.translate.instant("cupos.no_aspirantes_inscritos")}`,
              icon: "warning",
              timerProgressBar: false,
            });
            return;
        }

        Swal.fire({
          title: `${this.translate.instant("cupos.asignado_estados")} ...`,
          html: `<b></b> ${this.translate.instant("cupos.procesando_inscritos")} ${totalInscritos}.`,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        let admitidosActualizados = 0;
        let opcionadosActualizados = 0;


        for (let i = 0; i < totalInscritos; i++) {
          let updateState = { ...inscritosOrdenados[i] };
          
          if (admitidosActualizados < cuposAdmitidosDisponible) {
            updateState.EstadoInscripcionId.Id = this.estadoAdmitido.Id;
            admitidosActualizados++;
          } else if (opcionadosActualizados < cuposOpcionadosDisponible) {
            updateState.EstadoInscripcionId.Id = this.estadoOpcionado.Id;
            opcionadosActualizados++;
          } else {
            updateState.EstadoInscripcionId.Id = this.estadoNoAdmitido.Id;
          }

          const content = Swal.getHtmlContainer();
          if (content) {
            const b = content.querySelector("b");
            if (b) {
              b.textContent = (i + 1).toString();
            }
          }

          await this.actualizarInscripcion(updateState);

          if (i + 1 === totalInscritos) {
            Swal.close();
            Swal.fire({
              title: this.translate.instant("GLOBAL.proceso_admision_exitoso"),
              text: `${this.translate.instant("cupos.cupos_asignados")}`,
              icon: "success",
            });
            this.mostrartabla();
          }
        }
      }
    });
  }

  public loadLists() {
    this.store
      .select((state) => state)
      .subscribe((list) => {
        this.InfoContacto = list.listInfoContacto[0];
      });
  }

  notificar_cambio_estado(data: any) {
    var body: EmailTemplated = new EmailTemplated();
    const hoy = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const fecha_format = hoy
      .toLocaleDateString("es-ES", options)
      .split(",")[1]
      .replace(" ", "")
      .split("de");
    body.Source =
      "Notificacion test <notificaciones_sga_test@udistrital.edu.co>";
    body.Template = "TEST_SGA_inscripcion-cambio-estado";
    body.Destinations = [];
    var destination: Destination = new Destination();
    destination.Destination = {
      ToAddresses: [data.Email],
    };
    destination.ReplacementTemplateData = {
      dia: fecha_format[0],
      mes: fecha_format[1],
      anio: fecha_format[2],
      nombre: data.NombreAspirante,
      estado: data.estado,
    };
    body.Destinations.push(destination);
    body.DefaultTemplateData = {
      dia: fecha_format[0],
      mes: fecha_format[1],
      anio: fecha_format[2],
      nombre: "",
      estado: "",
    };
    this.notificacionesMidService
      .post("email/enviar_templated_email", body)
      .subscribe(
        (response: any) => {
          Swal.fire({
            icon: "success",
            title: this.translate.instant(
              "admision.titulo_notificacion_success"
            ),
            text: this.translate.instant("admision.desc_notificacion_success"),
            confirmButtonText: this.translate.instant("GLOBAL.aceptar"),
          });
        },
        (err) => {
          Swal.fire({
            icon: "error",
            title: this.translate.instant("admision.titulo_notificacion_error"),
            text: this.translate.instant("admision.desc_notificacion_error"),
            confirmButtonText: this.translate.instant("GLOBAL.aceptar"),
          });
        }
      );
  }
}
