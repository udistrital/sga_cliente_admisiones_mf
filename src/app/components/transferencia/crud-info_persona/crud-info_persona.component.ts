import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_INFO_PERSONA } from './form-info_persona';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { IAppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ListService } from 'src/app/store/services/list.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';
import { UtilidadesService } from 'src/app/services/utilidades.service';

@Component({
  selector: 'ngx-crud-info-persona',
  templateUrl: './crud-info_persona.component.html',
  styleUrls: ['./crud-info_persona.component.scss'],
})
export class CrudInfoPersonaComponent implements OnInit {
  filesUp: any;
  info_persona_id!: number;
  inscripcion_id!: number;
  loading: boolean = false;
  faltandatos: boolean = false;
  existePersona: boolean = false;
  datosEncontrados: any;
  forzarCambioUsuario: boolean = false;

  @Input('info_persona_id')
  set persona(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoPersona();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.loadInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('success') success: EventEmitter<any> = new EventEmitter();

  info_info_persona: any;
  formInfoPersona: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean!: boolean;
  percentage!: number;
  aceptaTerminos: boolean = false;
  programa!: number;
  aspirante!: number;
  periodo: any;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private sgamidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
      this.formInfoPersona = UtilidadesService.hardCopy(FORM_INFO_PERSONA);
      this.construirForm();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
      this.loading = true;
      Promise.all([
      this.listService.findGenero(),
      this.listService.findOrientacionSexual(),
      this.listService.findIdentidadGenero(),
      this.listService.findEstadoCivil(),
      this.listService.findTipoIdentificacion()]).then(() => {
        this.loadLists();
      });
  }

