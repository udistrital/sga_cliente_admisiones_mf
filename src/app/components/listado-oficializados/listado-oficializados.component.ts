import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { OikosService } from 'src/app/services/oikos.service';
import { SgaProyectoCurricularMidService } from 'src/app/services/sga-proyecto-curricular-mid.service';
import { SgaCalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { forkJoin, of } from 'rxjs';
import { mergeMap, map, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { EventoService } from 'src/app/services/evento.service';
import { FormControl, Validators } from '@angular/forms';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

interface CorreoAsignado {
  correoAsignado: string;
  usuarioSugerido: string;
}

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
  displayedColumnsListados: string[] = ['proceso', 'fechas', 'estado', 'gestion'];

  //tabla de oficializados
  datasourceOficializado = new MatTableDataSource<any>();
  @ViewChild('paginator1') paginator1!: MatPaginator;
  displayedColumnsOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono", "correosugerido", "correoasignado"];

  //tabla de no oficializados
  datasourceNoOficializados = new MatTableDataSource<any>();
  @ViewChild('paginator2') paginator2!: MatPaginator;
  displayedColumnsNOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono"];

  constructor(
    private eventoService: EventoService,
    private terceroService: TercerosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private calendarioService: SgaCalendarioMidService,
    private sgaProyectoCurricularMidService: SgaProyectoCurricularMidService,
    private sgaAdmisionesMid: SgaAdmisionesMid
  ) { }

  ngOnInit(): void {
    this.cargarPeriodo();
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
            this.periodo = localStorage.getItem('IdPeriodo');
          }
        },
        (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  selectionChange() {
    this.eventoService.get(`calendario?query=PeriodoId:${this.periodo}`).subscribe((evento: any) => {
      if (evento != null && evento != undefined && evento != "") {
        const regex = new RegExp(`Pregrado`);
        const fechaActual = new Date();
        evento.forEach((element: any) => {
          if (regex.test(element.Nombre)) {
            this.calendarioService.get(`calendario-academico/v2/${element.Id}`).subscribe((calendario: any) => {
              const data = calendario.Data[0].proceso;
              data.forEach((proceso: any) => {
                if (proceso.Proceso == "Proceso admitidos") {
                  this.datasourceListado = new MatTableDataSource(proceso.Actividades);
                  this.datasourceListado.paginator = this.paginator0;
                  this.viewProceso = true;
                  proceso.Actividades.forEach((actividad: any) => {
                    const fechaInicio = new Date(actividad.FechaInicio);
                    const fechaFin = new Date(actividad.FechaFin);
                    if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
                      this.cicloActual = actividad.Descripcion;
                    }
                  });
                }
              });
            });
          }
        });
      } else {
        console.log("Error en consultar Eventos");
      }
    });
  }

  ConsultaAspirantePorNivel(idEstadoFormacion: number) {
    const data: any[] = [];
    const consultedTerceros = new Set();
    const consultedProgramas = new Set();
    this.sgaProyectoCurricularMidService.get(`proyecto-academico?query=NivelFormacionId:Id:1`).subscribe((proyectos: any) => {
      if (proyectos.Status === 200 && proyectos.Success === true) {
        const observables = proyectos.Data.map((proyecto: any) => {
          if (consultedProgramas.has(proyecto.ProyectoAcademico.Id)) {
            return of([]);
          }
          consultedProgramas.add(proyecto.ProyectoAcademico.Id);

          return this.inscripcionService.get(`inscripcion?query=EstadoInscripcionId.Id:${idEstadoFormacion}&PeriodoId${this.periodo}0&ProgramaAcademicoId:${proyecto.ProyectoAcademico.Id}&limit=10`).pipe(
            mergeMap((inscripciones: any) =>
              forkJoin(
                inscripciones.map((inscripcion: any) => {
                  if (consultedTerceros.has(inscripcion.PersonaId)) {
                    return of(null);
                  }
                  consultedTerceros.add(inscripcion.PersonaId);

                  return this.terceroService.get(`tercero?query=Id:${inscripcion.PersonaId}`).pipe(
                    mergeMap((tercero: any) =>
                      this.terceroService.get(`datos_identificacion?query=TerceroId.Id:${tercero[0].Id}`).pipe(
                        mergeMap((dataDocumento: any) => {
                          if (dataDocumento[0].TipoDocumentoId.Nombre === "CÉDULA DE CIUDADANÍA" || dataDocumento[0].TipoDocumentoId.Nombre === "TARJETA DE EXTRANJERÍA") {
                            return this.terceroService.get(`info_complementaria_tercero?query=TerceroId.Id:${tercero[0].Id}`).pipe(
                              map((infocomplementaria: any) => {
                                let telefono = "";
                                let correo = "";
                                infocomplementaria.forEach((info: any) => {
                                  if (info.InfoComplementariaId.Nombre === "TELEFONO") {
                                    const jsonObj = JSON.parse(info.Dato);
                                    telefono = jsonObj.principal;
                                  }
                                  if (info.InfoComplementariaId.Nombre === "CORREO") {
                                    const jsonObj = JSON.parse(info.Dato);
                                    correo = jsonObj.value;
                                  }
                                });
                                return {
                                  facultad: proyecto.NombreFacultad,
                                  codigo: inscripcion.Id,
                                  documento: dataDocumento[0].Numero,
                                  nombre: `${tercero[0].PrimerNombre} ${tercero[0].SegundoNombre}`,
                                  apellido: `${tercero[0].PrimerApellido} ${tercero[0].SegundoApellido}`,
                                  correopersonal: correo,
                                  telefono: telefono,
                                  correoSugerido: `${tercero[0].PrimerNombre[0]}${tercero[0].SegundoNombre[0]}${tercero[0].PrimerApellido}${tercero[0].SegundoApellido[0]}@udistrital.edu.co`,
                                  correoAsignado: tercero[0].UsuarioWSO2
                                };
                              })
                            );
                          } else {
                            return of(null);
                          }
                        })
                      )
                    )
                  );
                })
              )
            )
          );
        });
        if (idEstadoFormacion == 11) {
          forkJoin(observables).subscribe((results: any) => {
            results.flat().forEach((item: any) => {
              if (item && !data.some(d => d.codigo === item.codigo)) data.push(item);
            });
            this.datasourceOficializado = new MatTableDataSource(data);
            this.datasourceOficializado.paginator = this.paginator1;
            this.viewOficializados = true;
            this.asignarCorreos();
          });
        }
        if (idEstadoFormacion == 12) {
          forkJoin(observables).subscribe((results: any) => {
            results.flat().forEach((item: any) => {
              if (item && !data.some(d => d.codigo === item.codigo)) data.push(item);
            });
            this.datasourceNoOficializados = new MatTableDataSource(data);
            this.datasourceNoOficializados.paginator = this.paginator2;
            this.viewNoOficializados = true;
            this.asignarCorreos();
          });
        }
      }
    });
  }

  asignarCorreos() {
    const idPeriodo = localStorage.getItem('IdPeriodo');
    this.sgaAdmisionesMid.get(`gestion-correos/correo-sugerido?id_periodo=${idPeriodo}`).subscribe((res: any) => {
      if (res && res.data) {
        const correosAsignados: CorreoAsignado[] = res.data.map((correo: any) => {
          return {
            correoAsignado: correo.correo_asignado,
            usuarioSugerido: correo.usuarioSugerido
          };
        });
        this.datasourceOficializado.data.forEach((element: any) => {
          const correo = correosAsignados.find((c: CorreoAsignado) => c.usuarioSugerido === element.correoSugerido);
          if (correo) {
            element.correoAsignado = correo.correoAsignado;
          }
        });
        this.datasourceNoOficializados.data.forEach((element: any) => {
          const correo = correosAsignados.find((c: CorreoAsignado) => c.usuarioSugerido === element.correoSugerido);
          if (correo) {
            element.correoAsignado = correo.correoAsignado;
          }
        });
      }
    });
  }
}
