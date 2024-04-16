import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'app-lista-proyectos-aspirantes',
  templateUrl: './lista-proyectos-aspirantes.component.html',
  styleUrls: ['./lista-proyectos-aspirantes.component.scss']
})
export class ListaProyectosAspirantesComponent {

  cuposProyecto: any;
  periodo: any;
  nivel: any;
  proyectosActivosConListaAspirantes: any

  niveles: any[] = [];
  periodos: any[] = [];

  aspirantesConstructorTabla: any[] = [];
  aspirantesColumnas: any[] = []
  nivelFormControl = new FormControl('', [Validators.required]);
  periodoFormControl = new FormControl('', [Validators.required]);
  dataSource: any

  constructor(
    private admisionesMid: SgaAdmisionesMid,
    private evaluacionService: EvaluacionInscripcionService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private translate: TranslateService,
  ) {
    this.cargarNiveles()
    this.cargarPeriodo()

    const data = require("./res.json")
    this.proyectosActivosConListaAspirantes = data.data
    this.construirTabla()
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

  cargarNiveles() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId === null && nivel.Nombre === 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  cargarProyectos() {
    const periodo = this.periodo.Id
    const nivel = this.nivel

    this.admisionesMid.get(
      "admision/aspirantes-de-proyectos-activos?id-nivel=" + nivel + "&id-periodo=" + periodo + "&tipo-lista=3")
      .subscribe((res: any) => {
        if (res.success) {
          this.proyectosActivosConListaAspirantes = res.data;
          this.construirTabla()
        } else {
          this.proyectosActivosConListaAspirantes = null
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      })
  }

  cargarCuposParaProyectos() {
    this.proyectosActivosConListaAspirantes.forEach((proyecto: any) => {
      this.cargarCantidadCupos(proyecto);
    });
  }

  cargarCantidadCupos(proyecto: any) {
    const proyectoId = proyecto.ProyectoId
    // const periodoId = this.periodo.Id
    const periodoId = 40

    this.evaluacionService.get('cupos_por_dependencia/?query=DependenciaId:' + proyectoId + ',PeriodoId:' + periodoId + '&limit=1').subscribe(
      (response: any) => {
        if (response !== null && response !== undefined && response[0].Id !== undefined) {
          proyecto.cuposProyecto = response[0].CuposHabilitados;
        } else {
          proyecto.cuposProyecto = "noDefinidoCupos";
        }
      },
      error => {
        this.popUpManager.showErrorAlert(this.translate.instant('cupos.sin_cupos_periodo'));
      },
    );
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

    this.proyectosActivosConListaAspirantes.forEach((proyecto: any) => {
      proyecto.dataSource = new MatTableDataSource<any>(proyecto.Aspirantes);
    });

    this.cargarCuposParaProyectos()
    this.calcularRecuentosInscripciones()
  }

  calcularRecuentosInscripciones(): void {
    let proyectos: any[] = this.proyectosActivosConListaAspirantes;
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

  cambiarPeriodo(){
    this.nivelFormControl.setValue('')
    this.proyectosActivosConListaAspirantes = true
  }

  applyFilter(event: Event, datos:any) {
    const filterValue = (event.target as HTMLInputElement).value;
    datos.filter = filterValue.trim().toLowerCase();
  }
} 
