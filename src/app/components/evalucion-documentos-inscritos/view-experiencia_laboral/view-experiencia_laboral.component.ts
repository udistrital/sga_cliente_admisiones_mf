
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';

@Component({
  selector: 'ngx-view-experiencia-laboral',
  templateUrl: './view-experiencia_laboral.component.html',
  styleUrls: ['./view-experiencia_laboral.component.scss'],
})
export class ViewExperienciaLaboralComponent implements OnInit {
  persona_id!: number;
  info_experiencia_laboral: any;
  data!: Array<any>;
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

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);


  organizacion: any;
  soporte: any;
  documentosSoporte :any= [];
  variable = this.translate.instant('solicitudes.tooltip_ver_registro')

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private inscripcionesMidService: InscripcionMidService,
    private newNuxeoService: NewNuxeoService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
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

  loadData(): void {
    this.info_experiencia_laboral = <any>[];
    this.inscripcionesMidService.get('experiencia-laboral/tercero?Id=' + this.persona_id).subscribe(
      (response: any) => {
        console.log("EXPERIENCIA LABORAL", response)
        const soportes = [];
        let soportes1 = "";
        if (response.Status === 200 && response.Success === true) {
          this.data = <Array<any>>response.Data;
          this.infoCarga.nCargas = this.data.length;
          this.info_experiencia_laboral = this.data;
          for (let i = 0; i < this.info_experiencia_laboral.length; i++) {
            if (Number(this.info_experiencia_laboral[i].Soporte) > 0) {
              soportes.push({ Id: this.info_experiencia_laboral[i].Soporte, key: 'DocumentoExp' + this.info_experiencia_laboral[i].Soporte });
              soportes1 += String(this.info_experiencia_laboral[i].Soporte);
              if( i < (this.info_experiencia_laboral.length - 1) ) {
                soportes1 += '|';
              } else {
                soportes1 += `&limit=${Number(this.info_experiencia_laboral.length)}`;
              }
              this.info_experiencia_laboral[i].IdDoc = parseInt(this.info_experiencia_laboral[i].Soporte,10);
            }
          }

          if (soportes1 != '') {
            this.documentoService.get('documento?query=Id__in:'+soportes1)
              .subscribe((resp: any) => {
                if((resp.Status && (resp.Status == "400" || resp.Status == "404")) || Object.keys(resp[0]).length == 0) {
                  this.infoFalla();
                } else {
                  this.documentosSoporte = <Array<any>>resp;
                  if (Object.values(this.documentosSoporte).length === this.info_experiencia_laboral.length) {
                    this.info_experiencia_laboral.forEach((info:any) => {
                      let doc = this.documentosSoporte.find((doc:any) => doc.Id == info.IdDoc);
                      if (doc !== undefined) {
                        //info.Soporte = doc;
                        let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
                        if (estadoDoc.aprobado === false) {
                          this.updateDocument = true;
                        }
                        info.Soporte = {
                          //Documento: doc.Documento, 
                          DocumentoId: doc.Id,
                          aprobado: estadoDoc.aprobado, 
                          estadoObservacion: estadoDoc.estadoObservacion,
                          observacion: estadoDoc.observacion,
                          nombreDocumento: info.Cargo ? info.Cargo.Nombre : '',
                          tabName: this.translate.instant('inscripcion.experiencia_laboral'),
                          carpeta: "Experiencia Laboral",
                        }
                        this.zipManagerService.adjuntarArchivos([info.Soporte]);
                        this.addCargado(1);
                      }
                    });
                  } else {
                    this.infoFalla();
                  }
                }
              },
              (error: HttpErrorResponse) => {
                this.infoFalla();
                //this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
              }
              );
          }

          /* this.newNuxeoService.get(soportes).subscribe(
            response => {
                this.documentosSoporte = <Array<any>>response;
                if (Object.values(this.documentosSoporte).length === this.info_experiencia_laboral.length) {
                  this.info_experiencia_laboral.forEach(info => {
                    let doc = this.documentosSoporte.find(doc => doc.Id == info.IdDoc);
                    if (doc !== undefined) {
                      //info.Soporte = doc;
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
                      info.Soporte = {
                        Documento: doc.Documento, 
                        DocumentoId: doc.Id,
                        aprobado: estadoDoc.aprobado, 
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: info.Cargo ? info.Cargo.Nombre : '',
                        tabName: this.translate.instant('inscripcion.experiencia_laboral'),
                        carpeta: "Experiencia Laboral",
                      }
                      this.zipManagerService.adjuntarArchivos([info.Soporte]);
                      this.addCargado(1);
                    }
                  });
                }
            },
              (error: HttpErrorResponse) => {
                this.infoFalla();
                Swal.fire({
                  icon:'error',
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
          /* Swal.fire({ // Sale cuando no hay información relacionada, no debería mostrarse si la información es opcional
            icon:'error',
            text: this.translate.instant('ERROR.'+response.Data.Code),
            footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          }); */
        }
      },
      (error: HttpErrorResponse) => {
        this.infoFalla();
        Swal.fire({
          icon:'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  verDocumento(documento:any) {
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
