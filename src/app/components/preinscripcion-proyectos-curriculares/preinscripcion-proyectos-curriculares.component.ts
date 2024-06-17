import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { TercerosService } from 'src/app/services/terceros.service';

@Component({
  selector: 'app-preinscripcion-proyectos-curriculares',
  templateUrl: './preinscripcion-proyectos-curriculares.component.html',
  styleUrls: ['./preinscripcion-proyectos-curriculares.component.scss']
})
export class PreinscripcionProyectosCurricularesComponent {

  // *NgIf
  mostrarPreinscripcion = true;
  detallePreinscripcion = false;

  //Variables para el formulario
  primerNombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  segundoNombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  primerApellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
  segundoApellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
  tipoDocumento = new FormControl('', [Validators.required]);
  numeroDocumento = new FormControl('', [Validators.required, Validators.pattern("^[0-9]{10}$")]);
  fechaExpedicion = new FormControl('', [Validators.required]);
  fechaNacimiento = new FormControl('', [Validators.required]);
  sexo = new FormControl('', [Validators.required]);
  correoElectronico = new FormControl('', [Validators.required, Validators.email]);
  telefono = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);

  //Tabla de preinscripciones
  datasourcePreinscipcion = new MatTableDataSource<any>([]);
  displayedColumnsPreinscipcion: string[] = ["recibo", "inscripcion", "nivel", "tipo_inscripcion", "estado_inscripcion", "fecha_generacion", "estado_recibo", "descargar", "opcion", "resultado"];

  //Tabla de detalle preinscripciones
  datasourceDetallePreinscipcion = new MatTableDataSource<any>([]);
  displayedDetalleColumnsPreinscipcion: string[] = ["opcion", "credencial", "proyecto", "puntaje", "estado"];

  //Consulta Persona
  idPersona: number = 9856;

  //Modulo Informacion detallada de la preinscripcion
  periodo!: string;
  nivel!: string;
  tipoInscripcion!: string;


  constructor(
    private tercero: TercerosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private proyectoAcademicoService: ProyectoAcademicoService,
  ) { }

  ngOnInit() {
    this.ConsultaPersona();
  }

  ConsultaPersona() {
    this.tercero.get(`tercero?query=Id:${this.idPersona}`).subscribe((response: any) => {
      console.log(response)
      this.ListadoPreinscripciones(response[0].Id);

    })
  }

  ListadoPreinscripciones(idPersona: number) {
    this.inscripcionService.get(`inscripcion?query=PersonaId:${idPersona}`).subscribe(
      (response: any) => {
        let id = response[0].ProgramaAcademicoId;
        this.proyectoAcademicoService.get("tr_proyecto_academico").subscribe((proyectoResponse: any) => {
          const proyectoAcademico = proyectoResponse.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
          response[0].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
          this.datasourcePreinscipcion.data = response;
        });
      }
    );
  }

  ConsultarPeriodo(IdPeriodo: number) {
    this.parametrosService.get(`periodo/?query=Id:${IdPeriodo}`)
      .subscribe((response: any) => {
        console.log(response);
        this.periodo = response.Data[0]["Nombre"];
      });
  }

  InformacionDetalladaPreinscripciones(idInscripcion: number) {
    this.inscripcionService.get(`inscripcion?query=Id:${idInscripcion}`).subscribe(
      (response: any) => {
        this.detallePreinscripcion = true;
        let id = response[0].ProgramaAcademicoId;
        this.proyectoAcademicoService.get("tr_proyecto_academico").subscribe((proyectoResponse: any) => {
          const proyectoAcademico = proyectoResponse.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
          response[0].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
          this.datasourceDetallePreinscipcion.data = response;
          console.log(response[0]);
          this.ConsultarPeriodo(response[0].PeriodoId);
          this.nivel = response[0].ProyectoAcademico.NivelFormacionId.Nombre;
          this.tipoInscripcion = response[0].TipoInscripcionId.Nombre;
        });
      }
    );
  }
}


