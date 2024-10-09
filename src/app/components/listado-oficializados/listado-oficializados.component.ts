import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; // Import the MatTableDataSource class
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';
import { SgaCalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { MatPaginator } from '@angular/material/paginator';
import { EventoService } from 'src/app/services/evento.service';
import { FormControl, Validators } from '@angular/forms';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import * as saveAs from 'file-saver';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { SolicitudesAdmisiones } from 'src/app/services/solicitudes_admisiones.service';
import { MatSort } from '@angular/material/sort';
import { TercerosService } from 'src/app/services/terceros.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'app-listado-oficializados',
  templateUrl: './listado-oficializados.component.html',
  styleUrls: ['./listado-oficializados.component.scss']
})
export class ListadoOficializadosComponent {

  //tab
  cambiotab: boolean = false;

  // *ngIf
  
  viewProceso = false;
  viewOficializados = false;
  viewNoOficializados = false;

  //Formulario variables
  periodo!: any;
  periodos: any = [];
  periodoControl = new FormControl('', [Validators.required]);

  //fehas activa
  cicloActual: string = "No se encuentra Proceso Activo";
  estado!: boolean;

  //Peticiones 
  datos: any[] = [];

  //tabla de solicitudes
 
  datasource = new MatTableDataSource<any>();
  @ViewChild('paginator0') paginator!: MatPaginator;
  display: string[] = ['proceso', 'fechas', 'estado', "gestion"];
  @ViewChild(MatSort, { static: false }) sort!: MatSort;


  //Tabla de proceso de calendario y fechas
  proceso!: string;
  datasourceListado = new MatTableDataSource<any>();
  @ViewChild('paginator0') paginator0!: MatPaginator;
  displayedColumnsListados: string[] = ['proceso', 'fechas', 'estado'];

