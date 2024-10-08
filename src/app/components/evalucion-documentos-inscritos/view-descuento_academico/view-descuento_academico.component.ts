import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { InscripcionService } from "src/app/services/inscripcion.service";
import { SolicitudDescuento } from "src/app/models/descuento/solicitud_descuento";
import { DocumentoService } from "src/app/services/documento.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { HttpErrorResponse } from "@angular/common/http";
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { NewNuxeoService } from "src/app/services/new_nuxeo.service";
import { UtilidadesService } from "src/app/services/utilidades.service";
import { ZipManagerService } from "src/utils/zip-manager.service";
import { PopUpManager } from "../../../managers/popUpManager";
import { InscripcionMidService } from "src/app/services/sga_inscripcion_mid.service";
import { UserService } from "src/app/services/users.service";

@Component({
  selector: "ngx-view-descuento-academico",
  templateUrl: "./view-descuento_academico.component.html",
  styleUrls: ["./view-descuento_academico.component.scss"],
})
export class ViewDescuentoAcademicoComponent implements OnInit {
  persona!: number;
  inscripcion!: number;
  estado_inscripcion!: number;
  periodo!: number;
  programa!: number;
  info_descuento: any;
  info_temp: any;
  dataInfo: any;
  dataDes!: Array<any>;
  solicituddescuento!: SolicitudDescuento;
  docDesSoporte: any = [];
  variable = this.translate.instant("GLOBAL.tooltip_ver_registro");
  gotoEdit: boolean = false;

  @Input("persona_id")
  set info(info: any) {
    this.persona = info;
    this.checkLoadData();
  }

  @Input("inscripcion_id")
  set info2(info2: any) {
    this.inscripcion = info2;
    this.checkLoadData();
  }

  @Output("url_editar") url_editar: EventEmitter<boolean> = new EventEmitter();
  @Output("revisar_doc") revisar_doc: EventEmitter<any> = new EventEmitter();
  @Output("estadoCarga") estadoCarga: EventEmitter<any> = new EventEmitter(
    true
  );
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: "",
  };

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;
  @Output("docs_editados") docs_editados: EventEmitter<any> = new EventEmitter(
    true
  );

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private inscripcionService: InscripcionService,
    private newNuxeoService: NewNuxeoService,
    private inscripcionesMidService: InscripcionMidService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private userService: UserService,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.gotoEdit = localStorage.getItem("goToEdit") === "true";
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  async loadData(): Promise<void> {
    const id = this.persona;
    this.inscripcionesMidService
      .get(
        "/academico/descuento/detalle?PersonaId=" +
          id +
          "&DependenciaId=" +
          sessionStorage.getItem("ProgramaAcademicoId") +
          "&PeriodoId=" +
          sessionStorage.getItem("IdPeriodo")
      )
      .subscribe(
        (result: any) => {
          if (result !== null && result.Status === 200) {
            const data = <Array<SolicitudDescuento>>result.Data;
            const soportes = [];
            let soportes1 = "";
            this.info_descuento = data;
            if (this.info_descuento) {
              for (let i = 0; i < this.info_descuento.length; i++) {
                if (Number(this.info_descuento[i].DocumentoId) > 0) {
                  soportes.push({
                    Id: this.info_descuento[i].DocumentoId,
                    key: i,
                  });
                  soportes1 += String(this.info_descuento[i].DocumentoId);
                  if (i < this.info_descuento.length - 1) {
                    soportes1 += "|";
                  } else {
                    soportes1 += `&limit=${Number(this.info_descuento.length)}`;
                  }
                }
              }
              this.infoCarga.nCargas = soportes.length;
              if (soportes1 != "") {
                this.documentoService
                  .get("documento?query=Id__in:" + soportes1)
                  .subscribe(
                    (resp: any) => {
                      if (
                        (resp.Status &&
                          (resp.Status == "400" || resp.Status == "404")) ||
                        Object.keys(resp[0]).length == 0
                      ) {
                        this.infoFalla();
                      } else {
                        this.docDesSoporte = <Array<any>>resp;
                        this.info_descuento.forEach((info: any) => {
                          let doc = this.docDesSoporte.find(
                            (doc: any) => doc.Id === info.DocumentoId
                          );
                          if (doc !== undefined) {
                            let estadoDoc =
                              this.utilidades.getEvaluacionDocumento(
                                doc.Metadatos
                              );
                            if (estadoDoc.aprobado === false) {
                              this.updateDocument = true;
                            }
                            this.docs_editados.emit(this.updateDocument);
                            info.Soporte = {
                              DocumentoId: doc.Id,
                              aprobado: estadoDoc.aprobado,
                              estadoObservacion: estadoDoc.estadoObservacion,
                              observacion: estadoDoc.observacion,
                              nombreDocumento: info.DescuentosDependenciaId
                                ? info.DescuentosDependenciaId.TipoDescuentoId
                                  ? info.DescuentosDependenciaId.TipoDescuentoId
                                      .Nombre
                                  : ""
                                : "",
                              tabName: this.translate.instant(
                                "inscripcion.descuento_matricula"
                              ),
                              carpeta: "Descuentos de Matrícula",
                            };
                            this.zipManagerService.adjuntarArchivos([
                              info.Soporte,
                            ]);
                            this.addCargado(1);
                          }
                        });
                      }
                    },
                    (error) => {
                      this.infoFalla();
                    }
                  );
              } else {
                this.infoFalla();
              }
            } else {
              this.infoFalla();
            }
          } else {
            this.infoFalla();
          }
        },
        (error: HttpErrorResponse) => {
          this.infoFalla();
          Swal.fire({
            icon: "error",
            title: error.status + "",
            text: this.translate.instant("ERROR." + error.status),
            footer:
              this.translate.instant("GLOBAL.cargar") +
              "-" +
              this.translate.instant("GLOBAL.descuento_matricula") +
              "|" +
              this.translate.instant("GLOBAL.descuento_matricula"),
            confirmButtonText: this.translate.instant("GLOBAL.aceptar"),
          });
        }
      );
  }

  checkLoadData() {
    if (
      this.persona !== undefined &&
      this.persona !== 0 &&
      this.persona.toString() !== "" &&
      this.inscripcion !== undefined &&
      this.inscripcion !== 0 &&
      this.inscripcion.toString() !== ""
    ) {
      this.loadData();
    }
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument =
      <string>(
        (sessionStorage.getItem("IdEstadoInscripcion") || "").toUpperCase()
      ) === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento: any) {
    this.newNuxeoService.getByIdLocal(documento.DocumentoId).subscribe(
      (file) => {
        documento.Documento = file;
        this.revisar_doc.emit(documento);
      },
      (error) => {
        this.popUpManager.showErrorAlert(
          this.translate.instant("inscripcion.sin_documento")
        );
      }
    );
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje =
      this.infoCarga.nCargado / this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}
