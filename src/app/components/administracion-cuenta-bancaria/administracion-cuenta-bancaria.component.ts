import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { PopUpManager } from "src/app/managers/popUpManager";
import { Inscripcion } from "src/app/models/inscripcion/inscripcion";
import { NivelFormacion } from "src/app/models/proyecto_academico/nivel_formacion";
import { ImplicitAutenticationService } from "src/app/services/implicit_autentication.service";
import { ParametrosService } from "src/app/services/parametros.service";
import { ProyectoAcademicoService } from "src/app/services/proyecto_academico.service";
import { UserService } from "src/app/services/users.service";
import { SgaAdmisionesMid } from "src/app/services/sga_admisiones_mid.service";

@Component({
  selector: "app-administracion-cuenta-bancaria",
  templateUrl: "./administracion-cuenta-bancaria.component.html",
  styleUrls: ["./administracion-cuenta-bancaria.component.scss"],
})
export class AdministracionCuentaBancariaComponent {
  toasterService: any;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output("result") result: EventEmitter<any> = new EventEmitter();
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

  total: boolean = false;

  proyectos: any[] = [];
  criterios = [];
  periodos: any[] = [];
  cuentas: any;
  niveles!: NivelFormacion[];
  nivelSelect!: NivelFormacion[];
  selectedCuenta: any;

  show_cupos = false;
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
  proyectos_selected!: any[] | undefined;
  criterio_selected!: any[];
  selectTipoIcfes: any;
  selectTipoEntrevista: any;
  selectTipoPrueba: any;
  selectCuenta: any;
  selectTabView: any;
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  //cuenta: any;
  selectednivel: any;
  esPosgrado: boolean = false;

  tiposRecaudo: any[] = [];
  cuentasBancarias: any[] = [];

  asignacionForm: FormGroup;
  nuevaCuenta: boolean = false;
  dataSource: any;

  cuenta: any[] = [];

  CampoControl = new FormControl("", [Validators.required]);
  Campo1Control = new FormControl("", [Validators.required]);
  Campo2Control = new FormControl("", [Validators.required]);
  Campo3Control = new FormControl("", [Validators.required]);
  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private autenticationService: ImplicitAutenticationService,
    private sgaAdmisionesMid: SgaAdmisionesMid
  ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.total = true;
    this.cargarPeriodo();
    this.nivel_load();
    this.asignacionForm = new FormGroup({
      periodoAcademico: new FormControl(""),
      cuentaBancaria: new FormControl(""),
    });
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

  nivel_load() {
    this.projectService.get("nivel_formacion?limit=0").subscribe(
      (response: any) => {
        this.niveles = response.filter(
          (nivel: any) => nivel.NivelFormacionPadreId === null
        );
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("ERROR.general")
        );
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

  loadProyectos() {
    this.selectprograma = false;
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService
        .get("proyecto_academico_institucion?limit=0")
        .subscribe(
          (response: any) => {
            this.autenticationService.getRole().then(
              // (rol: Array <String>) => {
              (rol: any) => {
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
                } else {
                  const id_tercero = this.userService.getPersonaId();
                  this.sgaAdmisionesMid
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

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event: any): void {
    switch (event) {
      case "info_cupos":
        this.show_cupos = true;
        this.validarNvel();
        break;
      default:
        this.show_cupos = false;
        break;
    }
  }

  validarNvel() {
    this.esPosgrado = false;
    this.projectService
      .get("nivel_formacion?query=Id:" + Number(this.selectednivel))
      .subscribe(
        // (response: NivelFormacion[]) => {
        (response: any) => {
          this.nivelSelect = response.filter(
            (nivel: any) => nivel.NivelFormacionPadreId === null
          );
          if (this.nivelSelect[0].Nombre === "Posgrado") {
            this.esPosgrado = true;
          }
        },
        (error) => {
          this.popUpManager.showErrorToast(
            this.translate.instant("ERROR.general")
          );
        }
      );
  }

  obtenerCuentas() {
    this.parametrosService.get("parametro?query=TipoParametroId:37").subscribe(
      (response) => {
        this.dataSource = response;
        this.cuentas = this.dataSource.Data;
      },
      (error) => {
        console.error("Error al obtener las cuentas:", error);
      }
    );
  }

  ngOnInit() {
    this.obtenerCuentas();
  }

  guardar(cuenta: any): void {
    cuenta.Data.Activo = true;
    this.parametrosService
      .put(`parametro?query=Id:${cuenta.Data.Id}`, cuenta)
      .subscribe(
        (response) => {},
        (error) => {
          console.error("Error al guardar la cuenta:", error);
        }
      );
  }

  ngOnChanges() {}
}