  //tabla de oficializados
  datasourceOficializado = new MatTableDataSource<any>;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  displayedColumnsOficializado: string[] = ['facultad', 'proyecto', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono", "correosugerido", "correoasignado"];

  //tabla de no oficializados
  datasourceNoOficializados = new MatTableDataSource<any>();
  @ViewChild('paginator2') paginator2!: MatPaginator;
  displayedColumnsNOficializado: string[] = ['facultad', 'proyecto', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono",];

  loading!: boolean;

  tipoCupos: any = [];
  tipoCupo!: any;
  mostrarSelectorCupos= true
  tipoCupoControl = new FormControl('', [Validators.required]);

  constructor(
    private eventoService: EventoService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private calendarioService: SgaCalendarioMidService,
    private oikosService: OikosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaAdmisionesMidService: SgaAdmisionesMid,
    private solicitudesAdmisiones: SolicitudesAdmisiones,
    private tercerosMidService: TerceroMidService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.cargarPeriodo();
    this.loading = false;
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
            periodos.forEach((element: any) => {
              this.periodos.push(element);
            });
            this.periodo = localStorage.getItem('IdPeriodo')
            this.cargarTipoCuposPorPeriodo(this.periodo).then((tipoCupos) => {
              setTimeout(() => {
                  this.tipoCupos = tipoCupos;
                  if (Object.keys(this.tipoCupos[0]).length === 0) {
                      this.mostrarSelectorCupos = false
                  }
              }, 0);
            }).catch((error) => {
                console.error("Error al cargar los cupos", error);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // loadData(): void {
  //   this.solicitudesAdmisiones.get('solicitud?query=EstadoTipoSolicitudId.TipoSolicitud.Id:40').subscribe(res => {
  //     if (res !== null) {
  //       const data = <Array<any>><unknown>res;
  //       this.datos = data.map(item => ({
  //         Proceso: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
  //         Fechas: this.formatDate(item.FechaRadicacion), 
  //         Estado: item.EstadoTipoSolicitudId.EstadoId.Nombre,
  //         Gestion: item 
  //       }));
  //       this.datos.sort((a, b) => new Date(b.Fechas).getTime() - new Date(a.Fechas).getTime()); // Ordenar por fecha descendente
  //       this.datasource = new MatTableDataSource(this.datos);
  //       this.datasource.paginator = this.paginator;
  //       this.datasource.sort = this.sort;
  //     }
  //   });
  // }




  async generarBusqueda() {
    // this.loadData();
    this.loading = true;
    const fechaActual = new Date();
    let actividades: any[] = [];
    const eventos: any = await this.consultarCalendarioByperiodo(this.periodo)
    for (const evento of eventos) {
      if (evento.Nivel == 1) {
        const res: any = await this.consultarCalendarioAcademico(evento.Id);
        console.log(res)
        const data = res.Data[0].proceso
        for (const item of data) {
           if (item.Proceso == "Ciclo admisiones") {
            actividades = actividades.concat(item.Actividades);
            item.Actividades.forEach((actividad: any) => {
              const fechaInicio = new Date(actividad.FechaInicio);
              const fechaFin = new Date(actividad.FechaFin);
              if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
                this.cicloActual = actividad.Descripcion
              }
            });
           }
        }

        if (actividades.length > 0) {
          for (const actividad of actividades) {
            actividad.Fechas = this.formatearFecha(`${actividad.FechaInicio} & ${actividad.FechaFin}`)
          }
          console.log(actividades)
          this.datasourceListado = new MatTableDataSource(actividades);
          this.datasourceListado.paginator = this.paginator0;
          this.viewProceso = true;
        }
      }
    }
    this.loading = false;
  }

  formatearFecha(dateString: string): string {
    const dates = dateString.split(' & ');
    const formattedDates = dates.map(date => date.split('T')[0]);
    return formattedDates.join(' / ');
  }

  consultarCalendarioByperiodo(periodo: number) {
    return new Promise((resolve, reject) => {
      this.eventoService.get(`calendario?query=PeriodoId:${periodo}&sortby=Id&order=asc&limit=0`).subscribe((res: any) => {
        if (res != null && res != undefined && res != "") {
          resolve(res);
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
          reject(false);
        }
      },
        (error: any) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
          console.error(error);
          reject(false);
        });
    });
  }

  consultarCalendarioAcademico(id: number) {
    return new Promise((resolve, reject) => {
      this.calendarioService.get(`calendario-academico/v2/${id}`).subscribe((res: any) => {
        if (res != null && res != undefined && res != "") {
          resolve(res);
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
          reject(false);
        }
      },
        (error: any) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
          console.error(error);
          reject(false);
        });
    });
  }

  async listarAspirantes() {
    this.loading = true;
    let aspirantesOficializados: any[] = [];
    let aspirantesNoOficializados: any[] = [];
    const facultades: any = await this.cargarFacultades();
    console.log(facultades)
    for (const facultad of facultades) {
      const proyectos = facultad.Opciones
      if(proyectos != null){
        for (const proyecto of proyectos) {
          const inscripcionesMatriculadas: any = await this.recuperarInscripciones(11, this.periodo, proyecto.Id, this.tipoCupo)
           if (Object.keys(inscripcionesMatriculadas[0]).length != 0) {
            for (const inscripcion of inscripcionesMatriculadas) {
              if(inscripcion.PersonaId != undefined){
                const persona: any = await this.consultarTercero(inscripcion.PersonaId)
                console.log(persona)
                const itemBody = {
                  facultad: facultad.Nombre,
                  proyecto: proyecto.Nombre,
                  codigo: inscripcion.Id,
                  documento: persona.Data.NumeroIdentificacion,
                  nombre: `${persona.Data.PrimerNombre} ${persona.Data.SegundoNombre}`,
                  apellido: `${persona.Data.PrimerApellido} ${persona.Data.SegundoApellido}`,
                  correopersonal: persona.Data.UsuarioWSO2,
                  telefono: persona.Data.Telefono,
                  correoSugerido: `${persona.Data.PrimerNombre}${persona.Data.SegundoNombre}${persona.Data.PrimerApellido}${persona.Data.SegundoApellido}@udistrital.edu.co`,
                  correoAsignado: persona.Data.UsuarioWSO2
                }
                aspirantesOficializados.push(itemBody)
              }
  
            }
          }
  
          const inscripcionesNoOficializadas: any = await this.recuperarInscripciones(12, this.periodo, proyecto.Id, this.tipoCupo)
          if (Object.keys(inscripcionesNoOficializadas[0]).length != 0) {
            for (const inscripcion of inscripcionesNoOficializadas) {
              const persona: any = await this.consultarTercero(inscripcion.PersonaId)
              const itemBody = {
                facultad: facultad.Nombre,
                proyecto: proyecto.Nombre,
                codigo: inscripcion.Id,
                documento: persona.Data.NumeroIdentificacion,
                nombre: `${persona.Data.PrimerNombre} ${persona.Data.SegundoNombre}`,
                apellido: `${persona.Data.PrimerApellido} ${persona.Data.SegundoApellido}`,
                correopersonal: persona.Data.UsuarioWSO2,
                telefono: persona.Data.Telefono,
                correoSugerido: `${persona.Data.PrimerNombre}${persona.Data.SegundoNombre}${persona.Data.PrimerApellido}${persona.Data.SegundoApellido}@udistrital.edu.co`,
                correoAsignado: persona.Data.UsuarioWSO2
              }
              aspirantesNoOficializados.push(itemBody)
            }
          }
        }
      }
      
    }

    if (aspirantesOficializados.length > 0) {
      this.datasourceOficializado = new MatTableDataSource(aspirantesOficializados);
      this.datasourceOficializado.paginator = this.paginator1;
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_aspirantes_no_encontrados'), this.translate.instant('admision.aspirantes_oficializados_no_encontrados'))
    }

    if (aspirantesNoOficializados.length > 0) {
      this.datasourceNoOficializados = new MatTableDataSource(aspirantesNoOficializados);
      this.datasourceNoOficializados.paginator = this.paginator2;
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_aspirantes_no_encontrados'), this.translate.instant('admision.aspirantes_no_oficializados_no_encontrados'))
    }

    this.viewProceso = true;
    this.viewOficializados = true;
    this.viewNoOficializados = true;
    this.loading = false;
    console.log(aspirantesOficializados)
    console.log(aspirantesNoOficializados)
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false);
          });
    });
  }

  cargarTipoCuposPorPeriodo(idPeriodo: any) {
    // idPeriodo = 39
    return new Promise((resolve, reject) => {
      // this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:T,PeriodoId.Id:${idPeriodo}`)
      this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:TIP_CUP,PeriodoId.Id:${idPeriodo}`)
        .subscribe((res: any) => {
          resolve(res.Data)
        },
          (error: any) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false);
          });
    });
  }

  recuperarInscripciones(idEstadoFormacion: any, periodo: any, programa: any, tipoCupo: any) {
    if(tipoCupo === undefined){
      return new Promise((resolve, reject) => {
        this.inscripcionService.get(`inscripcion?query=Activo:true,EstadoInscripcionId.Id:${idEstadoFormacion},PeriodoId:${periodo},ProgramaAcademicoId:${programa}&sortby=Id&order=asc&limit=0`)
          .subscribe((res: any) => {
            resolve(res)
          },
            (error: any) => {
              console.error(error);
              this.loading = false;
              this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
              reject(false);
            });
      });

    } else {
      return new Promise((resolve, reject) => {
        this.inscripcionService.get(`inscripcion?query=Activo:true,EstadoInscripcionId.Id:${idEstadoFormacion},PeriodoId:${periodo},ProgramaAcademicoId:${programa},TipoCupo:${tipoCupo}&sortby=Id&order=asc&limit=0`)
          .subscribe((res: any) => {
            resolve(res)
          },
            (error: any) => {
              console.error(error);
              this.loading = false;
              this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
              reject(false);
            });
      });
    }
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.tercerosMidService.get('personas/' + personaId).subscribe((res: any) => {
        resolve(res);
      },
        (error: any) => {
          this.loading = false;
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('admision.tercero_error'));
          reject(false);
        });
    });
  }

  descargarListadoOficializados(estado:number){
    this.sgaAdmisionesMidService.get(`admision/listadooficializados/${this.periodo}/1/${estado}`).subscribe((res: any) => {
      if (res.Status === 200 && res.Success === true ){
        const base64String = res.Data.Pdf;
        this.downloadPdf(base64String);

      }else{
        console.error("Error en la consulta de listado oficializados")
      }

    });
  }

  downloadPdf(resBase64String: string) {
    const base64String: string = resBase64String;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    saveAs(blob, 'ListadOficializados.pdf');
  }


  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }
  selectTab(event: any): void {
    this.cambiotab = event.index !== 0;
  }
  regresar(): void {
    this.viewOficializados  = false;
    this.viewNoOficializados = false;
    this.viewProceso = true;
  }
}
