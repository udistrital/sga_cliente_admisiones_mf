import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';

import { DocumentoService } from 'src/app/services/documento.service';
import { UserService } from 'src/app/services/users.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
// import 'style-loader!angular2-toaster/toaster.css';
import { InfoCaracteristica } from 'src/app/models/informacion/info_caracteristica';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/utils/zip-manager.service';

@Component({
  selector: 'ngx-view-info-persona',
  templateUrl: './view-info-persona.component.html',
  styleUrls: ['./view-info-persona.component.scss'],
})
export class ViewInfoPersonaComponent implements OnInit {

  info_persona_id!: number;
  info_info_persona!: any;
  info_persona_user!: string;

  info_info_caracteristica!: any;
  tipoDiscapacidad: any = undefined;
  tipoPoblacion: any = undefined;
  idSoporteDiscapacidad: any = undefined;
  idSoportePoblacion: any = undefined;
  docDiscapacidad: any;
  docPoblacion: any;
  gotoEdit: boolean = false;
  lugarOrigen: string = "";
  fechaNacimiento: string = "";
  correo: string = "";
  telefono: string = "";
  telefonoAlt: string = "";
  direccion: string = "";
  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Input('persona_id')
  set name(persona_id: any) {
    this.info_persona_id = persona_id;
    this.loadInfoPersona();
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

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(private sgaMidService: SgaMidService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,

    private translate: TranslateService,
    private userService: UserService,
    private newNuxeoService: NewNuxeoService,
    private popUpManager: PopUpManager,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    // this.loadInfoPersona();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  public loadInfoPersona(): void {
    this.infoCarga.nCargas = 5;
    const id = this.info_persona_id ? this.info_persona_id : this.userService.getPersonaId();
    if (id !== undefined && id !== 0 && id.toString() !== '') {
      this.sgaMidService.get('persona/consultar_persona/' + id)
        .subscribe((res:any) => {
          const r = <any>res;
          if (r !== null && r.Type !== 'error') {
            this.info_info_persona = <InfoPersona>res;
            let nombreAspirante: string = this.info_info_persona.PrimerApellido + ' ' + this.info_info_persona.SegundoApellido + ' '
                                  + this.info_info_persona.PrimerNombre + ' ' + this.info_info_persona.SegundoNombre;
            let nombreCarpetaDocumental: string = sessionStorage.getItem('IdInscripcion') + ' ' + nombreAspirante;
            sessionStorage.setItem('nameFolder', nombreCarpetaDocumental);


            this.sgaMidService.get('persona/consultar_complementarios/' + this.info_persona_id)
            .subscribe( (res:any) => {
              if (res !== null && res.Response.Code !== '404') {
                this.info_info_caracteristica = <InfoCaracteristica>res.Response.Body[0].Data;

                //this.lugarOrigen = this.info_info_caracteristica.Lugar["Lugar"].CIUDAD.Nombre + ", " + this.info_info_caracteristica.Lugar["Lugar"].DEPARTAMENTO.Nombre

                this.sgaMidService.get('inscripciones/info_complementaria_tercero/' + this.info_persona_id)
                  .subscribe((resp:any) => {
                    if (resp.Response.Code == "200") {
                      let rawDate = this.info_info_persona.FechaNacimiento.split('-')
                      this.fechaNacimiento = rawDate[2].slice(0,2)+"/"+rawDate[1]+"/"+rawDate[0];
                      let info = resp.Response.Body[0];
                      this.correo = info.Correo;
                      this.direccion = info.DireccionResidencia;
                      this.telefono = info.Telefono;
                      this.telefonoAlt = info.TelefonoAlterno;
                      this.lugarOrigen = info.CiudadResidencia.Nombre + ", " + info.DepartamentoResidencia.Nombre;
                      this.addCargado(3);
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.infoFalla();
                    this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
                  });

                if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoDiscapacidad')){
                  this.idSoporteDiscapacidad = <number>this.info_info_caracteristica["IdDocumentoDiscapacidad"];
                  this.documentoService.get('documento/'+this.idSoporteDiscapacidad)
                    .subscribe((resp: any) => {
                      if(resp.Status && (resp.Status == "400" || resp.Status == "404")) {
                        this.infoFalla();
                      } else {
                        let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                        if (estadoDoc.aprobado === false) {
                          this.updateDocument = true;
                        }
                        this.docs_editados.emit(this.updateDocument);
                        this.tipoDiscapacidad = "";
                        let total = this.info_info_caracteristica.TipoDiscapacidad.length - 1;
                        this.info_info_caracteristica.TipoDiscapacidad.forEach((dis:any, i:any) => {
                          this.tipoDiscapacidad += dis.Nombre;
                          if(i < total){
                            this.tipoDiscapacidad += ", ";
                          }
                        });
                        this.docDiscapacidad = {
                          //Documento: response[0]["Documento"],
                          DocumentoId: resp.Id,
                          aprobado: estadoDoc.aprobado,
                          estadoObservacion: estadoDoc.estadoObservacion,
                          observacion: estadoDoc.observacion,
                          nombreDocumento: this.tipoDiscapacidad,
                          tabName: this.translate.instant('GLOBAL.comprobante_discapacidad'),
                          carpeta: "Información Básica"
                        }
                        this.zipManagerService.adjuntarArchivos([this.docDiscapacidad]);
                        this.addCargado(1);
                      }
                    },
                    (error: HttpErrorResponse) => {
                      this.infoFalla();
                      this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
                    }
                  );
                  /* this.newNuxeoService.get([{Id: this.idSoporteDiscapacidad}]).subscribe(
                    response => {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(response[0].Metadatos);
                      this.tipoDiscapacidad = "";
                      let total = this.info_info_caracteristica.TipoDiscapacidad.length - 1;
                      this.info_info_caracteristica.TipoDiscapacidad.forEach((dis, i) => {
                        this.tipoDiscapacidad += dis.Nombre;
                        if(i < total){
                          this.tipoDiscapacidad += ", ";
                        }
                      });
                      this.docDiscapacidad = {
                        Documento: response[0]["Documento"],
                        DocumentoId: response[0].Id,
                        aprobado: estadoDoc.aprobado,
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: this.tipoDiscapacidad,
                        tabName: this.translate.instant('GLOBAL.comprobante_discapacidad'),
                        carpeta: "Información Básica"
                      }
                      this.zipManagerService.adjuntarArchivos([this.docDiscapacidad]);
                      this.addCargado(1);
                    }
                  ) */
                } else {
                  this.addCargado(1);
                }

                if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoPoblacion')){
                  this.idSoportePoblacion = <number>this.info_info_caracteristica["IdDocumentoPoblacion"];
                  this.documentoService.get('documento/'+this.idSoportePoblacion)
                    .subscribe((resp: any) => {
                      if(resp.Status && (resp.Status == "400" || resp.Status == "404")) {
                        this.infoFalla();
                      } else {
                        let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                        if (estadoDoc.aprobado === false) {
                          this.updateDocument = true;
                        }
                        this.docs_editados.emit(this.updateDocument);
                        this.tipoPoblacion = "";
                        let total = this.info_info_caracteristica.TipoPoblacion.length - 1;
                        this.info_info_caracteristica.TipoPoblacion.forEach((dis:any, i:any) => {
                          this.tipoPoblacion += dis.Nombre;
                          if(i < total){
                            this.tipoPoblacion += ", ";
                          }
                        });
                        this.docPoblacion = {
                          //Documento: response[0]["Documento"],
                          DocumentoId: resp.Id,
                          aprobado: estadoDoc.aprobado,
                          estadoObservacion: estadoDoc.estadoObservacion,
                          observacion: estadoDoc.observacion,
                          nombreDocumento: this.tipoPoblacion,
                          tabName: this.translate.instant('GLOBAL.comprobante_poblacion'),
                          carpeta: "Información Básica"
                        }
                        this.zipManagerService.adjuntarArchivos([this.docPoblacion]);
                        this.addCargado(1);
                        }
                    }, (error: HttpErrorResponse) => {
                      this.infoFalla();
                      this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
                    }
                  );
                  /* this.newNuxeoService.get([{Id: this.idSoportePoblacion}]).subscribe(
                    response => {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(response[0].Metadatos);
                      this.tipoPoblacion = "";
                      let total = this.info_info_caracteristica.TipoPoblacion.length - 1;
                      this.info_info_caracteristica.TipoPoblacion.forEach((dis, i) => {
                        this.tipoPoblacion += dis.Nombre;
                        if(i < total){
                          this.tipoPoblacion += ", ";
                        }
                      });
                      this.docPoblacion = {
                        Documento: response[0]["Documento"],
                        DocumentoId: response[0].Id,
                        aprobado: estadoDoc.aprobado,
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: this.tipoPoblacion,
                        tabName: this.translate.instant('GLOBAL.comprobante_poblacion'),
                        carpeta: "Información Básica"
                      }
                      this.zipManagerService.adjuntarArchivos([this.docPoblacion]);
                      this.addCargado(1);
                    }
                  ) */
                } else {
                  this.addCargado(1);
                }
                
              } else {
                this.info_info_caracteristica = undefined;
                this.infoFalla();
              }
            },
            (error: HttpErrorResponse) => {
              this.infoFalla();
              this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
            })
          } else {
            this.info_info_persona = undefined;
            this.infoFalla();
          }
        },
          (error: HttpErrorResponse) => {
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
          });
    } else {
      this.info_info_persona = undefined
      this.infoFalla();
    }
  }

  verInfoCaracteristca(documento: any) {
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
      this.infoCarga.outInfo = {
        id: this.info_info_persona.Id,
        numeroDocId: this.info_info_persona.NumeroIdentificacion,
        nombre: this.info_info_persona["NombreCompleto"],
        tipoDoc: this.info_info_persona.TipoIdentificacion.Nombre.toLowerCase(),
        telefono: this.telefono,
        correo: this.correo,
      }
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}
