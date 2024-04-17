import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { liquidacion } from 'src/app/models/liquidacion/liquidacion';
import { A, B } from 'src/app/models/liquidacion/Variables';

@Component({
  selector: 'app-liquidacion-recibos',
  templateUrl: './liquidacion-recibos.component.html',
  styleUrls: ['./liquidacion-recibos.component.scss']
})

export class LiquidacionRecibosComponent {

  nivel_load = [
    { Id: 1, Nombre: 'Nivel 1' },
    { Id: 2, Nombre: 'Nivel 2' },
    { Id: 3, Nombre: 'Nivel 3' }
  ];

  proyectos = [
    { Id: 1, Nombre: 'Proyecto 1' },
    { Id: 2, Nombre: 'Proyecto 2' },
    { Id: 3, Nombre: 'Proyecto 3' }
  ];

  periodos=[
    { "Nombre": "Periodo 1" },
    { "Nombre": "Periodo 2" },
    { "Nombre": "Periodo 3" }
  ]

  tablaRecibo:boolean=true
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);


  
}








