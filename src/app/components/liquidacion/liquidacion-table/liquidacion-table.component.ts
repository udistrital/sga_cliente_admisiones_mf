import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { liquidacion } from 'src/app/models/liquidacion/liquidacion';
import { A, B } from 'src/app/models/liquidacion/Variables';

@Component({
  selector: 'app-liquidacion-table',
  templateUrl: './liquidacion-table.component.html',
  styleUrls: ['./liquidacion-table.component.scss']
})

export class LiquidacionTableComponent implements OnInit{
  mostrarFormulario: boolean = false;

  variableA: A = {
    A1: {
      "1": 0,
      "2": 25,
      "3": 45,
      "4": 75,
      "5": 95,
      "6": 100,
      "No Informa": 100,
      "Area Rural": 20,
      "Ciudad menor de 100mil habitantes": 45,
      "Ciudad mayor de 100mil habitantes": 70
    },
    A2: {
      "Entre 0 y,004": 15,
      "Entre 0.0041 y 0.08": 20,
      "Entre 0.081 y 0.12": 30,
      "Entre 0.121 y 0.16": 40,
      "Entre 0.161 y 0.2": 50,
      "Entre 0.21 y 0,3": 60,
      "Entre 0.31 y 0.4": 70,
      "Entre 0.41 y 0.5": 80,
      "Entre 0.51 y 0.6": 90,
      "Entre 0.61 y 0.7": 100,
      "No informa": 100,
    },
    A3: {
      "Entre 0 y 2": 15,
      "Entre 2,1 y 2,5": 25,
      "Entre 2,5 y 3": 30,
      "Entre 3 y 4": 35,
      "Entre 4 y 5": 40,
      "Entre 5 y 5,5": 45,
      "Entre 5,5 y 6": 50,
      "Entre 6 y 6,5": 55,
      "Entre 6,5 y 7": 60,
      "Entre 7 y 7,5": 70,
      "Entre 7,5 y 8": 75,
      "Entre 8 y 9,5": 80,
      "Entre 9,5 y 11": 85,
      "Entre 11 y 14": 90,
      "Entre 14 y 18": 95,
      ">18": 100,
      "No informa": 100,
    }
  }


  variableB: B = {
    B1: {
      "Estrato 1 y 2 o rural": 0.6,
      "Estrato 3 y 4 ciudad < 100 mil hab, no estratificada": 0.9,
      "Estrato 5 y 6, > 100 mil habitantes no estratificada": 1,

    },
    B2: {
      "Fuera del Perimetro Urbano": 0.9,
      "Dentro del Perimetro Urbano": 1,

    },
    B3: {
      "Vive solo o es casado": 0.85,
      "Otros": 1,
    },
    B4: {
      "Trabaja": 0.9,
      "No trabaja": 1,
    }
  }

  data: liquidacion[] = []
  llavesA1: string[] = []
  valorA1: number[] = []
  llavesA2: string[] = []
  valorA2: number[] = []
  llavesA3: string[] = []
  valorA3: number[] = []
  llavesB1: string[] = []
  valorB1: number[] = []
  llavesB2: string[] = []
  valorB2: number[] = []
  llavesB3: string[] = []
  valorB3: number[] = []
  llavesB4: string[] = []
  valorB4: number[] = []
  PBM!: number
  mostrarElementosLiquidacion!: boolean;
 
  displayedColumns: string[] = ['seleccion', 'codigo', 'documento', 'nombres', 'apellidos', 'A1', 'puntaje1', 'A2', 'puntaje2', 'A3', 'puntaje3', 'B1', 'puntaje4', 'B2', 'puntaje5', 'B3', 'puntaje6', 'B4', 'puntaje7', 'G1', 'G2', 'G3', 'G4', 'total', 'acciones'];
  @Input() recibosUrl: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<liquidacion>;


  @ViewChild('tablaContainer')
  tablaContainer!: ElementRef;

