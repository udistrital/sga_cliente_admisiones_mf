import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-soporte-configuracion',
  templateUrl: './soporte-configuracion.component.html',
  styleUrls: ['./soporte-configuracion.component.scss']
})
export class SoporteConfiguracionComponent {

  data = [
    {
      "orden": "1",
      "convocatoria": "2024-1",
      "generacion": "2024/03/11",
      "usuario": "Josemasster"
    },
    {
      "orden": "456",
      "convocatoria": "Convocatoria2",
      "generacion": false,
      "usuario": "Usuario2"
    },
    {
      "orden": "789",
      "convocatoria": "Convocatoria3",
      "generacion": true,
      "usuario": "Usuario3"
    }
  ]

  columns = ["orden", "convocatoria", "generacion", "usuario", "+"]
  dataSource = new MatTableDataSource<any>(this.data)
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  fecha!: string;
  nivel!: number
  periodo!: string

  periodos = [
    { "nombre": "Periodo 1", "id": 1 },
    { "nombre": "Periodo 2", "id": 2 },
    { "nombre": "Periodo 3", "id": 3 }
  ]


  fechas = [
    { "nombre": "Nivel 1", "id": 1 },
    { "nombre": "Nivel 2", "id": 2 },
    { "nombre": "Nivel 3", "id": 3 }
  ]

  niveles = [
    { "nombre": "Proyecto 1", "id": 1 },
    { "nombre": "Proyecto 2", "id": 2 },
    { "nombre": "Proyecto 3", "id": 3 }
  ]

  constructor() { }
  selectPeriodo() { }
  loadProyectos() { }
  loadInscritos() { }






}
