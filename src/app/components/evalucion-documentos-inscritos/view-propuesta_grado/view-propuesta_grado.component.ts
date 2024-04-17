import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PropuestaGrado } from 'src/app/models/inscripcion/propuesta_grado';
import { DocumentoService } from 'src/app/services/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CIDCService } from 'src/app/services/cidc.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-view-propuesta-grado',
  templateUrl: './view-propuesta_grado.component.html',
  styleUrls: ['./view-propuesta_grado.component.scss'],
})
export class ViewPropuestaGradoComponent implements OnInit {
  info_propuesta_grado!: any;
  persona_id!: number;
  inscripcion_id!: number;
  estado_inscripcion!: number;
  FormatoProyecto: any;
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: any) {
    this.inscripcion_id = info2;
    if (this.inscripcion_id !== null && this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '') {
      // this.loadData();
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

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private cidcService: CIDCService,
    private documentoService: DocumentoService,
    private newNuxeoService: NewNuxeoService,
    private sanitization: DomSanitizer,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //this.persona_id = this.users.getPersonaId();
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionService.get('propuesta/?query=Activo:true,InscripcionId:' + this.inscripcion_id)
      .subscribe((res:any) => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const temp = <any>res[0];
          const files9 = []
          if (temp.DocumentoId + '' !== '0') {
            files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
          }
          this.newNuxeoService.get(files9).subscribe(
            response_2 => {
              const filesResponse_2 = <any>response_2;
              if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2 !== undefined)) {
                temp.Documento = filesResponse_2[0].url;
                this.cidcService.get('research_units/' + temp.GrupoInvestigacionId)
                  .subscribe(grupo => {
                    if (grupo !== null) {
                      temp.GrupoInvestigacion = <any>grupo;
                      this.cidcService.get('subtypes/' + temp.LineaInvestigacionId)
                        .subscribe(linea => {
                          if (linea !== null) {
                            temp.LineaInvestigacion = <any>linea;
                            // temp.LineaInvestigacion.name = temp.LineaInvestigacion.LineaInvestigacion.name;
                            // this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones.push(temp.LineaInvestigacion);
                            //  temp.TipoProyecto = temp.TipoProyectoId;
                            this.info_propuesta_grado = temp;
                          }
                        },
                          (error: HttpErrorResponse) => {
                            Swal.fire({
                              icon: 'error',
                              title: error.status + '',
                              text: this.translate.instant('ERROR.' + error.status),
                              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                                this.translate.instant('GLOBAL.linea_investigacion'),
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
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.grupo_investigacion'),
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
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
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
              this.translate.instant('GLOBAL.propuesta_grado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    // this.inscripcionService.get('propuesta/?query=InscripcionId:' + this.inscripcion_id +
    //   '&limit=0')
    //   .subscribe(res => {
    //     if (res !== null) {
    //       const propuesta = <any>res[0];
    //       this.estado_inscripcion = res[0].InscripcionId.EstadoInscripcionId.Id;
    //       this.info_propuesta_grado = propuesta;
    //       this.coreService.get('linea_investigacion_grupo_investigacion/' +
    //         propuesta.GrupoInvestigacionLineaInvestigacionId)
    //         .subscribe(linea_grupo => {
    //           const linea_grupo_info = <any>linea_grupo;
    //           this.coreService.get('grupo_investigacion/' +
    //             linea_grupo_info.GrupoInvestigacionId)
    //             .subscribe(grupo => {
    //               propuesta.GrupoInvestigacion = <any>grupo;
    //               this.coreService.get('linea_investigacion/' +
    //                 linea_grupo_info.LineaInvestigacionId)
    //                 .subscribe(linea => {
    //                   propuesta.LineaInvestigacion = <any>linea;
    //                   const soportes = [];
    //                   if (propuesta.DocumentoId + '' !== '0') {
    //                     soportes.push({ Id: propuesta.DocumentoId, key: 'Propuesta' });
    //                   }

    //                   this.nuxeoService.getDocumentoById$(soportes, this.documentoService)
    //                     .subscribe(response => {
    //                       propuesta.DocumentoId = this.cleanURL(response['Propuesta'] + '');
    //                       this.info_propuesta_grado = propuesta;
    //                     },
    //                       (error: HttpErrorResponse) => {
    //                         Swal.fire({
    //                           icon:'error',
    //                           title: error.status + '',
    //                           text: this.translate.instant('ERROR.' + error.status),
    //                           footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                             this.translate.instant('GLOBAL.propuesta_grado') + '|' +
    //                             this.translate.instant('GLOBAL.soporte_documento'),
    //                           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                         });
    //                       });
    //                 },
    //                   (error: HttpErrorResponse) => {
    //                     Swal.fire({
    //                       icon:'error',
    //                       title: error.status + '',
    //                       text: this.translate.instant('ERROR.' + error.status),
    //                       footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                         this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
    //                         this.translate.instant('GLOBAL.linea_investigacion'),
    //                       confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                     });
    //                   });
    //             },
    //               (error: HttpErrorResponse) => {
    //                 Swal.fire({
    //                   icon:'error',
    //                   title: error.status + '',
    //                   text: this.translate.instant('ERROR.' + error.status),
    //                   footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                     this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
    //                     this.translate.instant('GLOBAL.grupo_investigacion'),
    //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                 });
    //               });
    //         },
    //           (error: HttpErrorResponse) => {
    //             Swal.fire({
    //               icon:'error',
    //               title: error.status + '',
    //               text: this.translate.instant('ERROR.' + error.status),
    //               footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                 this.translate.instant('GLOBAL.propuesta_grado') + '|' +
    //                 this.translate.instant('GLOBAL.grupo_investigacion'),
    //               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //             });
    //           });
    //     }
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal.fire({
    //         icon:'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.propuesta_grado'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //     });
  }

  loadPropuestaGrado(): void {
    this.infoCarga.nCargas = 4;
    this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' + Number(window.sessionStorage.getItem('IdInscripcion')))
      .subscribe((res:any) => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const temp = <PropuestaGrado>res[0];
          const files9 = []
          if (temp.DocumentoId + '' !== '0') {
            files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
          }
          this.documentoService.get('documento/'+temp.DocumentoId)
            .subscribe((resp: any) => {
              if(resp.Status && (resp.Status == "400" || resp.Status == "404")) {
                this.infoFalla();
              } else {
                //temp.FormatoProyecto = filesResponse_2[0].url;
                let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                if (estadoDoc.aprobado === false) {
                  this.updateDocument = true;
                }
                this.docs_editados.emit(this.updateDocument);
                temp.Soporte = {
                  //Documento: filesResponse_2[0].Documento, 
                  DocumentoId: resp.Id,
                  aprobado: estadoDoc.aprobado, 
                  estadoObservacion: estadoDoc.estadoObservacion,
                  observacion: estadoDoc.observacion,
                  nombreDocumento: temp.Nombre,
                  tabName: this.translate.instant('inscripcion.propuesta_grado'),
                  carpeta: "Propuesta de Trabajo de Grado"
                }
                this.zipManagerService.adjuntarArchivos([temp.Soporte]);
                //this.FormatoProyecto = temp.DocumentoId;
                this.addCargado(2);
/*               }
            }); */

/*           this.newNuxeoService.get(files9).subscribe(
            async response_2 => {
              const filesResponse_2 = <any>response_2;
              if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2 !== undefined)) {
                temp.FormatoProyecto = filesResponse_2[0].url;
                let estadoDoc = this.utilidades.getEvaluacionDocumento(filesResponse_2[0].Metadatos);
                temp.Soporte = {
                  Documento: filesResponse_2[0].Documento, 
                  DocumentoId: filesResponse_2[0].Id,
                  aprobado: estadoDoc.aprobado, 
                  estadoObservacion: estadoDoc.estadoObservacion,
                  observacion: estadoDoc.observacion,
                  nombreDocumento: temp.Nombre,
                  tabName: this.translate.instant('inscripcion.propuesta_grado'),
                  carpeta: "Propuesta de Trabajo de Grado"
                }
                this.zipManagerService.adjuntarArchivos([temp.Soporte]);
                this.FormatoProyecto = temp.DocumentoId;
                this.addCargado(2); */

                if (temp.GrupoInvestigacionId === 0) {
                  temp.GrupoInvestigacion = <any>{ name: "No aplica" };
                  this.info_propuesta_grado = temp;
                  this.addCargado(1);
                } else {
                  this.cidcService.get('research_units/' + temp.GrupoInvestigacionId)
                    .subscribe(grupo => {
                      if (grupo !== null) {
                        temp.GrupoInvestigacion = <any>grupo;
                        this.info_propuesta_grado = temp;
                        this.addCargado(1);
                      }
                    }, (error: HttpErrorResponse) => {
                      this.infoFalla();
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.grupo_investigacion'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
                }

                if (temp.LineaInvestigacionId === 0) {
                  temp.LineaInvestigacion = <any>{ st_name: "No aplica" };
                  this.info_propuesta_grado = temp;
                  this.addCargado(1);
                } else {
                  this.cidcService.get('subtypes/' + temp.LineaInvestigacionId)
                    .subscribe(linea => {
                      if (linea !== null) {
                        temp.LineaInvestigacion = <any>linea;
                        this.info_propuesta_grado = temp;
                        this.addCargado(1);
                      }
                    }, (error: HttpErrorResponse) => {
                      this.infoFalla();
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.linea_investigacion'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
                }

              }
            },
              (error: HttpErrorResponse) => {
                this.infoFalla();
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
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
              this.translate.instant('GLOBAL.propuesta_grado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  verPropuesta(documento:any) {
    documento.Id = documento.DocumentoId;
    this.newNuxeoService.getByIdLocal(documento.DocumentoId)
      .subscribe(file => {
        documento.Documento = file;
        this.revisar_doc.emit(documento);
      }, error => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.loadPropuestaGrado();
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
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
