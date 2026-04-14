import { Component, OnInit } from "@angular/core";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { ProyectoAcademicoService } from "src/app/services/proyecto_academico.service";
import { ParametrosService } from "src/app/services/parametros.service";
import { HttpErrorResponse } from "@angular/common/http";
// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2";
import { FormControl, Validators } from "@angular/forms";
import { PopUpManager } from "src/app/managers/popUpManager";
import { SelectDocumentoProyectoComponent } from "../select-documento-proyecto/select-documento-proyecto.component";
import { SelectDescuentoProyectoComponent } from "../select-descuento-proyecto/select-descuento-proyecto.component";
import { MatDialog } from "@angular/material/dialog";
import { InscripcionService } from "src/app/services/inscripcion.service";
import { UserService } from "src/app/services/users.service";

import { SgaAdmisionesMid } from "src/app/services/sga_admisiones_mid.service";
import { ImplicitAutenticationService } from "src/app/services/implicit_autentication.service";
import { OikosService } from "src/app/services/oikos.service";

@Component({
  selector: "ngx-asignar_documentos_descuentos",
  templateUrl: "./asignar_documentos_descuentos.component.html",
  styleUrls: ["./asignar_documentos_descuentos.component.scss"],
})
export class AsignarDocumentosDescuentosComponent implements OnInit {
  toasterService: any;
  info_inscripcion: any;

  proyectos: any = [];
  periodos: any = [];

  loading: boolean = false;
  proyectos_selected: any;
  periodo: any;
  nivel_load: any;
  selectednivel: any;

  tipos_inscripcion: any = [];
  tipo_inscripcion_selected: any;
  proyectosFilteredNivel!: any[];
  proyectosFilteredFacultad!: any[];

  facultad: any;
  facultades: any[] = [];

  tipo_cupo: any;

  CampoControl = new FormControl({ value: null, disabled: true }, [Validators.required]);
  Campo1Control = new FormControl({ value: null, disabled: true }, [Validators.required]);
  Campo2Control = new FormControl({ value: null, disabled: true }, [Validators.required]);
  Campo3Control = new FormControl({ value: null, disabled: true }, [Validators.required]);

