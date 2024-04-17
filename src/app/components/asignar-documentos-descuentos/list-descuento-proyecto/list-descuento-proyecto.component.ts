import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { LocalDataSource } from 'ng2-smart-table';
// import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
// import 'style-loader!angular2-toaster/toaster.css';
// import { NbDialogRef } from '@nebular/theme';
import { MatDialogRef } from '@angular/material/dialog';
import { DescuentoAcademicoService } from 'src/app/services/descuento_academico.service';
import { TipoDescuento } from 'src/app/models/descuento/tipo_descuento';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ngx-list-descuento-proyecto',
  templateUrl: './list-descuento-proyecto.component.html',
  styleUrls: ['./list-descuento-proyecto.component.scss'],
})
export class ListDescuentoProyectoComponent implements OnInit {
  uid!: number;
  cambiotab: boolean = false;
  // config: ToasterConfig;
  settings: any;
  loading: boolean;
  info_desc_programa!: TipoDescuento;

  descuentos:any = [];
  administrar_descuentos: boolean = true;
  source: MatTableDataSource<any> = new MatTableDataSource();

  constructor(private translate: TranslateService,
    private descuentoService: DescuentoAcademicoService,
    private dialogRef: MatDialogRef<ListDescuentoProyectoComponent>,
    private popUpManager: PopUpManager,
    // private toasterService: ToasterService
    ) {
    this.loading = true;
    this.cargarCampos();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  @Input() asDialog!: boolean;
  dismissDialog() {
    this.dialogRef.close();
  }

  @Output() retorno = new EventEmitter<boolean>();

  cargarCampos() {
    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        CodigoAbreviacion: {
          title: this.translate.instant('GLOBAL.codigo_abreviacion'),
          // type: 'string;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          // type: 'boolean;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        NumeroOrden: {
          title: this.translate.instant('GLOBAL.numero_orden'),
          // type: 'number;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        General: {
          title: this.translate.instant('GLOBAL.general'),
          // type: 'boolean;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        ConceptoAcademicoId: {
          title: this.translate.instant('GLOBAL.concepto_academico_id'),
          // type: 'number;',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.descuentos = [];
    this.loading = true;
    this.descuentoService.get('tipo_descuento?limit=0').subscribe(
      (response:any) => {
        response.forEach((descuento:any) => {
          this.loading = true;

          if (descuento.Activo) {
            descuento.Activo = 'Sí'
          } else {
            descuento.Activo = 'No'
          }

          if (descuento.General) {
            descuento.General = 'Sí'
          } else {
            descuento.General = 'No'
          }

          this.descuentos.push(descuento);
          this.source = new MatTableDataSource(this.descuentos);
          this.loading = false;
        });
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  ngOnInit() {
  }

  itemselec(event:any) {

  }

  onEdit(event:any): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onDelete(event:any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('descuento_academico.seguro_continuar_eliminar_descuento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_desc_programa = <TipoDescuento>event.data;
          this.info_desc_programa.Activo = false;

          this.descuentoService.put('tipo_descuento/', this.info_desc_programa)
            .subscribe((res: any) => {
              if (res.Type !== 'error') {

                const opt1: any = {
                  title: this.translate.instant('GLOBAL.eliminar'),
                  text: this.translate.instant('descuento_academico.descuento_eliminado'),
                  icon: 'success',
                  buttons: true,
                  dangerMode: true,
                  showCancelButton: true,
                };

                Swal.fire(opt1).then((willCreate) => {
                  if (willCreate.value) {
                    this.loadData();
                    this.activetabFather();
                  }
                });

              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('descuento_academico.descuento_no_eliminado'));
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('descuento_academico.descuento_no_eliminado'));
            });
        }
      });
  }

  onCreate(event:any): void {
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

  selectTab(event:any): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event:any) {
    if (event) {
      this.loadData();
      this.activetab();
    }
  }

  private showToast(type: string, title: string, body: string) {
    // this.config = new ToasterConfig({
    //   // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
    //   positionClass: 'toast-top-center',
    //   timeout: 5000,  // ms
    //   newestOnTop: true,
    //   tapToDismiss: false, // hide on click
    //   preventDuplicates: true,
    //   animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
    //   limit: 5,
    // });
    // const toast: Toast = {
    //   type: type, // 'default', 'info', 'success', 'warning', 'error'
    //   title: title,
    //   body: body,
    //   showCloseButton: true,
    //   bodyOutputType: BodyOutputType.TrustedHtml,
    // };
    // this.toasterService.popAsync(toast);
  }

}
