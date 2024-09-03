import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FORM_DESCUENTO_PROYECTO } from "./form-descuento-proyecto";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2";
import { TipoDescuento } from "src/app/models/descuento/tipo_descuento";
import { DescuentoAcademicoService } from "src/app/services/descuento_academico.service";
import { PopUpManager } from "src/app/managers/popUpManager";

@Component({
  selector: "ngx-crud-descuento-proyecto",
  templateUrl: "./crud-descuento-proyecto.component.html",
  styleUrls: ["./crud-descuento-proyecto.component.scss"],
})
export class CrudDescuentoProyectoComponent implements OnInit {
  descuento_id!: number;

  @Input("descuento_id")
  set name(desceunto_id: number) {
    this.descuento_id = desceunto_id;
    this.loadDescuentoProyecto();
  }

  @Output() eventChange = new EventEmitter();

  info_desc_programa!: TipoDescuento | undefined;
  formDescuentoProyecto: any;
  regDescuentoProyecto: any;
  clean!: boolean;

  constructor(
    private translate: TranslateService,
    private descuentoService: DescuentoAcademicoService,
    private popUpManager: PopUpManager
  ) {
    this.formDescuentoProyecto = FORM_DESCUENTO_PROYECTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.formDescuentoProyecto.titulo = this.translate.instant(
      "descuento_academico.descuento"
    );
    this.formDescuentoProyecto.btn = this.translate.instant("GLOBAL.guardar");
    for (let i = 0; i < this.formDescuentoProyecto.campos.length; i++) {
      this.formDescuentoProyecto.campos[i].label = this.translate.instant(
        "GLOBAL." + this.formDescuentoProyecto.campos[i].label_i18n
      );
      this.formDescuentoProyecto.campos[i].placeholder = this.translate.instant(
        "GLOBAL.placeholder_" + this.formDescuentoProyecto.campos[i].label_i18n
      );
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (
      let index = 0;
      index < this.formDescuentoProyecto.campos.length;
      index++
    ) {
      const element = this.formDescuentoProyecto.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  public loadDescuentoProyecto(): void {
    if (this.descuento_id !== undefined && this.descuento_id !== 0) {
      this.descuentoService
        .get("tipo_descuento/" + this.descuento_id)
        .subscribe(
          (res: any) => {
            if (res.Type !== "error") {
              this.info_desc_programa = <TipoDescuento>res;
            } else {
              this.popUpManager.showErrorToast(
                this.translate.instant("ERROR.general")
              );
            }
          },
          () => {
            this.popUpManager.showErrorToast(
              this.translate.instant("ERROR.general")
            );
          }
        );
    } else {
      this.info_desc_programa = undefined;
      this.clean = !this.clean;
    }
  }

  updateDescuentoProyecto(descuentoProyecto: any): void {
    const opt: any = {
      title: this.translate.instant("GLOBAL.actualizar"),
      text: this.translate.instant(
        "descuento_academico.seguro_continuar_actualizar_descuento"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then((willDelete:any) => {
      if (willDelete.value) {
        this.info_desc_programa = <TipoDescuento>descuentoProyecto;
        if (descuentoProyecto.Activo == "") {
          this.info_desc_programa.Activo = false;
        }
        if (descuentoProyecto.General == "") {
          this.info_desc_programa.General = false;
        }

        this.descuentoService
          .put("tipo_descuento/", this.info_desc_programa)
          .subscribe(
            (res: any) => {
              if (res.Type !== "error") {
                this.loadDescuentoProyecto();
                this.eventChange.emit(true);
                this.popUpManager.showInfoToast(
                  this.translate.instant(
                    "descuento_academico.descuento_actualizado"
                  )
                );
              } else {
                this.popUpManager.showErrorToast(
                  this.translate.instant(
                    "descuento_academico.descuento_no_actualizado"
                  )
                );
              }
            },
            () => {
              this.popUpManager.showErrorToast(
                this.translate.instant(
                  "descuento_academico.descuento_no_actualizado"
                )
              );
            }
          );
      }
    });
  }

  createDescuentoProyecto(descuentoProyecto: any): void {
    const opt: any = {
      title: this.translate.instant("GLOBAL.registrar"),
      text: this.translate.instant(
        "descuento_academico.seguro_continuar_registrar_descuento"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then((willDelete: any) => {
      if (willDelete.value) {
        this.info_desc_programa = <TipoDescuento>descuentoProyecto;
        if (descuentoProyecto.Activo == "") {
          this.info_desc_programa.Activo = false;
        }
        if (descuentoProyecto.General == "") {
          this.info_desc_programa.General = false;
        }
        console.log(this.info_desc_programa);

        this.descuentoService
          .post("tipo_descuento/", this.info_desc_programa)
          .subscribe(
            (res: any) => {
              if (res.Type !== "error") {
                this.info_desc_programa = <TipoDescuento>res;
                this.eventChange.emit(true);
                this.popUpManager.showInfoToast(
                  this.translate.instant("descuento_academico.descuento_creado")
                );
              } else {
                this.popUpManager.showErrorToast(
                  this.translate.instant(
                    "descuento_academico.descuento_no_creado"
                  )
                );
              }
            },
            () => {
              this.popUpManager.showErrorToast(
                this.translate.instant(
                  "descuento_academico.descuento_no_creado"
                )
              );
            }
          );
      }
    });
  }

  ngOnInit() {
    this.loadDescuentoProyecto();
  }

  validarForm(event: any) {
    if (event.valid) {
      if (this.info_desc_programa === undefined) {
        this.createDescuentoProyecto(event.data.TipoDescuento);
      } else {
        this.updateDescuentoProyecto(event.data.TipoDescuento);
      }
    }
  }
}