  construirForm() {
    // this.formInfoPersona.titulo = this.translate.instant('GLOBAL.info_persona');
    this.formInfoPersona.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoPersona.campos.length; i++) {
      this.formInfoPersona.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoPersona.campos[i].label_i18n);
      this.formInfoPersona.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInfoPersona.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoPersona.campos.length; index++) {
      const element = this.formInfoPersona.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public async loadInfoPersona() {
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '' && this.info_persona_id.toString() !== '0') {
      await this.sgamidService.get('persona/consultar_persona/' + this.info_persona_id)
        .subscribe((res:any) => {
          if (res !== null && res.Id !== undefined) {
            const temp = <InfoPersona>res;
            this.aceptaTerminos = true;
            this.info_info_persona = temp;
            this.datosEncontrados = {...res}
            const files = []
            this.formInfoPersona.btn = '';
            if (temp.Genero.Nombre != "NO APLICA") {
              this.formInfoPersona.campos[this.getIndexForm('Genero')].valor = temp.Genero;
            }
            this.formInfoPersona.campos[this.getIndexForm('EstadoCivil')].valor = temp.EstadoCivil;
            this.formInfoPersona.campos[this.getIndexForm('TipoIdentificacion')].valor = temp.TipoIdentificacion;
            if (temp.FechaNacimiento != null) {
              temp.FechaNacimiento = temp.FechaNacimiento.replace("T00:00:00Z", "T05:00:00Z");
              this.formInfoPersona.campos[this.getIndexForm('FechaNacimiento')].valor = moment(temp.FechaNacimiento,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
            }
            if (temp.FechaExpedicion != null) {
              temp.FechaExpedicion = temp.FechaExpedicion.replace("T00:00:00Z", "T05:00:00Z");
              this.formInfoPersona.campos[this.getIndexForm('FechaExpedicion')].valor = moment(temp.FechaExpedicion,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
            }
            this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'),1);
            this.formInfoPersona.campos.forEach((campo:any) => {
              campo.deshabilitar = true;
            });
            if (temp.Telefono == null || temp.Telefono == undefined) {
              this.popUpManager.showAlert(this.translate.instant('GLOBAL.info_persona'),this.translate.instant('inscripcion.sin_telefono'))
            }
          }
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'info',
            title: this.translate.instant('GLOBAL.info_persona'),
            text: this.translate.instant('GLOBAL.no_info_persona'),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.info_persona'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else {
      this.info_info_persona = undefined
      this.clean = !this.clean;
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
    this.formInfoPersona.campos[this.getIndexForm('CorreoElectronico')].valor = this.autenticationService.getPayload().email;
  }

  checkExistePersona(e:any) {
    let doc = this.formInfoPersona.campos[this.getIndexForm('NumeroIdentificacion')].valor;
    let verif = this.formInfoPersona.campos[this.getIndexForm('VerificarNumeroIdentificacion')].valor
    if((doc && verif) && (doc == verif) && !this.aceptaTerminos) {
      this.loading = true;
      this.sgamidService.get('persona/existe_persona/'+doc).subscribe(
        (res:any) => {
          this.loading = false;
          this.info_info_persona = res[0];
          this.datosEncontrados = {...res[0]};
          if (res[0].FechaNacimiento != null) {
            res[0].FechaNacimiento = res[0].FechaNacimiento.replace("T00:00:00Z", "T05:00:00Z");
            this.formInfoPersona.campos[this.getIndexForm('FechaNacimiento')].valor = moment(res[0].FechaNacimiento,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
          }
          if (res[0].FechaExpedicion != null) {
            res[0].FechaExpedicion = res[0].FechaExpedicion.replace("T00:00:00Z", "T05:00:00Z");
            this.formInfoPersona.campos[this.getIndexForm('FechaExpedicion')].valor = moment(res[0].FechaExpedicion,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
          }
          if (res[0].Genero.Nombre != "NO APLICA") {
            this.formInfoPersona.campos[this.getIndexForm('Genero')].valor = res[0].Genero;
          }
          
          this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'),1);

          this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.persona_ya_existe'), this.translate.instant('inscripcion.info_persona_ya_existe'),'info',false).then(()=>{
            this.formInfoPersona.campos.forEach((campo:any) => {
              if(campo.valor){
                campo.deshabilitar = true;
                if(campo.nombre == "EstadoCivil" || campo.nombre == "OrientacionSexual" || campo.nombre == "IdentidadGenero"){
                  campo.deshabilitar = false;
                }
              }
            });
            let UsuarioExistente = <string>this.info_info_persona.UsuarioWSO2;
            let correoActual = <string>this.autenticationService.getPayload().email;
            if (UsuarioExistente.match(UtilidadesService.ListaPatrones.correo)) {
              if (UsuarioExistente != correoActual) {
                this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.info_persona'), this.translate.instant('inscripcion.ya_existe_usuarioCorreo') + '<br>'
                                                  + this.translate.instant('inscripcion.correo_anterior') + ': ' + UsuarioExistente + '<br>'
                                                  + this.translate.instant('inscripcion.correo_actual') + ': ' + correoActual, 'info', true).then(
                  action => {
                    if (action.value) {
                      this.forzarCambioUsuario = true;
                    } else {
                      this.autenticationService.logout('from inscripcion');
                    }
                  }
                );
              }
            } else {
              this.forzarCambioUsuario = true;
            }
          });
          this.existePersona = true;
        },
        (error:any) => {
          console.log(error);
          this.loading = false;
        }
      );
    }
  }

  updateInfoPersona(infoPersona: any) {
    this.loading = true;
    let prepareUpdate: any = {
      Tercero: { hasId: null, data: {} },
      Identificacion: { hasId: null, data: {} },
      Complementarios: {
        Genero: { hasId: null, data: {} },
        EstadoCivil: { hasId: null, data: {} },
        OrientacionSexual: { hasId: null, data: {} },
        IdentidadGenero: { hasId: null, data: {} },
        Telefono: { hasId: null, data: {} },
      } 
    }

    prepareUpdate.Tercero.hasId = infoPersona.Id;

    if(!this.datosEncontrados.PrimerNombre) {
      prepareUpdate.Tercero.data["PrimerNombre"] = infoPersona.PrimerNombre;
    }
    if(!this.datosEncontrados.SegundoNombre) {
      prepareUpdate.Tercero.data["SegundoNombre"] = infoPersona.SegundoNombre;
    }
    if(!this.datosEncontrados.PrimerApellido) {
      prepareUpdate.Tercero.data["PrimerApellido"] = infoPersona.PrimerApellido;
    }
    if(!this.datosEncontrados.SegundoApellido) {
      prepareUpdate.Tercero.data["SegundoApellido"] = infoPersona.SegundoApellido;
    }
    if(!this.datosEncontrados.FechaNacimiento) {
      prepareUpdate.Tercero.data["FechaNacimiento"] = momentTimezone.tz(infoPersona.FechaNacimiento, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
    }
    if(!this.datosEncontrados.UsuarioWSO2 || this.forzarCambioUsuario) {
      prepareUpdate.Tercero.hasId = infoPersona.Id;
      prepareUpdate.Tercero.data["UsuarioWSO2"] = this.autenticationService.getPayload().email;
    }

    if(!this.datosEncontrados.FechaExpedicion) {
      prepareUpdate.Identificacion.hasId = this.datosEncontrados.IdentificacionId;
      prepareUpdate.Identificacion.data = {
        FechaExpedicion: momentTimezone.tz(infoPersona.FechaExpedicion, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000',
      }
    }

    if(this.datosEncontrados.hasOwnProperty('Genero')){
      prepareUpdate.Complementarios.Genero.hasId = this.datosEncontrados.GeneroId;
    }
    prepareUpdate.Complementarios.Genero.data = infoPersona.Genero;

    if(this.datosEncontrados.hasOwnProperty('EstadoCivil')){
      prepareUpdate.Complementarios.EstadoCivil.hasId = this.datosEncontrados.EstadoCivilId;
    }
    prepareUpdate.Complementarios.EstadoCivil.data = infoPersona.EstadoCivil;

    if(this.datosEncontrados.hasOwnProperty('OrientacionSexual')){
      prepareUpdate.Complementarios.OrientacionSexual.hasId = this.datosEncontrados.OrientacionSexualId;
    }
    prepareUpdate.Complementarios.OrientacionSexual.data = infoPersona.OrientacionSexual;

    if(this.datosEncontrados.hasOwnProperty('IdentidadGenero')){
      prepareUpdate.Complementarios.IdentidadGenero.hasId = this.datosEncontrados.IdentidadGeneroId;
    }
    prepareUpdate.Complementarios.IdentidadGenero.data = infoPersona.IdentidadGenero;

    if(this.datosEncontrados.hasOwnProperty('Telefono')){
      prepareUpdate.Complementarios.Telefono.hasId = this.datosEncontrados.TelefonoId;
    }
    let dataTel = {principal: infoPersona.Telefono, alterno: this.datosEncontrados.TelefonoAlterno? this.datosEncontrados.TelefonoAlterno : null}
    prepareUpdate.Complementarios.Telefono.data = JSON.stringify(dataTel);

    this.sgamidService.put('persona/actualizar_persona',prepareUpdate).subscribe((response:any) => {
      this.faltandatos = false;
      this.existePersona = false;
      this.formInfoPersona.btn = '';
      this.formInfoPersona.campos.forEach((campo:any) => {
        campo.deshabilitar = true;
      });
      window.localStorage.setItem('ente', response.tercero.Id);
      window.localStorage.setItem('persona_id', response.tercero.Id);
      this.info_persona_id = response.tercero.Id;
      sessionStorage.setItem('IdTercero', String(this.info_persona_id));
      this.setPercentage(1);
      this.loading = false;
      this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.persona_actualizado'));
      this.success.emit();
    },
    (error: HttpErrorResponse) => {
      this.loading = false;
      this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_actualizar_persona'));
    });
  }

  createInfoPersona(infoPersona: any): void {
    this.loading = true;
    const files = []
    infoPersona.FechaNacimiento = momentTimezone.tz(infoPersona.FechaNacimiento, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    infoPersona.FechaNacimiento = infoPersona.FechaNacimiento + ' +0000 +0000';
    infoPersona.FechaExpedicion = momentTimezone.tz(infoPersona.FechaExpedicion, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    infoPersona.FechaExpedicion = infoPersona.FechaExpedicion + ' +0000 +0000';
    infoPersona.NumeroIdentificacion = (infoPersona.NumeroIdentificacion).toString();
    infoPersona.Usuario = this.autenticationService.getPayload().email;
    this.sgamidService.post('persona/guardar_persona', infoPersona).subscribe(res => {
      const r = <any>res
      if (r !== null && r.Type !== 'error') {
        window.localStorage.setItem('ente', r.Id);
        window.localStorage.setItem('persona_id', r.Id);
        this.info_persona_id = r.Id;
        sessionStorage.setItem('IdTercero', String(this.info_persona_id));
        this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'),1);
        this.formInfoPersona.btn = '';
        this.formInfoPersona.campos.forEach((campo:any) => {
          campo.deshabilitar = true;
        });
        this.setPercentage(1);
        this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.persona_creado'));
        this.success.emit();
      } else {
        this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'))
      }
      this.loading = false;
    },
    (error: HttpErrorResponse) => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        footer: this.translate.instant('GLOBAL.crear') + '-' +
                this.translate.instant('GLOBAL.info_persona'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  ngOnInit() {
  }

  validarForm(event:any) {
    if (event.valid) {
      if (this.info_inscripcion === undefined) {
         this.validarTerminos(event);
      } else {
        if (this.info_inscripcion.AceptaTerminos !== true) {
         this.validarTerminos(event);
        } else {
          this.formInfoPersona.btn = '';
        }
      }
    }
  }

  validarTerminos(event:any) {
    Swal.fire({
      title: this.translate.instant('GLOBAL.terminos_datos'),
      width: 800,
      allowOutsideClick: false,
      allowEscapeKey: true,
      html: '<embed src="/assets/pdf/politicasUD.pdf" type="application/pdf" style="width:100%; height:375px;" frameborder="0"></embed>',
      input: 'checkbox',
      inputPlaceholder: this.translate.instant('GLOBAL.acepto_terminos'),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    })
      .then((result) => {
        if (result.value) {
            this.aceptaTerminos = true;
            if(this.existePersona || this.faltandatos){
              this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.actualizar'),this.translate.instant('GLOBAL.actualizar_info_persona'),'warning',true)
                .then((action) => {
                  if (action.value) {
                    this.updateInfoPersona(event.data.InfoPersona);
                  } else {
                    this.aceptaTerminos = false;
                  }
                });
            } else {
              this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.crear'),this.translate.instant('GLOBAL.crear_info_persona'),'warning',true)
                .then((action) => {
                    if (action.value) {
                      this.createInfoPersona(event.data.InfoPersona);
                    } else {
                      this.aceptaTerminos = false;
                    }
                });
            }
        } else if (result.value === 0) {
          Swal.fire({
            icon: 'error',
            text: this.translate.instant('GLOBAL.rechazo_terminos'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
          this.aceptaTerminos = false;
        }
      });
  }

  setPercentage(event:any) {
    if (this.aceptaTerminos) {
      this.percentage = event;
    } else {
      this.percentage = event*0.98;
    }
    this.result.emit(this.percentage);
    if(event < 1.0) {
      this.formInfoPersona.campos.forEach((campo:any) => {
        if(!campo.valor) {
          campo.deshabilitar = false;
        }
      });
      this.formInfoPersona.btn = this.translate.instant('GLOBAL.guardar');
      this.faltandatos = true;
    }
  }

  public loadLists() {
    this.store.select((state:any) => state).subscribe(
      (list:any) => {
        this.formInfoPersona.campos[this.getIndexForm('Genero')].opciones = (<any>list.listGenero[0]).filter((g:any) => g.Nombre != "NO APLICA");
        this.formInfoPersona.campos[this.getIndexForm('EstadoCivil')].opciones = list.listEstadoCivil[0];
        this.formInfoPersona.campos[this.getIndexForm('TipoIdentificacion')].opciones = list.listTipoIdentificacion[0];
        this.formInfoPersona.campos[this.getIndexForm('OrientacionSexual')].opciones = list.listOrientacionSexual[0];
        this.formInfoPersona.campos[this.getIndexForm('IdentidadGenero')].opciones = list.listIdentidadGenero[0];
      },
    );
  }

}
