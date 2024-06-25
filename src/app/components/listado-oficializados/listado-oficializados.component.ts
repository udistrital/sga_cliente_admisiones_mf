import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; // Import the MatTableDataSource class
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SgaCalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';

@Component({
  selector: 'app-listado-oficializados',
  templateUrl: './listado-oficializados.component.html',
  styleUrls: ['./listado-oficializados.component.scss']
})
export class ListadoOficializadosComponent {

  //Tabla de proceso de admisiones
  datasourceListado = new MatTableDataSource<any>(); // Use MatTableDataSource instead of matTableDataSource
  displayedColumnsListados: string[] = ['proceso', 'fechas', 'estado', 'gestion'];

  //tabla de oficializados
  datasourceOficializado = new MatTableDataSource<any>();
  displayedColumnsOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono", "estado", "gestion"];

  //tabla de no oficializados
  datasourceNoOficializados = new MatTableDataSource<any>();
  displayedColumnsNOficializado: string[] = ['facultad', 'codigo', 'documento', 'nombre', "apellido", "correo", "telefono", "estado", "gestion"];

  constructor(
    private calendarioService: SgaCalendarioMidService,
    private inscripcionService: InscripcionService,
    private terceroService: TercerosService,
  ) { }

  ngOnInit(): void {
    this.cargarEventos();
    //this.inscripcionesOficializadas();
  }

  cargarEventos() {

    this.calendarioService.get('calendario-academico/v2/56').subscribe((response: any) => {
      console.log(response)
    });

  }

  inscripcionesOficializadas() {
    const data: any[] = [];
    this.inscripcionService.get("inscripcion?query=PeriodoId:40&limit=0").subscribe((response: any) => {
      response.forEach((inscripcion: any) => {
        this.terceroService.get(`tercero?query=Id:${inscripcion.PersonaId}`).subscribe((tercero: any) => {
          this.terceroService.get(`datos_identificacion?query=TerceroId.Id:${tercero[0].Id}`).subscribe((dataDocumento: any) => {
            console.log(dataDocumento[0].TipoDocumentoId.Nombre)
            if (dataDocumento[0].TipoDocumentoId.Nombre === "CÉDULA DE CIUDADANÍA" || dataDocumento[0].TipoDocumentoId.Nombre === "TARJETA DE EXTRANJERÍA") {
              data.push({
                documento: dataDocumento[0].Numero,
                nombre: ` ${tercero[0].PrimerNombre} ${tercero[0].SegundoNombre}`,
                apellido: `${tercero[0].PrimerApellido} ${tercero[0].SegundoApellido}`,
              });
            }
          });
        });

      });
      console.log(data);
    });
  }
}
