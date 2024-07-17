import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; // Import the MatTableDataSource class
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
import * as saveAs from 'file-saver';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

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
  datasourceListado = new MatTableDataSource<any>(); // Use MatTableDataSource instead of matTableDataSource
  @ViewChild('paginator0') paginator0!: MatPaginator;
  displayedColumnsListados: string[] = ['proceso', 'fechas', 'estado', 'gestion'];

  //tabla de oficializados
  datasourceOficializado = new MatTableDataSource<any>;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  displayedColumnsOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono", "correosugerido", "correoasignado"];

  //tabla de no oficializados
  datasourceNoOficializados = new MatTableDataSource<any>();
  @ViewChild('paginator2') paginator2!: MatPaginator;
  displayedColumnsNOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono",];

  constructor(

    private eventoService: EventoService,
    private terceroService: TercerosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private calendarioService: SgaCalendarioMidService,
    private sgaAdmisionesMidService: SgaAdmisionesMid,
    private sgaProyectoCurricularMidService: SgaProyectoCurricularMidService

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

            this.periodo = localStorage.getItem('IdPeriodo')
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
              const data = calendario.Data[0].proceso
              data.forEach((proceso: any) => {
                if (proceso.Proceso == "Proceso admitidos") {
                  this.datasourceListado = new MatTableDataSource(proceso.Actividades);
                  this.datasourceListado.paginator = this.paginator0;
                  this.viewProceso = true;
                  proceso.Actividades.forEach((actividad: any) => {
                    console.log(actividad)
                    const fechaInicio = new Date(actividad.FechaInicio);
                    const fechaFin = new Date(actividad.FechaFin);
                    if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
                      this.cicloActual = actividad.Descripcion
                    }
                  });
                }
              });
            });
          }
        });
      } else {
        console.log("Error en consultar Eventos")
      }
    });
  }

  ConsultaAspirantePorNivel(idEstadoFormacion: number) {
    const data: any[] = [];
    const consultedTerceros = new Set(); // Set para almacenar los IDs de terceros ya consultados
    const consultedProgramas = new Set(); // Set para almacenar los IDs de programas ya consultados
    this.sgaProyectoCurricularMidService.get(`proyecto-academico?query=NivelFormacionId:Id:1`).subscribe((proyectos: any) => {
      if (proyectos.Status === 200 && proyectos.Success === true) {
        const observables = proyectos.Data.map((proyecto: any) => {
          if (consultedProgramas.has(proyecto.ProyectoAcademico.Id)) {
            return of([]); // Retorna un observable vacío si el programa ya fue consultado
          }
          consultedProgramas.add(proyecto.ProyectoAcademico.Id);

          return this.inscripcionService.get(`inscripcion?query=EstadoInscripcionId.Id:${idEstadoFormacion}&PeriodoId${this.periodo}&ProgramaAcademicoId:${proyecto.ProyectoAcademico.Id}&limit=10`).pipe(
            mergeMap((inscripciones: any) =>
              forkJoin(
                inscripciones.map((inscripcion: any) => {
                  if (consultedTerceros.has(inscripcion.PersonaId)) {
                    return of(null); // Retorna un observable nulo si el tercero ya fue consultado
                  }
                  consultedTerceros.add(inscripcion.PersonaId);

                  return this.terceroService.get(`tercero?query=Id:${inscripcion.PersonaId}`).pipe(
                    mergeMap((tercero: any) =>
                      this.terceroService.get(`datos_identificacion?query=TerceroId.Id:${tercero[0].Id}`).pipe(
                        mergeMap((dataDocumento: any) => {
                          console.log(tercero)
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
                            return of(null); // Retorna un observable nulo si no cumple la condición
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
        //11 Estado de inscripciopn Corresponde a matriculados
        if (idEstadoFormacion == 11) {
          forkJoin(observables).subscribe((results: any) => {
            results.flat().forEach((item: any) => {
              if (item && !data.some(d => d.codigo === item.codigo)) data.push(item); // Verifica si el elemento ya está en data antes de agregarlo
            });
            this.datasourceOficializado = new MatTableDataSource(data); // Asigna el resultado a dataSourceOficializados
            console.log(this.datasourceOficializado.data);
            this.datasourceOficializado.paginator = this.paginator1;
            this.viewOficializados = true;
          });
        }
        // 12 estado de inscripcion No Oficializado
        if (idEstadoFormacion == 12) {
          forkJoin(observables).subscribe((results: any) => {
            results.flat().forEach((item: any) => {
              if (item && !data.some(d => d.codigo === item.codigo)) data.push(item); // Verifica si el elemento ya está en data antes de agregarlo
            });
            this.datasourceNoOficializados = new MatTableDataSource(data); // Asigna el resultado a dataSourceOficializados
            console.log(this.datasourceNoOficializados.data);
            this.datasourceNoOficializados.paginator = this.paginator2;
            this.viewNoOficializados = true;
          });

        }

      }
    });
  }

  descargarListadoOficializados(estado:number){
    this.sgaAdmisionesMidService.get(`admision/listadooficializados/${this.periodo}/1/${estado}`).subscribe((res: any) => {
      if (res.status === 200 && res.success === true ){
        console.log(res.data.Pdf)
        const base64String = res.data.Pdf;
        this.downloadPdf(base64String);

      }else{
        console.log("Error en la consulta de listado oficializados")
      }

    });
  }

  downloadPdf(resBase64String: string) {
    console.log("Hola1")
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
