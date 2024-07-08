import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SolicitudDescuento } from 'src/app/models/descuento/solicitud_descuento';

import { SgaMidService } from 'src/app/services/sga_mid.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CampusMidService } from 'src/app/services/campus_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { decrypt } from 'src/utils/util-encrypt';
import { UserService } from 'src/app/services/users.service';

@Component({
  selector: 'ngx-view-descuento-academico',
  templateUrl: './view-descuento_academico.component.html',
  styleUrls: ['./view-descuento_academico.component.scss'],
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
  docDesSoporte:any = [];
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: any) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== 0 && this.inscripcion.toString() !== '') {
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

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private inscripcionService: InscripcionService,
    private newNuxeoService: NewNuxeoService,
    private inscripcionesMidService: InscripcionMidService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private userService: UserService,
    private popUpManager: PopUpManager,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
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
    const id = await this.userService.getPersonaId();
    this.inscripcionesMidService.get('/academico/descuento/detalle?' + id + '&DependenciaId=' +
      sessionStorage.getItem('ProgramaAcademicoId') + '&PeriodoId=' + sessionStorage.getItem('IdPeriodo'))
      .subscribe((result: any) => {
        const r = <any>result.Data[1];
        if (result !== null && result.Status == '200') {
          const data = <Array<SolicitudDescuento>>r;
          const soportes = [];
          let soportes1 = "";
          this.info_descuento = data;
          for (let i = 0; i < this.info_descuento.length; i++) {
            if (Number(this.info_descuento[i].DocumentoId) > 0) {
              soportes.push({ Id: this.info_descuento[i].DocumentoId, key: i });
              soportes1 += String(this.info_descuento[i].DocumentoId);
              if (i < this.info_descuento.length - 1 ) {
                soportes1 += '|';
              } else {
                soportes1 += `&limit=${Number(this.info_descuento.length)}`;
              }
            }
          }
          this.infoCarga.nCargas = soportes.length;
          
          if (soportes1 != '') {
            this.documentoService.get('documento?query=Id__in:'+soportes1)
              .subscribe((resp: any) => {
                if((resp.Status && (resp.Status == "400" || resp.Status == "404")) || Object.keys(resp[0]).length == 0) {
                  this.infoFalla();
                } else {
                  this.docDesSoporte = <Array<any>>resp;
                  this.info_descuento.forEach((info:any) => {
                    let doc = this.docDesSoporte.find((doc:any) => doc.Id === info.DocumentoId);
                    if (doc !== undefined) {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
                      if (estadoDoc.aprobado === false) {
                        this.updateDocument = true;
                      }
                      this.docs_editados.emit(this.updateDocument);
                      info.Soporte = {
                        //Documento: doc.Documento, 
                        DocumentoId: doc.Id,
                        aprobado: estadoDoc.aprobado, 
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: info.DescuentosDependenciaId ? info.DescuentosDependenciaId.TipoDescuentoId ? info.DescuentosDependenciaId.TipoDescuentoId.Nombre : '' : '',
                        tabName: this.translate.instant('inscripcion.descuento_matricula'),
                        carpeta: "Descuentos de Matrícula"
                      }
                      this.zipManagerService.adjuntarArchivos([info.Soporte]);
                      this.addCargado(1);
                    }
                  });
                }
              },
              (error) => {
                this.infoFalla();
                //this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
              }
              );
          }
          /* this.newNuxeoService.get(soportes).subscribe(
            response => {
              this.docDesSoporte = <Array<any>>response;
              this.info_descuento.forEach(info => {
                let doc = this.docDesSoporte.find(doc => doc.Id === info.DocumentoId);
                if (doc !== undefined) {
                  let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
                  info.Soporte = {
                    Documento: doc.Documento, 
                    DocumentoId: doc.Id,
                    aprobado: estadoDoc.aprobado, 
                    estadoObservacion: estadoDoc.estadoObservacion,
                    observacion: estadoDoc.observacion,
                    nombreDocumento: info.DescuentosDependenciaId ? info.DescuentosDependenciaId.TipoDescuentoId ? info.DescuentosDependenciaId.TipoDescuentoId.Nombre : '' : '',
                    tabName: this.translate.instant('inscripcion.descuento_matricula'),
                    carpeta: "Descuentos de Matrícula"
                  }
                  this.zipManagerService.adjuntarArchivos([info.Soporte]);
                  this.addCargado(1);
                }
                
              });
            },
              (error: HttpErrorResponse) => {
                this.infoFalla();
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              }); */
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
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.descuento_matricula'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  /* loadDataOld(): void {
    this.inscripcionService.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        this.programa = inscripciondata.ProgramaAcademicoId;
        this.periodo = inscripciondata.PeriodoId;
        this.programa = 16;
        this.mid.get(`descuento_academico/descuentopersonaperiododependencia?` +
          `PersonaId=${this.persona}&DependenciaId=${this.programa}&PeriodoId=${this.periodo}`)
          .subscribe(res => {
            if (res !== null) {
              this.info_descuento = <Array<SolicitudDescuento>>res;

              this.info_descuento.forEach(descuento => {
                let file = { Id: descuento.DocumentoId };
                this.newNuxeoService.get([file]).subscribe(
                  response => {
                    const documentosSoporte = <Array<any>>response;
                    // if (Object.values(documentosSoporte).length === data.length) {
                    // for (let i = 0; i < data.length; i++) {
                    descuento.Documento = documentosSoporte[0].url;
                    // }
                    // }
                  },
                    (error: HttpErrorResponse) => {
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                          this.translate.instant('GLOBAL.soporte_documento'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
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
                  this.translate.instant('GLOBAL.descuento_matricula') + '|' +
                  this.translate.instant('GLOBAL.descuento_matricula'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    // this.inscripciones.get('inscripcion/' + this.inscripcion)
    //   .subscribe(dato_inscripcion => {
    //     const inscripciondata = <any>dato_inscripcion;
    //     this.programa = inscripciondata.ProgramaAcademicoId;
    //     this.periodo = inscripciondata.PeriodoId;
    //     this.estado_inscripcion = inscripciondata.EstadoInscripcionId.Id;
    //     this.mid.get('descuento_academico/descuentopersonaperiododependencia/?PersonaId=' + this.persona +
    //       '&DependenciaId=' + this.programa + '&PeriodoId=' + this.periodo)
    //       .subscribe(descuentos => {
    //         if (descuentos !== null) {
    //           this.dataDes = <Array<any>>descuentos;
    //           const soportesDes = [];
    //           let archivosDes = 0;

    //           for (let i = 0; i < this.dataDes.length; i++) {
    //             if (this.dataDes[i].DocumentoId + '' !== '0') {
    //               soportesDes.push({ Id: this.dataDes[i].DocumentoId, key: 'DocumentoDes' + i });
    //               archivosDes = i;
    //             }
    //           }

    //           this.nuxeoDes.getDocumentoById$(soportesDes, this.docdesService)
    //             .subscribe(responseDes => {
    //               this.docDesSoporte = <Array<any>>responseDes;

    //               if (Object.values(this.docDesSoporte).length > this.dataDes.length && this.docDesSoporte['DocumentoDes' + archivosDes] !== undefined &&
    //                 this.dataDes[archivosDes].DocumentoId > 0) {
    //                 let contadorDes = 0;
    //                 this.info_descuento = <any>[];

    //                 this.dataDes.forEach(elementDes => {
    //                   elementDes.DocumentoId = this.cleanURL(this.docDesSoporte['DocumentoDes' + contadorDes] + '');
    //                   contadorDes++;
    //                   this.info_descuento.push(elementDes);
    //                 });
    //               }
    //             },
    //               (error: HttpErrorResponse) => {
    //                 Swal.fire({
    //                   icon:'error',
    //                   title: error.status + '',
    //                   text: this.translate.instant('ERROR.' + error.status),
    //                   footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                     this.translate.instant('GLOBAL.documento_programa'),
    //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                 });
    //               });
    //         }
    //       },
    //         (error: HttpErrorResponse) => {
    //           Swal.fire({
    //             icon:'error',
    //             title: error.status + '',
    //             text: this.translate.instant('ERROR.' + error.status),
    //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //               this.translate.instant('GLOBAL.descuentos_dependencia'),
    //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //           });
    //         });
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal.fire({
    //         icon:'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.admision'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //   });
  } */

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento: any) {
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
