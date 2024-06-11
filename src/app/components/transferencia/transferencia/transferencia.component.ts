import { Component, OnInit, ViewChild } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
//import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../customize-button/customize-button.component';
import { FORM_TRANSFERENCIA_INTERNA } from 'src/app/models/transferencia/forms-transferencia';
import { ActivatedRoute, Router } from "@angular/router";
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransferenciaInterna } from 'src/app/models/transferencia/transferencia_interna';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { HttpErrorResponse } from '@angular/common/http';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { UserService } from 'src/app/services/users.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Periodo } from 'src/app/models/periodo/periodo';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosTransferenciasComponent } from '../dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';


@Component({
  selector: 'transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  formTransferencia: any = null;
  listadoSolicitudes: boolean = false;
  actions: boolean = true;
  recibo: boolean = false;
  settings: any = null;
  uid: any = null;
  dataSourceColum = ["#recibo", "concepto", "programa", "fechageneracion", "estado", "solicitar"]
  dataSource!: MatTableDataSource<any>;
  sub: any;
  process: string = '';
  loading!: boolean;
  info_info_persona!: any;
  inscripcionProjects!: any[];
  proyectos: any = [];
  proyectosCurriculares!: any[];
  codigosEstudiante!: any[];
  parametros_pago: any;
  periodo!: Periodo;
  periodos: any = [];
  selectednivel: any;
  proyectos_selected: any;
  niveles!: NivelFormacion[];
  show_listado = false;
  selectprograma: boolean = true;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);

  dataTransferencia: any = {
    Periodo: null,
    CalendarioAcademico: null,
    TipoInscripcion: null,
    CodigoEstudiante: null,
    ProyectoCurricular: null,
  };

  constructor(
    private _Activatedroute: ActivatedRoute,
    private autenticationService: ImplicitAutenticationService,
    private inscripcionMidService: InscripcionMidService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private router: Router,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private terceroMidService: TerceroMidService,
    private translate: TranslateService,
    private userService: UserService,
    private utilidades: UtilidadesService

  ) {
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
  }

  construirForm() {
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
    this.formTransferencia.campos.forEach((campo: any) => {
      if (campo.nombre === 'Periodo') {
        campo.valor = campo.opciones[0];
      }
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };

    this.loadInfoPersona();

    this.dataSource = new MatTableDataSource();
    this.sub = this._Activatedroute.paramMap.subscribe(async (params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.actions = (this.process === 'my');
    });
    this.cargarPeriodo();
    this.nivel_load()
  }


  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  changePeriodo() {
    this.CampoControl.setValue('');
    this.Campo1Control.setValue('');
  }

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null && nivel.Nombre === 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  async loadInfoPersona() {
    this.uid = await this.userService.getPersonaId();
    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.terceroMidService.get('personas/' + this.uid).subscribe((res: any) => {
        if (res !== null) {
          const temp = <InfoPersona>res.Data;
          this.info_info_persona = temp;
          const files = [];
        }
      });
    } else {
      this.info_info_persona = undefined
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  loadProyectos() {
    this.show_listado = false;
    this.selectprograma = false;
    this.proyectos = [];
    if (!Number.isNaN(this.selectednivel) && this.selectednivel !== undefined) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.autenticationService.getRole().then(
            (rol: any) => {
              let r = rol.find((role: any) => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
              if (r) {
                this.proyectos = <any[]>response.filter(
                  (proyecto: any) => this.filtrarProyecto(proyecto),
                );
              } else {
                const id_tercero = this.userService.getPersonaId();
                this.sgaMidAdmisiones.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
                  (respDependencia: any) => {
                    const dependencias = <Number[]>respDependencia.Data.Data.DependenciaId;
                    this.proyectos = <any[]>response.filter(
                      (proyecto: any) => dependencias.includes(proyecto.Id)
                    );
                    if (dependencias.length > 1) {
                      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('admision.multiple_vinculacion'));//+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                    }
                  },
                  (error: any) => {
                    this.popUpManager.showErrorAlert(this.translate.instant('admision.no_vinculacion_no_rol') + ". " + this.translate.instant('GLOBAL.comunicar_OAS_error'));
                  }
                );
              }
            }
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  descargarNormativa() {
    window.open('https://www.udistrital.edu.co/admisiones-pregrado', '_blank');
  }

  async nuevaSolicitud() {
    this.listadoSolicitudes = false;
    await this.loadPeriodo()
    this.construirForm();
  }

  filtrarProyecto(proyecto: any) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
        this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
            .subscribe((res: any) => {
                const r = <any>res;
                if (res !== null && r.Status === '200') {
                    this.periodo = res.Data.find((p: any) => p.Activo);
                    window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
                    resolve(this.periodo);
                    const periodos = <any[]>res['Data'];
                    periodos.forEach(element => {
                        this.periodos.push(element);
                    });
                }
            },
                (error: HttpErrorResponse) => {
                    reject(error);
                });
    });
}

  loadPeriodo() {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/consultar-periodo').subscribe(
        (response: any) => {
          if (response.Success) {

            this.formTransferencia.campos.forEach((campo: any) => {
              if (campo.etiqueta === 'select') {
                campo.opciones = response.Data[campo.nombre];
                if (campo.nombre === 'Periodo') {
                  campo.valor = campo.opciones[0];
                }
              }
            });
            resolve(response.Data)
          } else {

            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('GLOBAL.info'),
              text: this.translate.instant('admision.error_calendario') + '. ' + this.translate.instant('admision.error_nueva_transferencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });

            this.clean();
            this.listadoSolicitudes = true;
          }
          reject();
        },
        (error: any) => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  cargarSolicitudesSegunProyecto(proyecto:any) {
    this.listadoSolicitudes = false
    this.inscripcionMidService.get('transferencia/solicitudes/programa/'+proyecto.Id)
      .subscribe((response: any) => {
        if (response !== null && response.Status == '400') {
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
        } else if (response != null && response.Status == '404') {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
        } else {
          let inscripciones = <Array<any>>response.Data;
          // inscripciones = inscripciones.filter((inscripcion: any) => inscripcion.Estado != "Solicitud generada");
          const dataInfo = <Array<any>>[];
          inscripciones.forEach((element: any) => {
            this.projectService.get('proyecto_academico_institucion/' + element.Programa).subscribe(
              (res: any) => {
                const auxRecibo = element.Recibo;
                const NumRecibo = auxRecibo.split('/', 1);
                element.Recibo = NumRecibo[0];
                element.FechaGeneracion = momentTimezone.tz(element.FechaGeneracion, 'America/Bogota').format('DD-MM-YYYY hh:mm:ss');
                element.IdPrograma = element.Programa;
                element.Programa = res.Nombre;
                element.Periodo = this.periodo.Id;

                element.Descargar = {
                  icon: 'fa fa-download fa-2x',
                  label: 'Descargar',
                  class: 'btn btn-primary',
                  documento: element.Respuesta
                }

                element.Descargar.disabled = true;

                element.Opcion = {
                  icon: 'fa fa-search fa-2x',
                  label: 'Detalle',
                  class: "btn btn-primary"
                }

                dataInfo.push(element);
                this.dataSource = new MatTableDataSource(dataInfo);
                this.listadoSolicitudes = true
                setTimeout(() => {
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;
                }, 300);

                //this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);

              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          });
        }
      },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
        });

  }
  async seleccion(event: any) {
    this.recibo = false;
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');

    this.formTransferencia.campos.forEach((campo: any) => {
      this.dataTransferencia[campo.nombre] = campo.valor;
    });

    if (event.nombre === 'CalendarioAcademico' && !this.recibo && event.valor != null) {

      let parametros: any = await this.loadParams(this.dataTransferencia.CalendarioAcademico.Id)

      if (parametros == false) {
        this.formTransferencia.campos.forEach((campo: any) => {
          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = null;
            campo.ocultar = true;
          }

        });
      } else {
        this.codigosEstudiante = parametros["Data"]["CodigoEstudiante"];
        this.proyectosCurriculares = parametros["Data"]["ProyectoCurricular"];

        this.formTransferencia.campos.forEach((campo: any) => {

          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = parametros["Data"][campo.nombre];
            campo.ocultar = false;
          }

        });
      }
    }

    if (event.nombre === 'TipoInscripcion' && !this.recibo && event.valor != null) {
      this.formTransferencia.campos.forEach((campo: any) => {

        if (event.valor.Nombre === 'Transferencia interna' || event.valor.Nombre === 'Reingreso') {
          Swal.fire({
            icon: 'warning',
            html: this.translate.instant('inscripcion.alerta_recibo_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          })
        }

        if (campo.nombre === 'ProyectoCurricular') {
          if (event.valor.Nombre === 'Reingreso') {
            let aux: any[] = [];

            this.codigosEstudiante.forEach(codigo => {
              this.proyectosCurriculares.forEach(opcion => {
                if (opcion.Id == codigo.IdProyecto) {
                  aux.push(opcion)
                }

              });
            });
            campo.valor = null;
            campo.opciones = aux;
          } else {
            campo.opciones = this.proyectosCurriculares;
          }
        }
      });
    }
  }

  loadParams(calendarioId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/consultar-parametros?id-calendario=' + calendarioId + '&persona-id=' + this.uid).subscribe(
        (response: any) => {
          if (response.Success) {
            resolve(response);
          } else {
            if (response.Message == 'No se encuentran proyectos') {
              this.popUpManager.showErrorAlert(this.translate.instant('admision.error_no_proyecto'));
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            }
            reject();
          }
        },
        (error: any) => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  validarForm(event: any) {
    if (event.valid) {
      this.recibo = true;
      this.formTransferencia.btn = '';
    }

  }




  clean() {
    this.dataTransferencia = {
      Periodo: null,
      CalendarioAcademico: null,
      TipoInscripcion: null,
      CodigoEstudiante: null,
      ProyectoCurricular: null,
    };
    this.formTransferencia.campos.forEach((campo: any) => {
      if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
        campo.ocultar = true;
      }
      if (campo.nombre === 'CalendarioAcademico') {
        campo.valor = null;
      }
    });
  }

  handleButtonClick = (data: any) => {
    const idInscripcion = data['Id'];

    sessionStorage.setItem('IdInscripcion', data.Id);
    sessionStorage.setItem('ProgramaAcademico', data.Programa);
    sessionStorage.setItem('IdPeriodo', data.Periodo);
    sessionStorage.setItem('IdTipoInscripcion', data.IdTipoInscripcion);
    sessionStorage.setItem('ProgramaAcademicoId', data.IdPrograma);
    sessionStorage.setItem('NivelId', data.Nivel);

    this.router.navigate([`solicitud-transferencia/${idInscripcion}/${btoa(this.process)}`])

  };

}
