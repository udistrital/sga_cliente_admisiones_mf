import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
// import { LocalDataSource } from 'ng2-smart-table';
// import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
// import 'style-loader!angular2-toaster/toaster.css';
// import { NbDialogRef } from '@nebular/theme';
import { MatDialogRef } from '@angular/material/dialog';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TipoDocumentoPrograma } from 'src/app/models/documento/tipo_documento_programa';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'ngx-list-documento-proyecto',
  templateUrl: './list-documento-proyecto.component.html',
  styleUrls: ['./list-documento-proyecto.component.scss'],
})
export class ListDocumentoProyectoComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  uid!: number;
  cambiotab: boolean = false;
  // config: ToasterConfig;
  settings: any;
  loading: boolean;
  info_doc_programa!: TipoDocumentoPrograma;

  documentos: any = [];
  administrar_documentos: boolean = true;
  sourceColumn = ["acciones", "nombre", "descripcion", "codigo_abreviacion", "activo", "numero_orden"]
  source: MatTableDataSource<any> = new MatTableDataSource();

  constructor(private translate: TranslateService,
    private dialogRef: MatDialogRef<ListDocumentoProyectoComponent>,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    // private toasterService: ToasterService
  ) {
    this.loading = true;
 
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  @Input() asDialog!: boolean;
  dismissDialog() {
    this.dialogRef.close();
  }

  @Output() retorno = new EventEmitter<boolean>();




  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.source.filter = filterValue.trim().toLowerCase();

    if (this.source.paginator) {
      this.source.paginator.firstPage();
    }
  }


  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.documentos = [];
    this.loading = true;
    this.inscripcionService.get('tipo_documento_programa?limit=0').subscribe(
      (response: any) => {
        response.forEach((documento: any) => {
          this.loading = true;
          if (documento.Activo) {
            documento.Activo = 'Sí'
          } else {
            documento.Activo = 'No'
          }
          this.documentos.push(documento);
          this.source = new MatTableDataSource(this.documentos);
          setTimeout(() => {
            this.source.paginator = this.paginator;
            this.source.sort = this.sort;
            }, 300);
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

  itemselec(event: any) {

  }

  onEdit(event: any): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onDelete(event: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_eliminar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_doc_programa = <TipoDocumentoPrograma>event.data;
          this.info_doc_programa.Activo = false;

          this.inscripcionService.put('tipo_documento_programa/', this.info_doc_programa)
            .subscribe((res: any) => {
              if (res.Type !== 'error') {

                const opt1: any = {
                  title: this.translate.instant('GLOBAL.eliminar'),
                  text: this.translate.instant('documento_proyecto.documento_eliminado'),
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
                this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
              }
            }, () => {
              this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
            });
        }
      });
  }

  onCreate(event: any): void {
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
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
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



}
