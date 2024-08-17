import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from 'src/app/services/users.service';

import { DocumentoService } from 'src/app/services/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { ProduccionAcademicaPost } from 'src/app/models/produccion_academica/produccion_academica';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
@Component({
  selector: 'ngx-view-produccion-academica',
  templateUrl: './view-produccion_academica.component.html',
  styleUrls: ['./view-produccion_academica.component.scss'],
})
export class ViewProduccionAcademicaComponent implements OnInit {
  info_produccion_academica!: any;
  persona_id!: number;
  inscripcion_id!: number;
  gotoEdit: boolean = false;
  ViendoSoportes: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    if (info && info !== null && info !== 0 && info.toString() !== '') {
      this.persona_id = info;
      this.loadData();
    }
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

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
    private documentoService: DocumentoService,
    private inscripcionesMidService: InscripcionMidService,
    private sanitization: DomSanitizer,
    private users: UserService,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //    this.persona_id = parseInt(sessionStorage.getItem('TerceroId'));
//    this.loadData();
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
    this.inscripcionesMidService.get('academico/produccion/' + this.persona_id)
      .subscribe((res: any) => {
        if (res !== null) {
          if (res.Status === 200 && res.Data !== null) {
            this.info_produccion_academica = <Array<ProduccionAcademicaPost>>res.Data;
            this.infoCarga.nCargas = this.info_produccion_academica.length;
            this.info_produccion_academica.forEach((produccion:any) => {
              produccion["VerSoportes"] = false;
              produccion["Soportes"] = [];
              let metaFiles = produccion.Metadatos.filter((m:any) => JSON.parse(m.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition).etiqueta == "file")
              let totalFiles = metaFiles.length;
              metaFiles.forEach((m:any, i:any) => {
                let itemForm = JSON.parse(m.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition)
                this.documentoService.get('documento/'+m.Valor)
                  .subscribe((resp: any) => {
                    if(resp.Status && (resp.Status == "400" || resp.Status == "404")) {
                      this.infoFalla();
                    } else {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                      if (estadoDoc.aprobado === false) {
                        this.updateDocument = true;
                      }
                      this.docs_editados.emit(this.updateDocument);
                      let prepareNombre: string = (produccion.SubtipoProduccionId.Nombre).toUpperCase() + ' (' + produccion.Titulo + ')';
                      let prepareDoc = {
                        //Documento: response[0]["Documento"],
                        DocumentoId: resp.Id,
                        aprobado: estadoDoc.aprobado,
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: this.translate.instant('produccion_academica.'+itemForm.label_i18n),
                        tabName: prepareNombre, 
                        carpeta: "Producción Académica/"+prepareNombre.replace(/[\<\>\:\"\|\?\*\/\.]/g,'')
                      };
                      produccion["Soportes"].push(prepareDoc);
                      this.zipManagerService.adjuntarArchivos([prepareDoc]);
                      if (i >= totalFiles-1) {
                        this.addCargado(1);
                      }
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.infoFalla();
                    Swal.fire({
                      icon: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  }
                  );
                /* this.newNuxeoService.get([{Id: m.Valor}]).subscribe(
                  (response) => {
                    let estadoDoc = this.utilidades.getEvaluacionDocumento(response[0].Metadatos);
                    let prepareNombre: string = (produccion.SubtipoProduccionId.Nombre).toUpperCase() + ' (' + produccion.Titulo + ')';
                    let prepareDoc = {
                      Documento: response[0]["Documento"],
                      DocumentoId: response[0].Id,
                      aprobado: estadoDoc.aprobado,
                      estadoObservacion: estadoDoc.estadoObservacion,
                      observacion: estadoDoc.observacion,
                      nombreDocumento: this.translate.instant('produccion_academica.'+itemForm.label_i18n),
                      tabName: prepareNombre, 
                      carpeta: "Producción Académica/"+prepareNombre.replace(/[\<\>\:\"\|\?\*\/\.]/g,'')};
                    produccion["Soportes"].push(prepareDoc);
                  this.zipManagerService.adjuntarArchivos([prepareDoc]);
                  if (i >= totalFiles-1) {
                    this.addCargado(1);
                  }
                  },
                  (error) => {
                    this.infoFalla();
                    Swal.fire({
                      icon: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  }
                ); */
              });
            });
          } else {
            this.infoFalla();
            /* Swal.fire({ // Sale cuando no hay información relacionada, no debería mostrarse si la información es opcional
              icon: 'error',
              title: res.Response.Code,
              text: this.translate.instant('ERROR.'+res.Response.Code),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            }); */
          }
        }
      }, (error: HttpErrorResponse) => {
        this.infoFalla();
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  verListaDocumentos(produccionClicked:any) {
    this.info_produccion_academica.forEach((produccion:any) => {
      if(produccionClicked.Id == produccion.Id) {
        produccion["VerSoportes"] = !produccion["VerSoportes"];
      } else {
        produccion["VerSoportes"] = false;
      }
    });
    this.ViendoSoportes = this.info_produccion_academica.some((produccion:any) => produccion["VerSoportes"] == true);    
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
