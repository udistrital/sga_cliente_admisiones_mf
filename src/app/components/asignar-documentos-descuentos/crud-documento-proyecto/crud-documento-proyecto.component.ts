import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { FORM_DOCUMENTO_PROYECTO } from './form-documento-proyecto'
// import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
// import 'style-loader!angular2-toaster/toaster.css';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TipoDocumentoPrograma } from 'src/app/models/documento/tipo_documento_programa';

@Component({
  selector: 'ngx-crud-documento-proyecto',
  templateUrl: './crud-documento-proyecto.component.html',
  styleUrls: ['./crud-documento-proyecto.component.scss'],
})
export class CrudDocumentoProyectoComponent implements OnInit {

  clean!: boolean;
  documento_id!: number;
  info_doc_programa!: any;
  formDocumentoProyecto: any;
  regDocumentoProyecto: any;

  @Output() eventChange = new EventEmitter();
  @Input('documento_id')
  set name(documento_id: number) {
    this.documento_id = documento_id;
    this.loadDocumentoProyecto();
  }

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
  ) {
    this.formDocumentoProyecto = FORM_DOCUMENTO_PROYECTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.formDocumentoProyecto.titulo = this.translate.instant('documento_proyecto.documento');
    this.formDocumentoProyecto.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formDocumentoProyecto.campos.length; i++) {
      this.formDocumentoProyecto.campos[i].label = this.translate.instant('GLOBAL.' + this.formDocumentoProyecto.campos[i].label_i18n);
      this.formDocumentoProyecto.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formDocumentoProyecto.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDocumentoProyecto.campos.length; index++) {
      const element = this.formDocumentoProyecto.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadDocumentoProyecto(): void {
    if (this.documento_id !== undefined && this.documento_id !== 0) {
      this.inscripcionService.get('tipo_documento_programa/' + this.documento_id)
        .subscribe((res: any) => {
          if (res.Type !== 'error') {
            this.info_doc_programa = <TipoDocumentoPrograma>res;
          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
          }
        }, () => {
          this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
        });
    } else {
      this.info_doc_programa = undefined;
      this.clean = !this.clean;
    }
  }

  updateDocumentoProyecto(documentoProyecto: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_actualizar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete:any) => {
        if (willDelete.value) {
          this.info_doc_programa = <TipoDocumentoPrograma>documentoProyecto;
          if (documentoProyecto.Activo == "") {
            this.info_doc_programa.Activo = false;
          }

          this.inscripcionService.put('tipo_documento_programa/', this.info_doc_programa)
            .subscribe((res: any) => {
              if (res.Type !== 'error') {
                this.loadDocumentoProyecto();
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('documento_proyecto.documento_actualizado'));
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_actualizado'));
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_actualizado'));
            });
        }
      });
  }

  createDocumentoProyecto(documentoProyecto: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_registrar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete:any) => {
        if (willDelete.value) {
          this.info_doc_programa = <TipoDocumentoPrograma>documentoProyecto;
          if (documentoProyecto.Activo == "") {
            this.info_doc_programa.Activo = false;
          }

          this.inscripcionService.post('tipo_documento_programa/', this.info_doc_programa)
            .subscribe((res: any) => {
              if (res.Type !== 'error') {
                this.info_doc_programa = <TipoDocumentoPrograma>res;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.registrar'), this.translate.instant('documento_proyecto.documento_creado'));
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
            });
        }
      });
  }

  ngOnInit() {
    this.loadDocumentoProyecto();
  }

  validarForm(event: any) {
    if (event.valid) {
      if (this.info_doc_programa === undefined) {
        this.createDocumentoProyecto(event.data.TipoDocumentoPrograma);
      } else {
        this.updateDocumentoProyecto(event.data.TipoDocumentoPrograma);
      }
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
