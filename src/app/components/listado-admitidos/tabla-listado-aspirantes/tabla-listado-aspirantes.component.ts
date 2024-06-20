import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-tabla-listado-aspirantes',
  templateUrl: './tabla-listado-aspirantes.component.html',
  styleUrls: ['./tabla-listado-aspirantes.component.scss']
})
export class TablaListadoAspirantesComponent {

  columnsInscritos = ['n', 'credencial', 'nombre', 'apellido', 'documento', 'snp', "icfes", "ponderado","inscripcion", "estado"];
  datasourceInscritos !: MatTableDataSource<any>;

}