  constructor(private http: HttpClient) {
    this.generarRegistros()
    this.obtenerClaves(this.variableA, this.variableB)

  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  generarRegistros() {
    for (let i = 0; i < 20; i++) {
      const liquidaciondata: liquidacion = {
        seleccion: true,
        codigo: i + 1,
        documetno: 100000000 + i,
        nombres: "Nombre" + (i + 1),
        apellidos: "Apellido" + (i + 1),
        A: {
          A1: "1",
          puntajeA1: this.variableA.A1["1"],
          A2: "Entre 0 y,004",
          puntajeA2: this.variableA.A2["Entre 0 y,004"],
          A3: "Entre 0 y 2",
          puntajeA3: this.variableA.A3["Entre 0 y 2"],
        },
        B: {
          B1: "Estrato 1 y 2 o rural",
          puntajeB1: this.variableB.B1["Estrato 1 y 2 o rural"],
          B2: "Fuera del Perimetro Urbano",
          puntajeB2: this.variableB.B2["Fuera del Perimetro Urbano"],
          B3: "Vive solo o es casado",
          puntajeB3: this.variableB.B3["Vive solo o es casado"],
          B4: "Trabaja",
          puntajeB4: this.variableB.B4["Trabaja"],
        },
        general: {
          pbm: 10,
        },
      };
      this.data.push(liquidaciondata);
      this.dataSource = new MatTableDataSource(this.data);

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, 300);

    }

  }

  obtenerClaves(variableA: A, variableB: B) {
    const { A1, A2, A3 } = variableA
    const { B1, B2, B3, B4 } = variableB
    const calves = Object.keys(A1)
    const calves2 = Object.keys(A2)
    const calves3 = Object.keys(A3)
    const calves4 = Object.keys(B1)
    const calves5 = Object.keys(B2)
    const calves6 = Object.keys(B3)
    const calves7 = Object.keys(B4)
    calves.forEach(llave => this.llavesA1.push(llave))
    calves2.forEach(llave => this.llavesA2.push(llave))
    calves3.forEach(llave => this.llavesA3.push(llave))
    calves4.forEach(llave => this.llavesB1.push(llave))
    calves5.forEach(llave => this.llavesB2.push(llave))
    calves6.forEach(llave => this.llavesB3.push(llave))
    calves7.forEach(llave => this.llavesB4.push(llave))
    this.valorA1 = Object.values(this.variableA.A1);
    this.valorA2 = Object.values(this.variableA.A2);
    this.valorA3 = Object.values(this.variableA.A3);
    this.valorA1 = Object.values(this.variableB.B1);
    this.valorA2 = Object.values(this.variableB.B2);
    this.valorA3 = Object.values(this.variableB.B3);
    this.valorA3 = Object.values(this.variableB.B4);

  }



  actualizarpuntaje(element: liquidacion, caso: string) {
    switch (caso) {
      case 'A1':
        element.A.puntajeA1 = this.variableA.A1[element.A.A1];
        break;
      case 'A2':
        element.A.puntajeA2 = this.variableA.A2[element.A.A2];;
        break;
      case 'A3':
        element.A.puntajeA3 = this.variableA.A3[element.A.A3];;
        break;
      case 'B1':
        element.B.puntajeB1 = this.variableB.B1[element.B.B1];;
        break;
      case 'B2':
        element.B.puntajeB2 = this.variableB.B2[element.B.B2];;
        break;
      case 'B3':
        element.B.puntajeB3 = this.variableB.B3[element.B.B3];;
        break;
      case 'B4':
        element.B.puntajeB4 = this.variableB.B4[element.B.B4];;
        break;
    }
    this.calculoPBM(element)
  }

  calculoPBM(element: liquidacion) {
    const { puntajeA1, puntajeA2, puntajeA3 } = element.A
    const { puntajeB1, puntajeB2, puntajeB3, puntajeB4 } = element.B
    element.general.pbm = (puntajeA1 * 0.35) + (puntajeA2 * 0.25) + (puntajeA3 * 0.4) * (puntajeB1 * puntajeB2 * puntajeB3 * puntajeB4)
  }

  applyFilterProces(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('recibosUrl' in changes) {
      const recibosUrlChange = changes['recibosUrl'];

    }
  }


  async guardar() {
    try {
      const tablaHTML = await this.http.get('ruta/a/tu/archivo/tabla.html', { responseType: 'text' }).toPromise();
      this.tablaContainer.nativeElement.innerHTML = tablaHTML;
    } catch (error) {
      console.error('Error al cargar la tabla:', error);
    }
  }


}






