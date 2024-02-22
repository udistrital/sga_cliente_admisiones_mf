import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { SgaMidService } from 'src/app/services/sga_mid.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-view-formacion-academica',
  templateUrl: './view-formacion_academica.component.html',
  styleUrls: ['./view-formacion_academica.component.scss'],
})
export class ViewFormacionAcademicaComponent implements OnInit {
  info_formacion_academica_id!: number;
  organizacion: any;
  persona_id!: number;
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    if (info) {
      this.persona_id = info;
      this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  info_formacion_academica: any;
  soporte: any;

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,

    private documentoService: DocumentoService,
    private newNuxeoService: NewNuxeoService,
    private sanitization: DomSanitizer,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //this.loadData();
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

  loadData(): void {
    this.sgaMidService.get('formacion_academica?Id=' + this.persona_id)
      .subscribe((response:any) => {
        if (response !== null && response.Response.Code === '200' && (Object.keys(response.Response.Body[0]).length > 0)) {
          const data = <Array<any>>response.Response.Body[0];
          this.infoCarga.nCargas = data.length;
          const dataInfo = <Array<any>>[];
          data.forEach(element => {
            const FechaI = element.FechaInicio;
            const FechaF = element.FechaFinalizacion;
            element.FechaInicio = FechaI.substring(0, 2) + '/' + FechaI.substring(2, 4) + '/' + FechaI.substring(4, 8);
            element.FechaFinalizacion = FechaF.substring(0, 2) + '/' + FechaF.substring(2, 4) + '/' + FechaF.substring(4, 8);
            dataInfo.push(element);

            if (Number(element.Documento) > 0) {
              this.documentoService.get('documento/'+element.Documento)
                .subscribe((resp: any) => {
                    if(resp.Status && (resp.Status == "400" || resp.status == "404")) {
                      this.infoFalla();
                    } else {
                      //element.Documento = response[0]["Documento"]; 
                      element.DocumentoId = resp.Id;
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                      if (estadoDoc.aprobado === false) {
                        this.updateDocument = true;
                      }
                      this.docs_editados.emit(this.updateDocument);
                      element.aprobado = estadoDoc.aprobado;
                      element.estadoObservacion = estadoDoc.estadoObservacion;
                      element.observacion = estadoDoc.observacion;
                      element.nombreDocumento = element.ProgramaAcademico ? element.ProgramaAcademico.Nombre : '';
                      element.tabName = this.translate.instant('GLOBAL.formacion_academica');
                      element.carpeta = "Formación Académica";
                      this.zipManagerService.adjuntarArchivos([element]);
                      this.addCargado(1);
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.infoFalla();
                    //this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
                  }
                );
            } else {
              this.infoFalla();
            }
            
            /* this.newNuxeoService.get(soportes).subscribe(
              response => {
                    element.Documento = response[0]["Documento"]; 
                    element.DocumentoId = response[0].Id;
                    let estadoDoc = this.utilidades.getEvaluacionDocumento(response[0].Metadatos);
                    element.aprobado = estadoDoc.aprobado;
                    element.estadoObservacion = estadoDoc.estadoObservacion;
                    element.observacion = estadoDoc.observacion;
                    element.nombreDocumento = element.ProgramaAcademico ? element.ProgramaAcademico.Nombre : '';
                    element.tabName = this.translate.instant('GLOBAL.formacion_academica');
                    element.carpeta = "Formación Académica";
                    this.zipManagerService.adjuntarArchivos([element]);
                    this.addCargado(1);
              },
                (error: HttpErrorResponse) => {
                  this.infoFalla();
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.formacion_academica') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                }); */


          })
          this.info_formacion_academica = data;
        } else {
          this.infoFalla();
        }
      },
        (error: HttpErrorResponse) => {
          this.infoFalla();
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.formacion_academica') + '|' +
              this.translate.instant('GLOBAL.soporte_documento'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  /* loadDataOld(): void {
    this.sgaMidService.get('formacion_academica?Id=' + this.persona_id)
      .subscribe(res => {
        if (res !== null) {
          const temp_info_academica = <any>res[0];
          const files = []
          if (temp_info_academica.Documento + '' !== '0') {
            files.push({ Id: temp_info_academica.Documento, key: 'Documento' });
          }
          this.newNuxeoService.get(files).subscribe(
            response => {
              const filesResponse = <any>response;
              this.info_formacion_academica = [
                {
                  Nit: temp_info_academica.Institucion.Nit,
                  NombreUniversidad: temp_info_academica.Institucion.NombreUniversidad,
                  Pais: temp_info_academica.Institucion.Pais,
                  Direccion: temp_info_academica.Institucion.Direccion,
                  Correo: temp_info_academica.Institucion.Correo,
                  Telefono: temp_info_academica.Institucion.Telefono,
                  ProgramaAcademico: temp_info_academica.Titulacion,
                  FechaInicio: temp_info_academica.FechaInicio,
                  FechaFinalizacion: temp_info_academica.FechaFinalizacion,
                  TituloTrabajoGrado: temp_info_academica.TituloTrabajoGrado,
                  DescripcionTrabajoGrado: temp_info_academica.DescripcionTrabajoGrado,
                  Titulacion: temp_info_academica.Titulacion,
                  Documento: filesResponse[0],
                },
              ]
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.formacion_academica') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.formacion_academica'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    // this.campusMidService.get('formacion_academica/?Ente=' + this.persona_id)
    //   .subscribe(res => {
    //     if (res !== null) {
    //       const data = <Array<any>>res;
    //       const data_info = <Array<any>>[];
    //       const soportes = [];

    //       for (let i = 0; i < data.length; i++) {
    //         if (data[i].Documento + '' !== '0') {
    //           soportes.push({ Id: data[i].Documento, key: 'Documento' + i });
    //         }
    //       }

    //       this.nuxeoService.getDocumentoById$(soportes, this.documentoService)
    //         .subscribe(response => {
    //           this.documentosSoporte = <Array<any>>response;

    //           if (Object.values(this.documentosSoporte).length === data.length) {
    //               let contador = 0;
    //               data.forEach(element => {
    //                 this.campusMidService.get('organizacion/' + element.Institucion.Id)
    //                   .subscribe(organizacion => {
    //                     if (organizacion !== null) {
    //                       const organizacion_info = <any>organizacion;
    //                       element.NombreUniversidad = organizacion_info.Nombre;
    //                       this.ubicacionesService.get('lugar/' + organizacion_info.Ubicacion.UbicacionEnte.Lugar)
    //                         .subscribe(pais => {
    //                           if (pais !== null) {
    //                             const pais_info = <any>pais;
    //                             element.PaisUniversidad = pais_info.Nombre;
    //                             element.Documento = this.cleanURL(this.documentosSoporte['Documento' + contador] + '');
    //                             contador++;
    //                             data_info.push(element);
    //                             this.info_formacion_academica = <any>data_info;
    //                           }
    //                         },
    //                           (error: HttpErrorResponse) => {
    //                             Swal.fire({
    //                               icon:'error',
    //                               title: error.status + '',
    //                               text: this.translate.instant('ERROR.' + error.status),
    //                               footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                                 this.translate.instant('GLOBAL.formacion_academica') + '|' +
    //                                 this.translate.instant('GLOBAL.pais_universidad'),
    //                               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                             });
    //                           });
    //                     }
    //                   },
    //                     (error: HttpErrorResponse) => {
    //                       Swal.fire({
    //                         icon:'error',
    //                         title: error.status + '',
    //                         text: this.translate.instant('ERROR.' + error.status),
    //                         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                           this.translate.instant('GLOBAL.formacion_academica') + '|' +
    //                           this.translate.instant('GLOBAL.nombre_universidad'),
    //                         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                       });
    //                     });
    //               });
    //           }
    //         },
    //         (error: HttpErrorResponse) => {
    //           Swal.fire({
    //             icon:'error',
    //             title: error.status + '',
    //             text: this.translate.instant('ERROR.' + error.status),
    //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //               this.translate.instant('GLOBAL.formacion_academica') + '|' +
    //               this.translate.instant('GLOBAL.soporte_documento'),
    //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //           });
    //         });
    //     }
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal.fire({
    //         icon:'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.formacion_academica'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //     });
  } */

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento:any) {
    this.newNuxeoService.getByIdLocal(documento.DocumentoId)
      .subscribe(file => {
        documento.Documento = file;
        this.revisar_doc.emit(documento);
      }, error => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
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