  loadingGlobal: boolean = false;

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private dialogService: MatDialog,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private userService: UserService,
    private oikosService: OikosService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  async ngOnInit() {
    try {
      this.loadingGlobal = true;
      await this.cargarPeriodo();
      await this.loadLevel();
      await this.cargarFacultad();
      await this.loadProyectos();
      this.updateNextSelectAvailability();
      this.loadingGlobal = false;
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
        .get("periodo?query=CodigoAbreviacion:PA&sortby=Nombre&order=desc&limit=0")
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
            this.loadingGlobal = false;
          }
        );
    });
  }

  selectPeriodo() {
    this.selectednivel = null;
    this.facultad = null;
    this.proyectos_selected = null;
    this.tipo_inscripcion_selected = null;
    this.proyectosFilteredNivel = [];
    this.proyectosFilteredFacultad = [];
    this.tipos_inscripcion = [];
    this.CampoControl.reset(null, { emitEvent: false });
    this.Campo1Control.reset(null, { emitEvent: false });
    this.Campo2Control.reset(null, { emitEvent: false });
    this.Campo3Control.reset(null, { emitEvent: false });
    this.updateNextSelectAvailability();
  }

  private updateNextSelectAvailability() {
    if (this.periodo) {
      this.CampoControl.enable({ emitEvent: false });
    } else {
      this.CampoControl.disable({ emitEvent: false });
    }

    if (this.selectednivel) {
      this.Campo1Control.enable({ emitEvent: false });
    } else {
      this.Campo1Control.disable({ emitEvent: false });
    }

    if (this.facultad) {
      this.Campo2Control.enable({ emitEvent: false });
    } else {
      this.Campo2Control.disable({ emitEvent: false });
    }

    if (this.proyectos_selected) {
      this.Campo3Control.enable({ emitEvent: false });
    } else {
      this.Campo3Control.disable({ emitEvent: false });
    }
  }

  loadLevel() {
    this.loading = true;
    this.projectService
      .get(
        "nivel_formacion?query=Activo:true,CodigoAbreviacion:POS"
      )
      .subscribe(
        (response: any) => {
          if (response !== null || response !== undefined) {
            this.nivel_load = <any>response;
          }
          this.loading = false;
        },
        (error) => {
          this.popUpManager.showErrorToast(
            this.translate.instant("ERROR.general")
          );
          this.loading = false;
          this.loadingGlobal = false;
        }
      );
  }

  cargarFacultad() {
    return new Promise((resolve, reject) => {
      this.oikosService
        .get("dependencia_tipo_dependencia?query=Activo:true&limit=0")
        .subscribe(
          (response: any) => {
            if (
              response != null &&
              response.Status != "404" &&
              Object.keys(response[0]).length > 0
            ) {
              for (let obj of response) {
                if (obj.TipoDependenciaId.Id == 2) {
                  this.facultades.push(obj.DependenciaId);
                }
              }
              resolve(this.facultades);
            } else {
              reject({ Facultad: "Bad answer" });
            }
          },
          (error: HttpErrorResponse) => {
            reject({ Facultad: error });
          }
        );
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

  filtrarPorNivel(selNivel: any) {
    this.proyectosFilteredNivel = this.proyectos.filter((proyect: any) => {
      if (proyect.NivelFormacionId.Id == selNivel) {
        return true;
      } else if (proyect.NivelFormacionId.NivelFormacionPadreId != null) {
        if (proyect.NivelFormacionId.NivelFormacionPadreId.Id == selNivel) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
    this.facultad = null;
    this.proyectos_selected = null;
    this.tipo_inscripcion_selected = null;
    this.proyectosFilteredFacultad = [];
    this.tipos_inscripcion = [];
    this.Campo1Control.reset(null, { emitEvent: false });
    this.Campo2Control.reset(null, { emitEvent: false });
    this.Campo3Control.reset(null, { emitEvent: false });
    this.updateNextSelectAvailability();
  }

  onNivelChange() {
    this.filtrarPorNivel(this.selectednivel);
  }

  filtrarPorFacultades(selProyecto: any) {
    if (
      this.proyectosFilteredNivel != undefined &&
      this.proyectosFilteredNivel.length > 0
    ) {
      this.proyectosFilteredFacultad = this.proyectosFilteredNivel.filter(
        (proyect) => {
          if (proyect.FacultadId == selProyecto) {
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      this.proyectosFilteredFacultad = [];
    }
    this.proyectos_selected = null;
    this.tipo_inscripcion_selected = null;
    this.tipos_inscripcion = [];
    this.Campo2Control.reset(null, { emitEvent: false });
    this.Campo3Control.reset(null, { emitEvent: false });
    this.updateNextSelectAvailability();
  }

  onFacultadChange() {
    this.filtrarPorFacultades(this.facultad);
  }

  loadProyectos() {
    this.proyectos_selected = undefined;
    sessionStorage.setItem("ProgramaAcademicoId", "");
    this.tipo_inscripcion_selected = undefined;
    sessionStorage.setItem("TipoInscripcionId", "");
    if (!Number.isNaN(this.selectednivel)) {
      this.loading = true;
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
                ); // rol admin, pendiente vice
                if (r) {
                  this.proyectos = response;
                } else {
                  const id_tercero = this.userService.getPersonaId();
                  this.sgaMidAdmisiones
                    .get(
                      "admision/dependencia_vinculacion_tercero/" + id_tercero
                    )
                    .subscribe(
                      (respDependencia: any) => {
                        const dependencias = <Number[]>(
                          respDependencia.Data.Data.DependenciaId
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
            this.loading = false;
          },
          (error) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("ERROR.general")
            );
            this.loading = false;
            this.loadingGlobal = false;
          }
        );
    }
  }

  filterTipoInscripcion(tipoInscripcion: any) {
    return this.selectednivel === tipoInscripcion.NivelId;
  }

  loadTipoInscripcion() {
    if (!this.proyectos_selected) {
      this.tipos_inscripcion = [];
      this.tipo_inscripcion_selected = null;
      this.Campo3Control.reset(null, { emitEvent: false });
      this.updateNextSelectAvailability();
      return;
    }

    this.loading = true;
    this.tipo_inscripcion_selected = null;
    sessionStorage.setItem("TipoInscripcionId", "");
    if (!Number.isNaN(this.selectednivel)) {
      this.inscripcionService
        .get("tipo_inscripcion?query=Activo:true,CodigoAbreviacion:NUEPOS&limit=0")
        .subscribe(
          (response: any) => {
            this.tipos_inscripcion = <any[]>(
              response.filter((tipoInscripcion: any) =>
                this.filterTipoInscripcion(tipoInscripcion)
              )
            );
            this.updateNextSelectAvailability();
            this.loading = false;
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

  onProyectoChange() {
    this.tipo_inscripcion_selected = null;
    this.Campo3Control.reset(null, { emitEvent: false });
    this.loadTipoInscripcion();
    this.updateNextSelectAvailability();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnChanges() {}

  savePrograma() {
    sessionStorage.setItem('ProgramaAcademicoId', this.proyectos_selected)
    sessionStorage.setItem('PeriodoId', this.periodo.Id)
    sessionStorage.setItem('TipoInscripcionId', this.tipo_inscripcion_selected)
    sessionStorage.setItem('TipoCupo', this.tipo_cupo)
  }

  openSelectDocumentoProyectoComponent() {
    this.dialogService.open(SelectDocumentoProyectoComponent);
  }

  openSelectDescuentoProyectoComponent() {
    this.dialogService.open(SelectDescuentoProyectoComponent);
  }

  cambioPeriodo() {
    this.selectPeriodo();
  }
}
