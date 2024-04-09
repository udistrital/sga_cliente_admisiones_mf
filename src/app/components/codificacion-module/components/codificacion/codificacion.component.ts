import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CodificacionService } from "../../../../services/codificacion.service";
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

import {
  Admitido,
  NivelFormacion,
  ProyectoCurricular,
  SelectOption,
  planEstudios,
} from "../../../../models/codificacion/types";

@Component({
  selector: "app-codificacion",
  templateUrl: "./codificacion.component.html",
  styleUrls: ["./codificacion.component.scss"],
})
export class CodificacionComponent {
  selectionForm: FormGroup;

  todosNiveles: NivelFormacion[] = [];
  niveles: SelectOption[] = [];
  subNiveles: SelectOption[] = [];
  proyectosCurriculares: ProyectoCurricular[] = [];
  proyectosFiltrados: SelectOption[] = [];
  anosInicio: Set<number> = new Set(); // Usamos un Set para evitar años duplicados
  periodosAcademicos: any[] = [];
  periodosFiltrados: any[] = [];
  planEstudiosFiltrados: any[] = [];
  listasAdmitidos: any[] = ["Lista 1", "Lista 2", "Lista 3"];
  codigoProyectoCurricular: any = null;
  boolListado = false
  periodoValue = ""
  isCodigos = false
  isGenerarCodigos = false


  displayedColumns: string[] = [
    "id",
    "apellidos",
    "nombre",
    "estadoAdmision",
    "enfasis",
    "numeroDocumento",
    "puntaje",
    "codigo",
  ];
  dataSource: any[] = []

  constructor(
    private fb: FormBuilder,
    private codificacionService: CodificacionService,
    private _snackBar: MatSnackBar
  ) {
    this.selectionForm = this.fb.group({
      nivel: ["", Validators.required],
      subNivel: ["", Validators.required],
      proyectoCurricular: ["", Validators.required],
      anoInicio: ["", Validators.required],
      codigoProyectoCurricular: [
        "",
        [Validators.required, Validators.pattern("[0-9]*")],
      ],
      //planEstudios: ["", Validators.required],
      periodoAcademico: ["", Validators.required],
    });
  }

  openSnackBar(infoSnack: string) {
    this._snackBar.open(infoSnack, "Aceptar", {
      duration: 3000
    })
  }
  //

  ngOnInit() {
    this.cargarNivelesPrincipales();
    this.cargarProyectosCurriculares();
    this.cargarPeriodosAcademicos();
  }

  // CONSUMIR SERVICIOS

  cargarNivelesPrincipales() {
    this.codificacionService
      .getNiveles()
      .subscribe(
        (resp: NivelFormacion[]) => {
          this.todosNiveles = resp;
          this.niveles = [
            { value: -1, viewValue: "Todos" },
            ...resp
              .filter((nivel) => !nivel.NivelFormacionPadreId)
              .map((nivel) => ({ value: nivel.Id, viewValue: nivel.Nombre })),
          ];
        },
        (err) => {
          console.error(err);
        }
      );
  }

  cargarProyectosCurriculares() {
    this.codificacionService
      .getProyectosCurriculares()
      .subscribe(
        (data) => (this.proyectosCurriculares = data),
        (error) => console.error(error)
      );
  }

  cargarPeriodosAcademicos() {
    this.codificacionService
      .getPeriodosAcademicos()
      .subscribe(
        (data) => {
          this.periodosAcademicos = data
          this.extraerAnosInicio();
        },
        (error) => console.error(error)
      );
  }

  //EVENTOS

  onNivelChange(event: any) {
    const nivelId = event.value;
    if (nivelId === -1) {
      // Carga todos los subniveles si se selecciona 'Todos'
      this.subNiveles = [{ value: -1, viewValue: "Todos" }];
    } else {
      this.cargarSubNiveles(nivelId);
    }
    this.filtrarProyectosPorNivelSubnivel(nivelId);
  }

  onSubNivelChange(event: any) {
    const subNivelId = event.value;
    this.filtrarProyectosPorNivelSubnivel(subNivelId);
  }

  onProyectoCurricularChange(event: any) {
    const proyectoId = event.value;
    this.asignarCodigoProyecto(proyectoId);
    this.cargarPlanEstudios(event.value)
  }

  //ACCIONES DE LOS BOTONES

  onSubmit() {
    this.getAdmitidos()
    this.openSnackBar('Cargando información')
  }

