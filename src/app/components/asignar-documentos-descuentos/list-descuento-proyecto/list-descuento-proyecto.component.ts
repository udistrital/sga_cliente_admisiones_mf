import { AccesoConfiguracionAdmision, ACCESO_CONFIGURACION_DENEGADO } from 'src/app/services/acceso-configuracion-admision.service';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { PopUpManager } from "../../../managers/popUpManager";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2";
import { MatDialogRef } from "@angular/material/dialog";
import { DescuentoAcademicoService } from "src/app/services/descuento_academico.service";
import { TipoDescuento } from "src/app/models/descuento/tipo_descuento";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
    selector: "ngx-list-descuento-proyecto",
    templateUrl: "./list-descuento-proyecto.component.html",
    styleUrls: ["./list-descuento-proyecto.component.scss"],
    standalone: false
})
export class ListDescuentoProyectoComponent implements OnInit, AfterViewInit {
  @Input() acceso: AccesoConfiguracionAdmision = ACCESO_CONFIGURACION_DENEGADO;
  @Input() asDialog!: boolean;
  @Output() retorno = new EventEmitter<boolean>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  PAGINATOR_OPTIONS: number[] = [5, 10, 25];
  uid!: number;
  cambiotab: boolean = false;
  loading: boolean;
  info_desc_programa!: TipoDescuento;
  get hasPermission(): boolean { return ['crear_tipo_descuento_admision', 'editar_tipo_descuento_admision', 'desactivar_tipo_descuento_admision'].some(opcion => this.acceso.permite(opcion)); }

  descuentos: any = [];
  administrar_descuentos: boolean = true;
  dataTableDescuentos: MatTableDataSource<any> = new MatTableDataSource();
  get columnsTableDescuentos(): string[] { return [
    ...(this.acceso.permite('editar_tipo_descuento_admision') || this.acceso.permite('desactivar_tipo_descuento_admision') ? ['acciones'] : []),
    "nombre",
    "descripcion",
    "codigo_abreviacion",
    "activo",
    "numero_orden",
    "general",
    "concepto_academico_id",
  ]; }

  constructor(
    private translate: TranslateService,
    private descuentoService: DescuentoAcademicoService,
    private dialogRef: MatDialogRef<ListDescuentoProyectoComponent>,
    private popUpManager: PopUpManager,
  ) {
    this.loading = true;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataTableDescuentos.paginator = this.paginator;
    this.dataTableDescuentos.sort = this.sort;
  }

  dismissDialog() {
    this.dialogRef.close();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.descuentos = [];
    this.loading = true;
    this.descuentoService.get("tipo_descuento?limit=0&query=Activo:true").subscribe(
      (response: any) => {
        response.forEach((descuento: any) => {
          this.loading = true;

          if (descuento.Activo) {
            descuento.Activo = "Sí";
          } else {
            descuento.Activo = "No";
          }

          if (descuento.General) {
            descuento.General = "Sí";
          } else {
            descuento.General = "No";
          }

          this.descuentos.push(descuento);
          this.dataTableDescuentos.data = this.descuentos;
          this.loading = false;
        });
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("ERROR.general")
        );
      }
    );
  }

  itemselec(event: any) {}

  onEdit(event: any): void {
    if (!this.acceso.validar('editar_tipo_descuento_admision')) return;
    if (!this.hasPermission) {
      return;
    }
    this.uid = event.data.Id;
    this.activetab();
  }

  onDelete(event: any): void {
    if (!this.acceso.validar('desactivar_tipo_descuento_admision')) return;
    if (!this.hasPermission) {
      return;
    }
    const opt: any = {
      title: this.translate.instant("GLOBAL.eliminar"),
      text: this.translate.instant(
        "descuento_academico.seguro_continuar_eliminar_descuento"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then((willDelete: any) => {
      if (willDelete.value) {
          if (!this.acceso.validar('desactivar_tipo_descuento_admision')) return;
        this.info_desc_programa = <TipoDescuento>event.data;
        this.info_desc_programa.Activo = false;
        const general = this.info_desc_programa.General
        this.info_desc_programa.General = general === "Sí" ? true : false;

        this.descuentoService
          .put("tipo_descuento", this.info_desc_programa)
          .subscribe({
            next: (res: any) => {
              if (res.Type !== "error") {
                const opt1: any = {
                  title: this.translate.instant("GLOBAL.eliminar"),
                  text: this.translate.instant(
                    "descuento_academico.descuento_eliminado"
                  ),
                  icon: "success",
                  buttons: true,
                  dangerMode: true,
                  showCancelButton: true,
                };

                Swal.fire(opt1).then((willCreate: any) => {
                  if (willCreate.value) {
                    this.loadData();
                    this.activetabFather();
                  }
                });
              } else {
                this.popUpManager.showErrorToast(
                  this.translate.instant(
                    "descuento_academico.descuento_no_eliminado"
                  )
                );
              }
            },
            error: () => {
              this.popUpManager.showErrorToast(
                this.translate.instant(
                  "descuento_academico.descuento_no_eliminado"
                )
              );
            }
        });
      }
    });
  }

  onCreate(event: any = null): void {
    if (!this.acceso.validar('crear_tipo_descuento_admision')) return;
    if (!this.hasPermission) {
      return;
    }
    this.uid = 0;
    this.activetab();
  }


  activetab(): void {
    this.cambiotab = !this.cambiotab;
    this.activetabFather();
  }

  close() {
    this.dialogRef.close();
  }

  activetabFather(): void {
    this.retorno.emit(!this.cambiotab);
  }

  selectTab(event: any): void {
    if (event.tabTitle === this.translate.instant("GLOBAL.lista")) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event: any) {
    if (event) {
      this.loadData();
      this.activetab();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataTableDescuentos.filter = filterValue.trim().toLowerCase();

    if (this.dataTableDescuentos.paginator) {
      this.dataTableDescuentos.paginator.firstPage();
    }
  }
}
