import { Component, OnInit, Input, ViewChild } from '@angular/core';
// import { LocalDataSource } from 'ng2-smart-table';
/* import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster'; */
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
//  
import { Subscription } from 'rxjs';
// import { NbDialogRef } from '@nebular/theme';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Validators, FormControl } from '@angular/forms';
import { TipoDocumentoPrograma } from 'src/app/models/documento/tipo_documento_programa';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentoPrograma } from 'src/app/models/documento/documento_programa';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';

@Component({
  selector: 'ngx-select-documento-proyecto',
  templateUrl: './select-documento-proyecto.component.html',
  styleUrls: ['./select-documento-proyecto.component.scss'],
})
export class SelectDocumentoProyectoComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  uid!: number;
  // config: ToasterConfig;
  settings: any;
  Campo2Control = new FormControl('', [Validators.required]);
  sourceColumns = ["nombre","obligatorio","eliminar"]
  source: MatTableDataSource<any> = new MatTableDataSource();
  administrar_documentos: boolean = false;
  boton_retornar: boolean = false;
  loading: boolean;

  documentos: any = [];
  subscription!: Subscription;
  documento_proyecto: any = [];
  hasPermission: boolean = false;

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private dialogRef: MatDialogRef<SelectDocumentoProyectoComponent>,
    private popUpManager: PopUpManager,
    private autenticationService: ImplicitAutenticationService
    ) {
    this.loading = true;
    this.loadData();
    this.loadDataProyecto();
  
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    });
  }

  @Input() asDialog!: boolean;
  dismissDialog() {
     this.dialogRef.close();
  }

 

  handleCheckboxChange(event: any) {
    this.onUpdate(event)
}

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.obtenerPermisos()
  }

  activetab(): void {
    this.administrar_documentos = !this.administrar_documentos;
    this.boton_retornar = !this.boton_retornar;
  }

  onChange(event: any) {
    if (event) {
      this.loadData();
      this.loadDataProyecto();
      this.administrar_documentos = !this.administrar_documentos;
    }
  }

  onCreateDocument(event: any) {
    const documento = <TipoDocumentoPrograma>event.value;
    if (!this.documento_proyecto.find((documento_registrado: any) => documento_registrado.Id === documento.Id) && documento.Id) {

      const opt: any = {
        title: this.translate.instant('GLOBAL.registrar'),
        text: this.translate.instant('documento_proyecto.seguro_continuar_registrar_documento'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      };

      Swal.fire(opt)
        .then((create: any) => {
          if (create.value) {
            Swal.fire({
              title: this.translate.instant('documento_proyecto.carga_nuevo_documento'),
              html: `<b></b>`,
              timerProgressBar: true,
              didOpen: () => {
                //falta aqui arreglar con esta func
                // Swal.showLoading();
              },
            });

            let content = Swal.getHtmlContainer();
            if (content) {
              const b: any = content.querySelector('b');
              if (b) {
                b.textContent = this.translate.instant('GLOBAL.carga_recolectando');
              }
            }
      
            const documentoNuevo: DocumentoPrograma = new DocumentoPrograma();
            documentoNuevo.TipoDocumentoProgramaId = documento;
            documentoNuevo.Activo = true;
            documentoNuevo.PeriodoId = parseInt(sessionStorage.getItem('PeriodoId')!, 10);
            documentoNuevo.ProgramaId = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
            documentoNuevo.TipoInscripcionId = parseInt(sessionStorage.getItem('TipoInscripcionId')!, 10);
            documentoNuevo.TipoCupo = parseInt(sessionStorage.getItem('TipoCupo')!,10)
            documentoNuevo.Obligatorio = true;

            content = Swal.getHtmlContainer();
            if (content) {
              const b: any = content.querySelector('b');
              if (b) {
                b.textContent = this.translate.instant('GLOBAL.carga_guardando');
              }
            }

            this.inscripcionService.post('documento_programa', documentoNuevo).subscribe((response: any) => {
              Swal.close();
              if (response.Type !== 'error') {

                const opt1: any = {
                  title: this.translate.instant('GLOBAL.registrar'),
                  text: this.translate.instant('documento_proyecto.documento_creado'),
                  icon: 'success',
                  buttons: true,
                  dangerMode: true,
                  showCancelButton: true,
                };

                Swal.fire(opt1).then((willCreate:any) => {
                  if (willCreate.value) {
                    this.loadDataProyecto();
                  }
                });

              } else {
                // this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
              }
            }, () => {
              // this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
            });
          }
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('documento_proyecto.error_documento_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onDeleteDocument(event: any) {
    const documento = <TipoDocumentoPrograma>event.data;
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_eliminar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete:any) => {

        if (willDelete.value) {
          Swal.fire({
            title: this.translate.instant('documento_proyecto.carga_eliminando_documento'),
            html: `<b></b>`,
            timerProgressBar: true,
            didOpen: () => {
              //falta arreglar el error con este bug
              // Swal.showLoading();
            },
          });

          const documentoModificado: DocumentoPrograma = new DocumentoPrograma();
          documentoModificado.TipoDocumentoProgramaId = documento;
          documentoModificado.Activo = false;
          documentoModificado.FechaCreacion = event.data.FechaPrograma;
          documentoModificado.Id = event.data.IdDocPrograma;
          documentoModificado.PeriodoId = parseInt(sessionStorage.getItem('PeriodoId')!, 10);
          documentoModificado.ProgramaId = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
          documentoModificado.TipoInscripcionId = parseInt(sessionStorage.getItem('TipoInscripcionId')!, 10);
          documentoModificado.TipoCupo = parseInt(sessionStorage.getItem('TipoCupo')!,10)
          documentoModificado.Obligatorio = event.data.Obligatorio;

          this.inscripcionService.put('documento_programa', documentoModificado).subscribe((res: any) => {
            Swal.close()
            if (res.Type !== 'error') {

              const opt1: any = {
                title: this.translate.instant('GLOBAL.eliminar'),
                text: this.translate.instant('documento_proyecto.documento_eliminado'),
                icon: 'success',
                buttons: true,
                dangerMode: true,
                showCancelButton: true,
              };

              Swal.fire(opt1).then((willDelete1:any) => {
                if (willDelete1.value) {
                  this.loadDataProyecto();
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

  onUpdate(documento: any) {
    var msgpopUp
    if (documento.value == true) {
      msgpopUp = this.translate.instant('documento_proyecto.poner_obligatorio')
    } else {
      msgpopUp = this.translate.instant('documento_proyecto.quitar_obligatorio')
    }
    this.popUpManager.showConfirmAlert(msgpopUp, this.translate.instant('documento_proyecto.documento')).then(accion => {
      if (accion.value) {
        const documentoModificado: DocumentoPrograma = new DocumentoPrograma();
        documentoModificado.TipoDocumentoProgramaId = documento.Data;
        documentoModificado.Activo = true;
        documentoModificado.FechaCreacion = documento.Data.FechaPrograma;
        documentoModificado.Id = documento.Data.IdDocPrograma;
        documentoModificado.PeriodoId = parseInt(sessionStorage.getItem('PeriodoId')!, 10);
        documentoModificado.ProgramaId = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
        documentoModificado.TipoInscripcionId = parseInt(sessionStorage.getItem('TipoInscripcionId')!, 10);
        documentoModificado.TipoCupo = parseInt(sessionStorage.getItem('TipoCupo')!,10)
        documentoModificado.Obligatorio = documento.value;
        this.inscripcionService.put('documento_programa', documentoModificado).subscribe((response:any) => {
          if (response.Type !== 'error') {
            this.popUpManager.showSuccessAlert(this.translate.instant('documento_proyecto.ajuste_ok'))
            this.loadDataProyecto()
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('documento_proyecto.ajuste_fail'))
            this.source= new MatTableDataSource(this.documento_proyecto);
          }
        }, () => {
          this.popUpManager.showErrorToast(this.translate.instant('documento_proyecto.ajuste_fail'))
          this.source= new MatTableDataSource(this.documento_proyecto);

        });
      } else {
        this.source = new MatTableDataSource(this.documento_proyecto);

      }
    })
  }

  openListDocumentoComponent() {
    if (this.hasPermission) {
      this.administrar_documentos = true;
      this.boton_retornar = true;
    }else {
      Swal.fire({
        icon: 'info',
        title: this.translate.instant('documento_proyecto.sin_acceso'),
        text: this.translate.instant('documento_proyecto.sin_acceso_cuerpo'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      })
    }

  }

obtenerPermisos() {
  this.autenticationService.getRole().then((rol) => {
    const roles = rol as Array<String>;  // Casting a Array<String>
    if (roles.includes('ADMIN_SGA')) {
      this.hasPermission = true;
    } else {
      this.hasPermission = false;
    }
  });
}


  retorno(event: any) {
    this.boton_retornar = event;
    this.loadData();
  }

  close() {
     this.dialogRef.close();
  }

  loadData() {
    this.loading = true;
    this.documentos = [];
    this.inscripcionService.get('tipo_documento_programa?limit=0&query=Activo:true').subscribe(
      (response: any) => {
        response.forEach((documento: any) => {
          this.documentos.push(documento);
          this.loading = false;
        });
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadDataProyecto() {
    this.loading = true;
    this.documento_proyecto = [];
    this.inscripcionService.get('documento_programa?query=Activo:true,ProgramaId:' + sessionStorage.getItem('ProgramaAcademicoId') + ',TipoInscripcionId:' + sessionStorage.getItem('TipoInscripcionId') + ',PeriodoId:' + sessionStorage.getItem('PeriodoId') + '&limit=0').subscribe(
      (response: any) => {
        if (response === undefined || response === null) {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
        else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')) {
          this.source = new MatTableDataSource(this.documento_proyecto);
          setTimeout(() => {
            this.source.paginator = this.paginator;
            this.source.sort = this.sort;
            }, 300);
        }
        else {
          response.forEach((documento: any) => {
            documento.TipoDocumentoProgramaId.IdDocPrograma = documento.Id;
            documento.TipoDocumentoProgramaId.FechaPrograma = documento.FechaCreacion;
            documento.TipoDocumentoProgramaId.Obligatorio = documento.Obligatorio;
            this.documento_proyecto.push(<TipoDocumentoPrograma>documento.TipoDocumentoProgramaId);
          });
          this.source = new MatTableDataSource(this.documento_proyecto);
          setTimeout(() => {
            this.source.paginator = this.paginator;
            this.source.sort = this.sort;
            }, 300);
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    
    this.source.filter = filterValue.trim().toLowerCase();
  
     if (this.source.paginator) {
       this.source.paginator.firstPage();
     }
  }
}