  getAdmitidos() {
    const idProyecto = this.selectionForm.get('proyectoCurricular')?.value
    const idPeriodo = this.selectionForm.get('periodoAcademico')?.value
    const codigoProyecto = this.selectionForm.get('codigoProyectoCurricular')?.value

    this.codificacionService
      .getAdmitidos(idPeriodo, idProyecto, this.periodoValue, codigoProyecto)
      .subscribe(
        {
          next: (data) => {
            this.boolListado = true
            this.openSnackBar('Información encontrada')
            this.dataSource = data.data
            if (data.data[0].codigo != "") {
              this.isCodigos = true
              this.isGenerarCodigos = false
            }

            if (data.data[0].PuntajeFinal == 0) {
              this.openSnackBar('Recuerda asignar los puntajes de los estudiantes')
            }
          },
          error: (error) => {
            this.openSnackBar('No se encontró información')
          }
        }
      );
  }

  generarCodigos() {
    this.codificacionService.postGenerarCodigos(this.dataSource, 1).subscribe({
      next: (data) => {
        if (data.data) {
          this.openSnackBar('Codigos generados')
          this.dataSource = data.data
          this.isGenerarCodigos = true
        }
      },
      error: (error) => this.openSnackBar('Codigos no egenrados')
    });
  }

  asignarCodificacion() {
    this.codificacionService.postGuardarCodigos(this.dataSource).subscribe({
      next: (data) => {
        if (data.data) {
          this.openSnackBar('Codificación asignada')
          this.getAdmitidos()
        }
      },
      error: (error) => this.openSnackBar('Codificación no asignada')
    });
  }

  descargarListado() {
    // Lógica para descargar el listado
  }

  //HELPERS

  cargarSubNiveles(nivelId: number) {
    this.subNiveles = [
      { value: -1, viewValue: "Todos" },
      ...this.todosNiveles
        .filter((nivel) => nivel.NivelFormacionPadreId?.Id === nivelId)
        .map((nivel) => ({ value: nivel.Id, viewValue: nivel.Nombre })),
    ];
  }

  filtrarProyectosPorNivelSubnivel(nivelId: number) {
    if (nivelId === -1) {
      // Si se selecciona 'Todos', mostrar todos los proyectos
      this.proyectosFiltrados = this.proyectosCurriculares.map((p) => ({
        value: p.Id,
        viewValue: p.Nombre,
      }));
    } else {
      // Lógica de filtrado existente
      this.proyectosFiltrados = this.proyectosCurriculares
        .filter((p) => {
          if (p.NivelFormacionId.Id === nivelId) {
            return true;
          }
          let actualNivel = p.NivelFormacionId.NivelFormacionPadreId;
          while (actualNivel != null) {
            if (actualNivel.Id === nivelId) {
              return true;
            }
            actualNivel = actualNivel.NivelFormacionPadreId;
          }
          return false;
        })
        .map((p) => ({ value: p.Id, viewValue: p.Nombre }));
    }
  }

  asignarCodigoProyecto(proyectoId: number) {
    const proyectoSeleccionado = this.proyectosCurriculares.find(p => p.Id === proyectoId);
    if (proyectoSeleccionado) {
      const codigoProyecto = proyectoSeleccionado.Codigo; // Asume que 'Codigo' es la propiedad del código del proyecto
      const codigoProyectoCurricularControl = this.selectionForm.get('codigoProyectoCurricular');

      if (codigoProyectoCurricularControl) {
        codigoProyectoCurricularControl.setValue(codigoProyecto);
      } else {
        console.error('El control del formulario codigoProyectoCurricular no se encontró');
      }
    }
  }

  asignarValorPeriodo(periodoId: number) {
    const periodoSeleccionado = this.periodosAcademicos.find(p => p.Id === periodoId);
    if (periodoSeleccionado) {
      this.periodoValue = periodoSeleccionado.Nombre;
    }
  }

  extraerAnosInicio() {
    this.periodosAcademicos.forEach(periodo => {
      this.anosInicio.add(periodo.Year); // Añade el año al Set si no está ya presente
    });
    this.anosInicio = new Set(Array.from(this.anosInicio).sort()); // Convierte el Set a un array ordenado
  }

  onAnoInicioChange(event: any) {
    const anoSeleccionado = event.value;
    this.filtrarPeriodosPorAno(anoSeleccionado);
  }

  onPeriodoChange(event: any) {
    this.asignarValorPeriodo(event.value)
  }

  filtrarPeriodosPorAno(ano: number) {
    console.log(ano)
    this.periodosFiltrados = this.periodosAcademicos.filter(periodo => periodo.Year === ano);
  }

  cargarPlanEstudios(id: number) {

    this.codificacionService
      .getPlanDeEstudios(id)
      .subscribe(
        {
          next: (data) => {
            this.planEstudiosFiltrados = data.Data
          },
          error: (error) => console.error(error)
        }
      );
  }

}