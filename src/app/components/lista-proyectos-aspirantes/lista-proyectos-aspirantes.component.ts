import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'app-lista-proyectos-aspirantes',
  templateUrl: './lista-proyectos-aspirantes.component.html',
  styleUrls: ['./lista-proyectos-aspirantes.component.scss']
})
export class ListaProyectosAspirantesComponent implements OnDestroy{
  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  infoFiltrado = this.fb.group({
    nivelFormControl: ['', Validators.required],
    periodoFormControl: ['', Validators.required]
  });

  subscripcion: Subscription = new Subscription()

  cuposProyecto: any;
  dataSource: any
  nivel: any;
  periodo: any;
  proyectosActivosConListaAspirantes: any
  loading: boolean = false;
  
  aspirantesColumnas: any[] = []
  aspirantesConstructorTabla: any[] = [];
  niveles: any[] = [];
  periodos: any[] = [];

  // nivelFormControl = new FormControl('', [Validators.required]);
  // periodoFormControl = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder,
    private admisionesMid: SgaAdmisionesMid,
    private evaluacionService: EvaluacionInscripcionService,
    private inscripcionService: InscripcionService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private translate: TranslateService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.cargarNiveles()
    await this.cargarPeriodo()
    this.loading = false;
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.subscripcion.add(this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
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
            console.error(error);
            this.loading = false;
            reject(error);
          }))
    });
  }

  cargarNiveles() {
    this.subscripcion.add(this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        console.log(response)
        this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null && (nivel.Id === 1 || nivel.Id === 2))
      },
      error => {
        console.error(error);
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    ))
  }

  async generarBusqueda() {
    this.loading = true;
    console.log(this.nivel)
    const res = await this.cargarProyectos();
    if (res) {
      this.cargarInformacionEnPanelesExpansivos()
    }
    this.loading = false;
  }

  // cargarProyectos() {
  //   const periodo = this.periodo.Id
  //   const nivel = this.nivel

  //   this.subscripcion.add(this.admisionesMid.get(
  //     "admision/aspirantes-de-proyectos-activos?id-nivel=" + nivel + "&id-periodo=" + periodo + "&tipo-lista=3")
  //     .subscribe((res: any) => {
  //       console.log(res);
  //       if (res.Success) {
  //         this.proyectosActivosConListaAspirantes = res.Data;
  //         this.cargarInformacionEnPanelesExpansivos()
  //       } else {
  //         this.proyectosActivosConListaAspirantes = null
  //         this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //       }
  //     }))
  // }

  cargarProyectos() {
    return new Promise((resolve, reject) => {
      this.subscripcion.add(this.admisionesMid.get("admision/aspirantes-de-proyectos-activos?id-nivel=" + this.nivel + "&id-periodo=" + this.periodo.Id + "&tipo-lista=3").subscribe((res: any) => {
        console.log(res);
        if (res.Success && res.Data != null) {
          this.proyectosActivosConListaAspirantes = res.Data;
          resolve(true)
        } else {
          this.proyectosActivosConListaAspirantes = null
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          reject(false);
        }
      },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.loading = false;
          reject(error);
        }))
    });
  }

  cargarInformacionEnPanelesExpansivos() {
    this.cargarCuposParaProyectos()
    this.calcularRecuentosInscripciones()
    this.construirTabla()
  }

  construirTabla() {
    this.aspirantesConstructorTabla = [
      { columnDef: 'numero_documento', header: 'Documento', cell: (aspirante: any) => aspirante.NumeroDocumento },
      { columnDef: 'nombre', header: 'Nombre', cell: (aspirante: any) => aspirante.NombreAspirante },
      { columnDef: 'telefono', header: 'Teléfono', cell: (aspirante: any) => aspirante.Telefono },
      { columnDef: 'correo', header: 'Correo', cell: (aspirante: any) => aspirante.Email },
      { columnDef: 'puntaje', header: 'Puntaje', cell: (aspirante: any) => aspirante.NotaFinal },
      { columnDef: 'tipo_inscripcion', header: 'Tipo de Inscripción', cell: (aspirante: any) => aspirante.TipoInscripcion },
      { columnDef: 'enfasis', header: 'Énfasis', cell: (aspirante: any) => aspirante.Enfasis },
      { columnDef: 'estado', header: 'Estado', cell: (aspirante: any) => aspirante.EstadoInscripcionId.Nombre },
      { columnDef: 'estado_recibo', header: 'Estado del Recibo', cell: (aspirante: any) => aspirante.EstadoRecibo }
    ];

    this.aspirantesColumnas = this.aspirantesConstructorTabla.map(column => column.columnDef);
    this.renderizarInformacionYPaginador()
  }

  renderizarInformacionYPaginador() {
    if (this.proyectosActivosConListaAspirantes != null) {
      this.proyectosActivosConListaAspirantes.forEach((proyecto: any, index: number) => {
        proyecto.dataSource = new MatTableDataSource<any>(proyecto.Aspirantes);

        setTimeout(() => {
          if (this.paginators && this.paginators.toArray()[index]) {
            proyecto.dataSource.paginator = this.paginators.toArray()[index];
          }
        }, 1000)
      });
    }
  }

  calcularRecuentosInscripciones(): void {
    let proyectos: any[] = this.proyectosActivosConListaAspirantes;
    console.log(proyectos)
    proyectos.forEach((proyecto: any) => {
      let aspirantes = proyecto.Aspirantes;

      proyecto.cantidad_inscrip_solicitada = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'Inscripción solicitada').length;
      proyecto.cantidad_admitidos = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'ADMITIDO').length;
      proyecto.cantidad_opcionados = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'OPCIONADO').length;
      proyecto.cantidad_no_admitidos = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'NO ADMITIDO').length;
      proyecto.cantidad_inscritos = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'INSCRITO').length;
      proyecto.cantidad_inscritos_obs = aspirantes.filter((aspirante: any) => aspirante.EstadoInscripcionId.Nombre === 'INSCRITO con Observación').length;

      proyecto.cantidad_aspirantes = proyecto.cantidad_inscrip_solicitada + proyecto.cantidad_admitidos + proyecto.cantidad_opcionados + proyecto.cantidad_no_admitidos + proyecto.cantidad_inscritos + proyecto.cantidad_inscritos_obs;
    });
  }

  cargarCuposParaProyectos() {
    if (this.proyectosActivosConListaAspirantes != null) {
      console.log(this.proyectosActivosConListaAspirantes)
      this.proyectosActivosConListaAspirantes.forEach((proyecto: any) => {
        this.cargarCantidadCupos(proyecto);
      });
    }
  }

  cargarCantidadCupos(proyecto: any) {
    const proyectoId = proyecto.ProyectoId
    const periodoId = this.periodo.Id

    // this.subscripcion.add(this.evaluacionService.get('cupos_por_dependencia/?query=DependenciaId:' + proyectoId + ',PeriodoId:' + periodoId + '&limit=1').subscribe(
      this.subscripcion.add(this.inscripcionService.get('cupo_inscripcion/?query=ProgramaAcademicoId :' + proyectoId + ',PeriodoId:' + periodoId + '&limit=1').subscribe(
      (response: any) => {
        console.log(response)
        if (response !== null && response !== undefined && response[0].Id !== undefined) {
          proyecto.cuposProyecto = response[0].CuposHabilitados;
        } else {
          proyecto.cuposProyecto = "noDefinidoCupos";
        }
      },
      error => {
        this.popUpManager.showErrorAlert(this.translate.instant('cupos.sin_cupos_periodo'));
      },
    ))
  }

  cambiarPeriodo() {
    //this.nivelFormControl.setValue('')
    this.proyectosActivosConListaAspirantes = true
  }

  buscarTermino(event: Event, datos: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    datos.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    this.subscripcion.unsubscribe()
  }
} 