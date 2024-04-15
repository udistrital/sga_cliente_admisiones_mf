import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-liquidacion-historico',
  templateUrl: './liquidacion-historico.component.html',
  styleUrls: ['./liquidacion-historico.component.scss']
})
export class LiquidacionHistoricoComponent {

  proyectos=[
    { "Id": 1, "Nombre": "Proyecto 1" },
    { "Id": 2, "Nombre": "Proyecto 2" },
    { "Id": 3, "Nombre": "Proyecto 3" },
  ]

  nivel_load =[
    { "Id": 1, "Nombre": "Nivel 1" },
    { "Id": 2, "Nombre": "Nivel 2" },
    { "Id": 3, "Nombre": "Nivel 3" }
  ]

  periodos=[
    { "Nombre": "Periodo 1" },
    { "Nombre": "Periodo 2" },
    { "Nombre": "Periodo 3" }
  ]

  tablahistorico:boolean=false

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);

}
