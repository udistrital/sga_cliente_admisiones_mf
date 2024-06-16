import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from 'src/app/services/users.service';

import { DocumentoService } from 'src/app/services/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';

import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';

@Component({
  selector: 'ngx-view-documento-programa',
  templateUrl: './view-documento_programa.component.html',
  styleUrls: ['./view-documento_programa.component.scss'],
})
export class ViewDocumentoProgramaComponent implements OnInit {
  persona_id!: string | null;
  inscripcion_id!: number;
  periodo_id!: number;
  programa_id!: number;
  estado_inscripcion!: number;
  info_documento_programa: any;
  programaDocumento: any;
  dataSop!: Array<any>;
  docSoporte:any = [];
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: any) {
    this.inscripcion_id = info2;
  }

  tipoInscripcion_id = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)

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

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private userService: UserService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  editar() {
    this.url_editar.emit(true);
  }

  loadData(): void {
    this.info_documento_programa = <any>[];
    this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
      this.inscripcion_id + ',DocumentoProgramaId.ProgramaId:' + this.programa_id + ',DocumentoProgramaId.TipoInscripcionId:' + this.tipoInscripcion_id + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo')!, 10) + ',DocumentoProgramaId.Activo:true&limit=0').subscribe(
        // (response: any[]) => {
          (response: any) => {
          if (response !== null && Object.keys(response[0]).length > 0 && response[0] != '{}') {
            this.info_documento_programa = response;
            this.infoCarga.nCargas = this.info_documento_programa.length;
            let docSoporte1 = "";
            this.info_documento_programa.forEach((doc:any, i:any) => {
              this.docSoporte.push({ Id: doc.DocumentoId, key: 'DocumentoPrograma' + doc.DocumentoId })
              docSoporte1 += String(doc.DocumentoId);
              if (i < this.infoCarga.nCargas - 1 ) {
                docSoporte1 += '|'
              } else {
                docSoporte1 += `&limit=${Number(this.infoCarga.nCargas)}`;
              }
              doc.IdDoc = doc.DocumentoId;
            });
            if (docSoporte1 != '') {
              this.documentoService.get('documento?query=Id__in:'+docSoporte1)
                .subscribe((resp: any) => {
                  if((resp.Status && (resp.Status == "400" || resp.Status == "404")) || Object.keys(resp[0]).length == 0) {
                    this.infoFalla();
                  } else {
                    this.info_documento_programa.forEach((doc:any) => {
                      let f = resp.find((file:any) => doc.IdDoc === file.Id);
                      if (f !== undefined) {
                        //doc.Documento = f["Documento"];
                        let estadoDoc = this.utilidades.getEvaluacionDocumento(f.Metadatos);
                        if (estadoDoc.aprobado === false) {
                          this.updateDocument = true;
                        }
                        this.docs_editados.emit(this.updateDocument);
                        doc.aprobado = estadoDoc.aprobado;
                        doc.estadoObservacion = estadoDoc.estadoObservacion;
                        doc.observacion = estadoDoc.observacion;
                        doc.nombreDocumento = doc.DocumentoProgramaId ? doc.DocumentoProgramaId.TipoDocumentoProgramaId ? doc.DocumentoProgramaId.TipoDocumentoProgramaId.Nombre : '' : '';
                        doc.tabName = this.translate.instant('inscripcion.documento_programa');
                        doc.carpeta = "Documentos Solicitados";
                        this.zipManagerService.adjuntarArchivos([doc]);
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
            /* this.newNuxeoService.get(this.docSoporte).subscribe(
              response => {
                if (Object.keys(response).length > 0) {
                  this.info_documento_programa.forEach(doc => {
                    let f = response.find(file => doc.IdDoc === file.Id);
                    if (f !== undefined) {
                      doc.Documento = f["Documento"];
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(f.Metadatos);
                      doc.aprobado = estadoDoc.aprobado;
                      doc.estadoObservacion = estadoDoc.estadoObservacion;
                      doc.observacion = estadoDoc.observacion;
                      doc.nombreDocumento = doc.DocumentoProgramaId ? doc.DocumentoProgramaId.TipoDocumentoProgramaId ? doc.DocumentoProgramaId.TipoDocumentoProgramaId.Nombre : '' : '';
                      doc.tabName = this.translate.instant('inscripcion.documento_programa');
                      doc.carpeta = "Documentos Solicitados";
                      this.zipManagerService.adjuntarArchivos([doc]);
                      this.addCargado(1);
                    }
                  });
                }
              },
              error => {
                this.infoFalla();
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_cargar_documento'));
              },
            ); */
          } else {
            this.info_documento_programa = null
            this.infoFalla();
          }
        },
        error => {
          this.infoFalla();
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_cargar_documento'));
        },
    );
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.programa_id = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!);
    this.persona_id = this.persona_id ? this.persona_id : this.userService.getId();
    this.inscripcion_id = this.inscripcion_id ? this.inscripcion_id : parseInt(sessionStorage.getItem('IdInscripcion')!);
    this.loadData();
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento: any) {
    documento.Id = documento.DocumentoId;
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
