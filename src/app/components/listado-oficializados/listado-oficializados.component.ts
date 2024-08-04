import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; // Import the MatTableDataSource class
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';
import { SgaProyectoCurricularMidService } from 'src/app/services/sga-proyecto-curricular-mid.service';
import { SgaCalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { MatPaginator } from '@angular/material/paginator';
import { EventoService } from 'src/app/services/evento.service';
import { FormControl, Validators } from '@angular/forms';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import * as saveAs from 'file-saver';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';

@Component({
  selector: 'app-listado-oficializados',
  templateUrl: './listado-oficializados.component.html',
  styleUrls: ['./listado-oficializados.component.scss']
})
export class ListadoOficializadosComponent {

  // *ngIf
  viewProceso = false;
  viewOficializados = false;
  viewNoOficializados = false;

  //Formulario variables
  periodo!: any;
  periodos: any = [];
  periodoControl = new FormControl('', [Validators.required]);

  //fehas activa
  cicloActual!: string;
  estado!: boolean;


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

  constructor(
    private eventoService: EventoService,
    private terceroService: TercerosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private calendarioService: SgaCalendarioMidService,
    private oikosService: OikosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaAdmisionesMidService: SgaAdmisionesMid,
    private sgamidService: SgaMidService,
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
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  async generarBusqueda() {
    this.loading = true;
    const fechaActual = new Date();
    let actividades: any[] = [];
    const eventos: any = await this.consultarCalendarioByperiodo(this.periodo)
    for (const evento of eventos) {
      if (evento.Nivel == 1) {
        const res: any = await this.consultarCalendarioAcademico(evento.Id);
        const data = res.Data[0].proceso
        for (const item of data) {
          if (item.Proceso == "Proceso admitidos" || item.Proceso == "Proceso opcionados") {
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
    for (const facultad of facultades) {
      const proyectos = facultad.Opciones
      for (const proyecto of proyectos) {
        const inscripcionesMatriculadas: any = await this.recuperarInscripciones(11, this.periodo, proyecto.Id)
        if (Object.keys(inscripcionesMatriculadas[0]).length != 0) {
          for (const inscripcion of inscripcionesMatriculadas) {
            const persona: any = await this.consultarTercero(inscripcion.PersonaId)
            const itemBody = {
              facultad: facultad.Nombre,
              proyecto: proyecto.Nombre,
              codigo: inscripcion.Id,
              documento: persona.NumeroIdentificacion,
              nombre: `${persona.PrimerNombre} ${persona.SegundoNombre}`,
              apellido: `${persona.PrimerApellido} ${persona.SegundoApellido}`,
              correopersonal: persona.UsuarioWSO2,
              telefono: persona.Telefono,
              correoSugerido: `${persona.PrimerNombre}${persona.SegundoNombre}${persona.PrimerApellido}${persona.SegundoApellido}@udistrital.edu.co`,
              correoAsignado: persona.UsuarioWSO2
            }
            aspirantesOficializados.push(itemBody)
          }
        }

        const inscripcionesNoOficializadas: any = await this.recuperarInscripciones(12, this.periodo, proyecto.Id)
        if (Object.keys(inscripcionesNoOficializadas[0]).length != 0) {
          for (const inscripcion of inscripcionesNoOficializadas) {
            const persona: any = await this.consultarTercero(inscripcion.PersonaId)
            const itemBody = {
              facultad: facultad.Nombre,
              proyecto: proyecto.Nombre,
              codigo: inscripcion.Id,
              documento: persona.NumeroIdentificacion,
              nombre: `${persona.PrimerNombre} ${persona.SegundoNombre}`,
              apellido: `${persona.PrimerApellido} ${persona.SegundoApellido}`,
              correopersonal: persona.UsuarioWSO2,
              telefono: persona.Telefono,
              correoSugerido: `${persona.PrimerNombre}${persona.SegundoNombre}${persona.PrimerApellido}${persona.SegundoApellido}@udistrital.edu.co`,
              correoAsignado: persona.UsuarioWSO2
            }
            aspirantesNoOficializados.push(itemBody)
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

    this.viewOficializados = true;
    this.viewNoOficializados = true;

    this.loading = false;
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

  recuperarInscripciones(idEstadoFormacion: any, periodo: any, programa: any) {
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
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.sgamidService.get('persona/consultar_persona/' + personaId).subscribe((res: any) => {
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
      if (res.status === 200 && res.success === true ){
        const base64String = res.data.Pdf;
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
}
