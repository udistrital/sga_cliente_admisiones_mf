import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from 'src/app/services/users.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TercerosService } from 'src/app/services/terceros.service';
// import { LocalDataSource } from 'ng2-smart-table';
import { DocumentoService } from 'src/app/services/documento.service';
import { NotificacionesMidService } from 'src/app/services/notificaciones_mid.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosComponent } from '../dialogo-documentos/dialogo-documentos.component';
import { Documento } from 'src/app/models/documento/documento';
import { GoogleService } from 'src/app/services/google.service';
import { Invitacion } from 'src/app/models/correo/invitacion';
import { InvitacionTemplate } from '../../../models/correo/invitacionTemplate'
import Swal from 'sweetalert2';
import { PivotDocument } from 'src/utils/pivot_document.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { TAGS_INSCRIPCION_PROGRAMA } from '../def_suite_inscrip_programa/def_tags_por_programa';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { Tercero } from 'src/app/models/terceros/tercero';
import { OikosService } from 'src/app/services/oikos.service';
import { MODALS } from '../../../models/diccionario/diccionario';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'evaluacion-documentos-inscritos',
  templateUrl: './evaluacion-documentos-inscritos.component.html',
  styleUrls: ['./evaluacion-documentos-inscritos.component.scss'],
})
export class EvaluacionDocumentosInscritosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading: boolean = false;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  settings: any;
  // dataSource: LocalDataSource;
  dataSourceColumn=["credencial","identificacion","nombre","estado","acciones"]
  dataSource!: MatTableDataSource<any>
  info_persona_id: any;
  periodo: any;
  nivel_load: any;
  selectednivel: any;
  proyectos_selected: any = [];
  inscripcion_id: any;
  showProfile: boolean;
  proyecto: any;
  aspirante: any;
  invitacion: Invitacion;
  invitacionTemplate: InvitacionTemplate;
  cantidad_aspirantes: number = 0;
  cantidad_admitidos: number = 0;
  cantidad_inscritos: number = 0;
  cantidad_inscritos_obs: number = 0;
  mostrarConteos: boolean = false;
  tagsObject = { ...TAGS_INSCRIPCION_PROGRAMA };
  folderTagtoReload: string = "";
  inscripcionInfo: any;
  observacionesDoc: any = [];


  periodos: any = [];
  proyectos: any = [];
  Aspirantes: any = [];

  //info para notificaciones
  nombreRevisor = "";
  telefonoDep = "";


  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private tercerosService: TercerosService,
    private documentoService: DocumentoService,
    private notificacionesMidService: NotificacionesMidService,
    private dialog: MatDialog,
    private googleMidService: GoogleService,
    private pivotDocument: PivotDocument,
    private sgaMidService: SgaMidService,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private autenticationService: ImplicitAutenticationService,
    private oikosService: OikosService,
  ) {
    this.invitacion = new Invitacion();
    this.invitacionTemplate = new InvitacionTemplate();
    // this.dataSource = new LocalDataSource();
    this.showProfile = true;
    this.loadData();
    this.createTable()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }

  applyFilterProces(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit() {
    this.pivotDocument.document$.subscribe((document: any) => {
      if (document) {
        this.revisarDocumento(document)
      }
    })
    localStorage.setItem("goToEdit", String(false));
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error) {
      this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_cargar_informacion'));
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

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  changePeriodo() {
    this.CampoControl.setValue('');
    this.Campo1Control.setValue('');
  }

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
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

  loadProyectos() {
    // this.dataSource.load([]);
    this.dataSource = new MatTableDataSource()
    this.Aspirantes = [];
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.autenticationService.getRole().then(
            // (rol: Array<String>) => {
            (rol: any) => {
              let r = rol.find((role: any) => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
              if (r) {
                this.proyectos = <any[]>response.filter(
                  (proyecto: any) => this.filtrarProyecto(proyecto),
                );
              } else {
                const id_tercero = this.userService.getPersonaId();
                this.sgaMidService.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
                  (respDependencia: any) => {
                    const dependencias = <Number[]>respDependencia.Data.DependenciaId;
                    this.proyectos = <any[]>response.filter(
                      (proyecto: any) => dependencias.includes(proyecto.Id)
                    );
                    if (dependencias.length > 1) {
                      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('admision.multiple_vinculacion'));//+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                      //this.proyectos.forEach(p => { p.Id = undefined })
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

  loadInscritos() {
    this.loading = true;
    // this.dataSource.load([]);
    this.dataSource = new MatTableDataSource()
    this.Aspirantes = [];
    this.sgaMidService.get('admision/getlistaaspirantespor?id_periodo=' + this.periodo.Id + '&id_proyecto=' + this.proyectos_selected + '&tipo_lista=1')
      .subscribe(
        (response: any) => {
          if (response.Success && response.Status == "200") {
            this.Aspirantes = response.Data;
            this.cantidad_inscritos = this.Aspirantes.filter((aspirante: any) => aspirante.Estado == "INSCRITO").length;
            this.cantidad_inscritos_obs = this.Aspirantes.filter((aspirante: any) => aspirante.Estado == "INSCRITO con Observación").length;
            this.cantidad_admitidos = this.Aspirantes.filter((aspirante: any) => aspirante.Estado == "ADMITIDO").length;
            this.cantidad_aspirantes = this.cantidad_inscritos + this.cantidad_inscritos_obs + this.cantidad_admitidos;
            // this.dataSource.load(this.Aspirantes);
            console.log(this.Aspirantes)
            this.dataSource = new MatTableDataSource(this.Aspirantes)
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }, 300);
            this.loading = false;
            this.mostrarConteos = true;
          }
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.mostrarConteos = false;
          Swal.fire({
            icon: 'warning',
            title: this.translate.instant('admision.titulo_no_aspirantes'),
            text: this.translate.instant('admision.error_no_aspirantes'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      );


    /* this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:5,ProgramaAcademicoId:' +
      this.proyectos_selected + ',PeriodoId:' + this.periodo.Id +
      '&sortby=Id&order=asc').subscribe(
        (response: any) => {
          if (Object.keys(response[0]).length !== 0) {
            const data = <Array<any>>response;
            data.forEach(element => {
              if (element.PersonaId !== undefined) {
                this.tercerosService.get('datos_identificacion?query=TerceroId:' + element.PersonaId).subscribe(
                  (res: any) => {
                    const aspiranteAux = {
                      Credencial: element.Id,
                      Identificacion: res[0].Numero,
                      Nombre: res[0].TerceroId.NombreCompleto,
                      Estado: element.EstadoInscripcionId.Nombre,
                    }
                    this.Aspirantes.push(aspiranteAux);
                    this.dataSource.load(this.Aspirantes);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));

                  },
                );
              }
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('admision.titulo_no_aspirantes'),
              text: this.translate.instant('admision.error_no_aspirantes'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
        },
      ); */
  }

  activateTab() {
    this.showProfile = true;
    this.loadInscritos();
  }

  loadPerfil(event: any) {
    this.aspirante = event.data;
    this.tercerosService.get('datos_identificacion?query=Activo:true,numero:' + event.data.Identificacion).subscribe(
      (response: any) => {
        this.projectService.get('proyecto_academico_institucion/' + this.proyectos_selected).subscribe(
          (res: any) => {
            this.proyecto = res;
            this.inscripcion_id = event.data['Credencial'];
            this.inscripcionService.get('inscripcion?query=Id:' + this.inscripcion_id).subscribe(
              // (resp: any[]) => {
              (resp: any = []) => {
                this.inscripcionInfo = resp[0];
                this.evaluacionInscripcionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:' + this.periodo.Id + ',DependenciaId:' + this.proyectos_selected + ',TipoInscripcionId:' + resp[0].TipoInscripcionId.Id)
                  .subscribe((respSuite: any) => {
                    if (respSuite != null && respSuite.Status == '200') {
                      if (Object.keys(respSuite.Data[0]).length > 0) {
                        this.tagsObject = JSON.parse(respSuite.Data[0].ListaTags);

                        let TercerosAsociadoInscripcion = 0;
                        for (let i = 0; i < response.length; i++) {
                          if (this.inscripcionInfo.PersonaId == response[i].TerceroId.Id) {
                            TercerosAsociadoInscripcion = response[i].TerceroId.Id;
                            break;
                          }
                        }
                        if (TercerosAsociadoInscripcion == 0) {
                          console.warn("PersonaId not found: ", this.inscripcionInfo.PersonaId);
                          this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                            this.translate.instant('ERROR.sin_informacion_en') + ": \"inscripcion.PersonaId\".<br><br>" +
                            this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
                        }

                        this.info_persona_id = TercerosAsociadoInscripcion;
                        this.pivotDocument.updateInfo({
                          TerceroId: TercerosAsociadoInscripcion,
                          IdInscripcion: event.data['Credencial'],
                          ProgramaAcademicoId: this.proyectos_selected.toString(),
                          ProgramaAcademico: res.Nombre,
                          IdPeriodo: this.periodo.Id
                        })
                        sessionStorage.setItem('TerceroId', TercerosAsociadoInscripcion.toString());
                        sessionStorage.setItem('IdInscripcion', event.data['Credencial']);
                        sessionStorage.setItem('ProgramaAcademicoId', this.proyectos_selected.toString());
                        sessionStorage.setItem('ProgramaAcademico', res.Nombre);
                        sessionStorage.setItem('IdPeriodo', this.periodo.Id);
                        sessionStorage.setItem('IdTipoInscripcion', resp[0].TipoInscripcionId.Id);
                        this.showProfile = false;

                      } else {
                        this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
                      }
                    } else {
                      this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
                    });
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
              },
            );
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          },
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      },
    );
  }

  createTable() {
    this.settings = {
      columns: {
        Credencial: {
          title: this.translate.instant('admision.credencial'),
          width: '20%',
          editable: false,
        },
        Identificacion: {
          title: this.translate.instant('admision.id'),
          width: '20%',
          editable: false,
        },
        Nombre: {
          title: this.translate.instant('admision.nombre'),
          width: '35%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('admision.estado'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      filter: false,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title:
              '<i class="nb-search" title="' +
              this.translate.instant('admision.tooltip_ver_registro') +
              '"></i>',
          },
        ],
      },
    };
  }

  revisarDocumento(doc: any) {
    this.folderTagtoReload = "";
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '1600px';
    assignConfig.height = '750px';
    assignConfig.data = { documento: doc }
    const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);
    dialogo.afterClosed().subscribe(data => {
      if (data) {
        this.documentoService.get('documento/' + doc.DocumentoId).subscribe(
          // (documento: Documento) => {
          (documento: any) => {
            //this.showProfile = true
            let metadataJoin = { ...JSON.parse(documento.Metadatos), ...data.metadata };
            documento.Metadatos = JSON.stringify(metadataJoin);
            this.documentoService.put('documento', documento).subscribe(
              response => {
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'))
                this.folderTagtoReload = data.folderOrTag;
                if (!data.metadata.aprobado && data.metadata.observacion !== '') {

                  this.inscripcionInfo.EstadoInscripcionId.Id = 6; // 6 id de INSCRITO con Observacion
                  this.inscripcionService.put('inscripcion', this.inscripcionInfo)
                    .subscribe(resp => {
                      this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'))
                    }, err => {
                      this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
                    })
                }
                //this.showProfile = false
              },
              error => {
                this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
              },
            )
          },
          error => {
            this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
          },
        )
      }
    })
  }

  notificarObservaciones(archivos: any) {
    this.getNombreRevisor();
    this.getTelefonoDependencia();
    var correos: any = [];
    archivos.map((doc: any) => {
      if (doc.aprobado == "No aprobado") {
        this.observacionesDoc.push({
          numero: (this.observacionesDoc.length + 1).toString(),
          documento: doc.grupoDoc + ' - ' + doc.nombreDocumento,
          observacion: doc.observacion
        })
      }
    })
    if (this.observacionesDoc.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('admision.titulo_sin_observaciones'),
        text: this.translate.instant('admision.error_sin_observaciones'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    } else {
      const hoy = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const fecha_format = hoy.toLocaleDateString('es-ES', options).split(',')[1].replace(' ', '').split('de')

      this.sgaMidService.get('inscripciones/info_complementaria_tercero/' + this.info_persona_id)
        .subscribe((resp: any) => {
          if (resp.Response.Code == "200") {

            let info = resp.Response.Body[0];
            info.Correo != '' ? correos.push(info.Correo) : null;
            info.CorreoAlterno != '' ? correos.push(info.CorreoAlterno) : null;

            if (correos.length != 0) {

              const body = {
                "Source": "Notificacion test <notificaciones_sga_test@udistrital.edu.co>",
                "Template": "TEST_SGA_inscripcion-observaciones",
                "Destinations": [
                  {
                    "Destination": {
                      "ToAddresses": correos
                    },
                    "ReplacementTemplateData": {
                      "periodo": this.periodo.Nombre,
                      "dia": fecha_format[0],
                      "mes": fecha_format[1],
                      "anio": fecha_format[2],
                      "nombre_estudiante": this.aspirante.Nombre,
                      "observaciones": this.observacionesDoc,
                      "nombre_revisor": this.nombreRevisor,
                      "cargo_revisor": "Asistente programa curricular - " + this.proyecto.Nombre,
                      "dependencia_revisor": this.proyecto.Nombre,
                      "telefono_revisor": this.telefonoDep
                    }
                  }
                ],
                "DefaultTemplateData": {
                  "periodo": "escogido",
                  "dia": fecha_format[0],
                  "mes": fecha_format[1],
                  "anio": fecha_format[2],
                  "nombre_estudiante": "Aspirante",
                  "observaciones": [
                  ],
                  "nombre_revisor": "",
                  "cargo_revisor": "",
                  "dependencia_revisor": "",
                  "telefono_revisor": ""
                }
              }

              this.notificacionesMidService.post('email/enviar_templated_email', body).subscribe((response: any) => {
                Swal.fire({
                  icon: 'success',
                  title: this.translate.instant('admision.titulo_notificacion_success'),
                  text: this.translate.instant('admision.desc_notificacion_success'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              }, (err) => {
                Swal.fire({
                  icon: 'error',
                  title: this.translate.instant('admision.titulo_notificacion_error'),
                  text: this.translate.instant('admision.desc_notificacion_error'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              })
            }
          }
        },
          (error: HttpErrorResponse) => {

          });

    }
  }


  getNombreRevisor() {

    this.tercerosService.get('tercero?query=Id:' + this.userService.getPersonaId())
      .subscribe((res: any) => {
        // if (res !== null) {
        if (Object.keys(res[0]).length > 0) {
          const data = <Tercero>res[0];
          this.nombreRevisor = data.NombreCompleto
        }
      }, (error: HttpErrorResponse) => {

      });
  }

  getTelefonoDependencia() {
    var telefono = ""
    this.oikosService.get('dependencia?query=id:' + this.proyecto.DependenciaId)
      .subscribe((res: any) => {
        // if (res !== null) {
        if (res.length != 0) {
          if (Object.keys(res[0]).length > 0) {
            this.telefonoDep = res[0].TelefonoDependencia
          }
        }
      }, (error: HttpErrorResponse) => {
      });

  }

}
