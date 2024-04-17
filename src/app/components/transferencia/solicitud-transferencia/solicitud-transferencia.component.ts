import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA, FORM_RESPUESTA_SOLICITUD } from '../../../models/transferencia/forms-transferencia';
import { ActivatedRoute, Router } from '@angular/router';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UserService } from 'src/app/services/users.service';
 import * as moment from 'moment';
import { TransferenciaInternaReintegro } from 'src/app/models/inscripcion/transferencia_reintegro';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit {
  formTransferencia: any;
  formRespuesta: any;
  sub:any = null;
  uid:any = null;
  nivelNombre!: string;
  nivel!: string;
  tipo!: string;
  periodo!: string;
  dataTransferencia: any = null;
  terminadaInscripcion: boolean = false;
  solicitudCreada: boolean = false;
  mostrarDocumento: boolean = true;
  solicitudId: any;
  inscriptionSettings: any = null;
  process!: string;
  loading!: boolean;
  file: any;
  idFileDocumento: any;
  proyectosCurriculares!: any[];
  codigosEstudiante!: any[];
  id: any;
  estado: any;
  nombreEstudiante: any;
  codigoEstudiante: any;
  documentoEstudiante: any;
  nombreCordinador: any;
  rolCordinador: any;
  comentario!: string;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private nuxeo: NewNuxeoService,
    private autenticationService: ImplicitAutenticationService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_SOLICITUD_TRANSFERENCIA;
    this.formRespuesta = FORM_RESPUESTA_SOLICITUD;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
      this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
    this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
  }

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { id, process } = params.params;
      this.process = atob(process);
      this.id = id

      this.loading = true;
      this.loadSolicitud();

      if (this.process === 'all') {
        this.loadInfoPersona();
        this.loadEstados();
      }

    })
  }

  ocultarCampo(campo:any, ocultar:any) {
    this.formTransferencia.campos[campo].ocultar = ocultar;
    this.formTransferencia.campos[campo].requerido = !ocultar;
  }

  getIndexFormTrans(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getIndexFormRes(nombre: String): number {
    for (let index = 0; index < this.formRespuesta.campos.length; index++) {
      const element = this.formRespuesta.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  loadInfoPersona(): void {
    this.loading = true;
    this.uid = this.userService.getPersonaId();

    this.autenticationService.getRole().then((rol: any) => {
      if (rol.includes('COORDINADOR') || rol.includes('COORDINADOR_PREGADO') || rol.includes('COORDINADOR_POSGRADO')) {
        this.rolCordinador = 'COORDINADOR';
      }
    });

    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.uid).subscribe((res: any) => {
        this.loading = true;
        if (res !== null) {
          this.nombreCordinador = res.NombreCompleto;
        }
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.info_persona'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else {
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  loadSolicitud() {
    this.loading = true;
    this.sgaMidService.get('transferencia/inscripcion/' + this.id).subscribe((inscripcion:any) => {
      if (inscripcion !== null) {
        if (inscripcion.Success) {
          this.loading = true;

          this.periodo = inscripcion['Data']['Periodo']['Nombre'];
          this.nivelNombre = inscripcion['Data']['Nivel']['Nombre'];
          this.nivel = inscripcion['Data']['Nivel']['Id'];
          this.tipo = inscripcion['Data']['TipoInscripcion']['Nombre'];

          this.formTransferencia.campos.forEach((campo:any) => {
            delete campo.deshabilitar;
          });
          this.formTransferencia.btn = 'Guardar';

          const origen = this.getIndexFormTrans('ProgramaOrigen');
          const origenExterno = this.getIndexFormTrans('ProgramaOrigenInput');
          const estudiante = this.getIndexFormTrans('CodigoEstudiante');
          const estudianteExterno = this.getIndexFormTrans('CodigoEstudianteExterno');
          const destino = this.getIndexFormTrans('ProgramaDestino');
          const universidad = this.getIndexFormTrans('UniversidadOrigen');
          const cancelo = this.getIndexFormTrans('Cancelo');
          const acuerdo = this.getIndexFormTrans('Acuerdo');
          const creditos = this.getIndexFormTrans('CantidadCreditos');
          const ultimo = this.getIndexFormTrans('UltimoSemestre');

          this.formTransferencia.campos[destino].valor = inscripcion['Data']['ProgramaDestino'];
          this.formTransferencia.campos[destino].deshabilitar = true;

          this.ocultarCampo(acuerdo, true);
          this.formTransferencia.campos[cancelo].ocultar = true;
          this.formTransferencia.campos[creditos].claseGrid = 'col-sm-6 col-xs-6';
          this.formTransferencia.campos[ultimo].claseGrid = 'col-sm-6 col-xs-6';

          if (this.tipo === 'Transferencia externa') {
            this.ocultarCampo(estudianteExterno, false);
            this.ocultarCampo(estudiante, true);

            this.ocultarCampo(origenExterno, false);
            this.ocultarCampo(origen, true);

            this.formTransferencia.campos[universidad].deshabilitar = false;
          } else {
            this.ocultarCampo(estudianteExterno, true);
            this.ocultarCampo(estudiante, false);

            this.ocultarCampo(origenExterno, true);
            this.ocultarCampo(origen, false);

            this.formTransferencia.campos[universidad].deshabilitar = true;
            this.formTransferencia.campos[universidad].valor = 'Universidad Distrital Francisco José de Caldas'

            this.formTransferencia.campos[estudiante].deshabilitar = false;
            this.formTransferencia.campos[estudiante].opciones = inscripcion['Data']['CodigoEstudiante'];

            this.formTransferencia.campos[origen].deshabilitar = false;
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCurricular'];
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCodigo'];

            if (this.tipo === 'Reingreso') {
              this.ocultarCampo(acuerdo, false);
              this.formTransferencia.campos[cancelo].ocultar = false;

              inscripcion['Data']['CodigoEstudiante'].forEach((codigo:any) => {
                if (codigo.IdProyecto === inscripcion['Data']['ProgramaDestino']['Id']) {
                  this.formTransferencia.campos[estudiante].valor = codigo;
                  this.formTransferencia.campos[estudiante].deshabilitar = true;
                }
              });

              this.formTransferencia.campos[origen].valor = inscripcion['Data']['ProgramaDestino'];
              this.formTransferencia.campos[origen].deshabilitar = true;
            }
          }

          if (inscripcion.Data.SolicitudId) {
            this.estado = inscripcion['Data']['Estado']['Nombre'];
            let data = {
              Cancelo: inscripcion['Data']['DatosInscripcion']['CanceloSemestre'],
              Acuerdo: inscripcion['Data']['DatosInscripcion']['SolicitudAcuerdo'],
              CantidadCreditos: inscripcion['Data']['DatosInscripcion']['CantidadCreditos'],
              CodigoEstudiante: inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'],
              CodigoEstudianteExterno: inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'],
              SoporteDocumento: inscripcion['Data']['DatosInscripcion']['DocumentoId'],
              MotivoCambio: inscripcion['Data']['DatosInscripcion']['MotivoRetiro'],
              UltimoSemestre: inscripcion['Data']['DatosInscripcion']['UltimoSemestreCursado'],
              ProgramaOrigen: inscripcion['Data']['DatosInscripcion']['ProyectoCurricularProviene'],
              ProgramaOrigenInput: inscripcion['Data']['DatosInscripcion']['ProyectoCurricularProviene'],
              UniversidadOrigen: inscripcion['Data']['DatosInscripcion']['UniversidadProviene'],
              ProgramaDestino: inscripcion['Data']['ProgramaDestino'],
            }
            if (!(this.tipo === 'Transferencia externa')) {
              data.UniversidadOrigen = 'Universidad Distrital Francisco José de Caldas';
              if (this.tipo === 'Reingreso') {
                data.ProgramaOrigen = data.ProgramaDestino;
              }
            }
            this.dataTransferencia = data;

            this.nombreEstudiante = inscripcion['Data']['DatosEstudiante']['Nombre'];
            this.documentoEstudiante = inscripcion['Data']['DatosEstudiante']['Identificacion'];
            this.codigoEstudiante = inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'];
            this.solicitudId = inscripcion['Data']['SolicitudId'];

            if ((inscripcion['Data']['Estado']['Nombre'] !== 'Requiere modificación' && this.process === 'my') || this.process === 'all') {
              this.formTransferencia.campos[this.getIndexFormTrans('SoporteDocumento')].ocultar = true;
              // this.formTransferencia.campos[origenExterno].ocultar = true;
              this.solicitudCreada = true;
              this.mostrarDocumento = true;
              this.formTransferencia.campos.forEach((campo:any) => {
                campo.deshabilitar = true;
              });
              this.formTransferencia.btn = '';

              this.file = {
                id: inscripcion['Data']['DatosInscripcion']['DocumentoId'],
                label: this.translate.instant('inscripcion.' + 'placeholder_soportes_documentos')
              }
            } else {
              this.formTransferencia.campos[origen].deshabilitar = true;
              this.formTransferencia.campos[origenExterno].deshabilitar = true;
              this.solicitudCreada = true;
              this.mostrarDocumento = false;
              this.comentario = inscripcion['Data']['DatosRespuesta']['Observacion'];

              this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
                basic_info_button: true,
                hide_header_labels: true,
                formacion_academica_button: true,
                documentos_programa_button: true,
                select_tipo: this.tipo,
                nivel: this.nivelNombre,
                detalle_inscripcion: true,
                es_transferencia: true,
              } : {
                basic_info_button: true,
                hide_header_labels: true,
                formacion_academica_button: true,
                documentos_programa_button: true,
                select_tipo: this.tipo,
                nivel: this.nivelNombre,
                detalle_inscripcion: true,
                experiencia_laboral: true,
                produccion_academica: true,
                es_transferencia: true,
              }

              const SoporteDocumento = this.getIndexFormTrans('SoporteDocumento');

              this.formTransferencia.campos[SoporteDocumento].ocultar = false;
              this.idFileDocumento = inscripcion['Data']['DatosInscripcion']['DocumentoId'];
              this.nuxeo.get([{ 'Id': this.idFileDocumento }]).subscribe((file:any) => {
                this.formTransferencia.campos[SoporteDocumento].urlTemp = file[0]['url'] + '';
                this.formTransferencia.campos[SoporteDocumento].valor = file[0]['url'] + '';
              })
            }

            if (inscripcion.Data.DatosRespuesta) {
              const EstadoId = this.getIndexFormRes('EstadoId');
              const FechaEspecifica = this.getIndexFormRes('FechaEspecifica');
              const Observacion = this.getIndexFormRes('Observacion');
              const SoporteRespuesta = this.getIndexFormRes('SoporteRespuesta');

              if (inscripcion.Data.Estado.Nombre != "Pago" || inscripcion.Data.Estado.Nombre != "Solicitado") {
                this.formRespuesta.campos[EstadoId].valor = inscripcion.Data.Estado;
              }
              this.formRespuesta.campos[FechaEspecifica].valor = inscripcion.Data.DatosRespuesta.FechaEvaluacion.slice(0, -4);
              this.formRespuesta.campos[Observacion].valor = inscripcion.Data.DatosRespuesta.Observacion;
              this.idFileDocumento = inscripcion.Data.DatosRespuesta.DocRespuesta
              this.nuxeo.get([{ 'Id': this.idFileDocumento }]).subscribe((file:any) => {
                this.formRespuesta.campos[SoporteRespuesta].urlTemp = file[0]['url'] + '';
                this.formRespuesta.campos[SoporteRespuesta].valor = file[0]['url'] + '';
              })
            }

          } else {
            this.formTransferencia.campos[this.getIndexFormTrans('SoporteDocumento')].ocultar = false;
          }

          this.loading = false;
          this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            es_transferencia: true,
          } : {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            experiencia_laboral: true,
            produccion_academica: true,
            es_transferencia: true,
          }
          this.loading = false;
        }
      }
    });
  }

  loadEstados() {
    this.loading = true;
    this.sgaMidService.get('transferencia/estados').subscribe((estados:any) => {
      if (estados !== null) {
        if (estados.Success) {
          const respuesta = this.getIndexFormRes('Respuesta');

          this.formRespuesta.campos[respuesta].opciones = estados['Data'].filter((estado:any) => estado.Nombre != 'Radicada' && estado.Nombre != 'Solicitado');

          this.loading = false;
        }
      }
    });
  }

  goback() {
    this.router.navigate([`transferencia/${btoa(this.process)}`])
  }

  generarMatricula() {
    const opt:any = {
      title: this.translate.instant('En desarrollo'),
      html: `Generación de recibos de matricula en desarrollo`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK', // texto del botón de confirmación
      cancelButtonText: 'Cancelar' // texto del botón de cancelación
    };
    Swal.fire(opt);
  }

  send() {
    this.loading = true;

    const hoy = new Date();
    const inscripcionPut = {
      'EstadoId': 15,
      'FechaRespuesta': moment().format('YYYY-MM-DD hh:mm:ss'),
      'TerceroId': this.userService.getPersonaId(),
      'EstadoAbreviacion': 'INSCREAL'
    }

    this.sgaMidService.put('transferencia/actualizar_estado/' + this.solicitudId, inscripcionPut).subscribe((response: any) => {
      this.loading = false;
      const r_ins = <any>response;
      if (response !== null && r_ins.Type !== 'error') {
        this.loading = false;
        this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
        this.router.navigate([`pages/inscripcion/transferencia/${btoa(this.process)}`])
      }
    },
      (error: any) => {
        this.loading = false;
        if (error.System.Message.includes('duplicate')) {
          Swal.fire({
            icon: 'info',
            text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

          });
        } else {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.actualizar') + '-' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      });
  }

  validarFormRespuesta(event:any) {
    const FechaEspecifica = this.getIndexFormRes('FechaEspecifica');
    if (event.nombre === 'EstadoId') {
      if (event.valor.Nombre !== 'Prueba especifica') {
        this.formRespuesta.campos[FechaEspecifica].deshabilitar = true;
        this.formRespuesta.campos[FechaEspecifica].valor = '';
      } else {
        this.formRespuesta.campos[FechaEspecifica].deshabilitar = false;
      }
    }
  }

  async validarForm(event:any) {
    if (event.valid) {
      let files: any;
      const element = event.data.dataTransferencia.SoporteDocumento;
      if (typeof element.file !== 'undefined' && element.file !== null) {
        this.loading = true;
        const file = {
          file: await this.nuxeo.fileToBase64(element.file),
          IdTipoDocumento: element.IdDocumento,
          metadatos: {
            NombreArchivo: element.nombre,
            Tipo: 'Archivo',
            Observaciones: element.nombre,
            'dc:title': element.nombre,
          },
          descripcion: element.nombre,
          nombre: element.nombre,
          key: 'Documento',
        }
        files = file;
      } else if (this.idFileDocumento) {
        files = this.idFileDocumento;
      }

      const data = {
        'InscripcionId': parseInt(this.id),
        'Codigo_estudiante': this.tipo == 'Reingreso' ? parseFloat(event.data.dataTransferencia.CodigoEstudiante.Codigo) :
          this.tipo == 'Transferencia interna' ? event.data.dataTransferencia.CodigoEstudiante.Codigo :
            event.data.dataTransferencia.CodigoEstudianteExterno,
        'Motivo_retiro': event.data.dataTransferencia.MotivoCambio,
        'Cantidad_creditos': event.data.dataTransferencia.CantidadCreditos,
        'Tipo': this.tipo,
        'Proyecto_origen': event.data.dataTransferencia.ProgramaOrigen ? event.data.dataTransferencia.ProgramaOrigen.Id : event.data.dataTransferencia.ProgramaOrigenInput,
        'Universidad': event.data.dataTransferencia.UniversidadOrigen,
        'Ultimo_semestre': event.data.dataTransferencia.UltimoSemestre,
        'Interna': this.tipo == 'Transferencia interna',
        'Acuerdo': event.data.dataTransferencia.Acuerdo == true,
        'Cancelo': event.data.dataTransferencia.Cancelo == true,
        'Documento': files,
        'SolicitanteId': this.userService.getPersonaId(),
        'FechaRadicacion': moment().format('YYYY-MM-DD hh:mm:ss'),
      }

      if (this.estado === 'Requiere modificación') {
        this.sgaMidService.put('transferencia/' + this.solicitudId, data).subscribe(
          (res:any) => {
            const r = <any>res.Response
            if (r !== null && r.Type !== 'error') {
              this.loading = false;
              // this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.solicitud_generada')).then(cerrado => {
              //   this.ngOnInit();
              //   this.goback();
              // });
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_solicitud'));
              this.loading = false;
            }
          }, error => {
            this.loading = false;
          }
        );
      } else {
        this.sgaMidService.post('transferencia', data).subscribe(
          (res:any) => {
            const r = <any>res.Response
            if (r !== null && r.Type !== 'error') {
              this.loading = false;
              // this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.solicitud_generada')).then((cerrado:any) => {
              //   this.ngOnInit();
              // });
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_solicitud'));
              this.loading = false;
            }
          }, error => {
            this.loading = false;
          }
        );
      }

    }
  }

  async respuestaForm(event:any) {
    if (event.valid) {
      let files: any;

      const element = event.data.Respuesta.SoporteRespuesta;
      if (typeof element.file !== 'undefined' && element.file !== null) {
        this.loading = true;
        const file = {
          file: await this.nuxeo.fileToBase64(element.file),
          IdTipoDocumento: element.IdDocumento,
          metadatos: {
            NombreArchivo: element.nombre,
            Tipo: 'Archivo',
            Observaciones: element.nombre,
            'dc:title': element.nombre,
          },
          descripcion: element.nombre,
          nombre: element.nombre,
          key: 'Documento',
        }
        files = file;
      } else if (this.idFileDocumento) {
        files = this.idFileDocumento;
      }

      const hoy = new Date();
      let Respuesta:any = {
        DocRespuesta: files,
        FechaEspecifica: null,
        FechaRespuesta: moment(`${hoy.getFullYear()}-${hoy.getMonth()}-${hoy.getDate()}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
        TerceroResponasble: this.uid,
        EstadoId: event.data.Respuesta.EstadoId,
        Comentario: event.data.Respuesta.Observacion
      };

      if (event.data.Respuesta.FechaEspecifica != '') {
        Respuesta.FechaEspecifica = moment(event.data.Respuesta.FechaEspecifica).format('YYYY-MM-DD hh:mm:ss');
      }

      this.sgaMidService.put('transferencia/respuesta_solicitud/' + this.solicitudId, Respuesta).subscribe(
        (res: any) => {
          if (res !== null && res.Response.Code === '200') {
            this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
              this.translate.instant('GLOBAL.operacion_exitosa'));
            this.loading = false;
          } else {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_res_solicitud'));
          }
        }, error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  prueba(event:any) {
    console.log(event)
  }
}
