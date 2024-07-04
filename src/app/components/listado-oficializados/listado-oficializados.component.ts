import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; // Import the MatTableDataSource class

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
}
