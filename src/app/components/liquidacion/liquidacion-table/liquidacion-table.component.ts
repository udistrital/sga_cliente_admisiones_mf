import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { liquidacion } from 'src/app/models/liquidacion/liquidacion';
import { A, B } from 'src/app/models/liquidacion/Variables';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';

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
      "Área rural": 20,
      "Ciudad menor de cien mil habitantes": 45,
      "Ciudad mayor de cien mil habitantes": 70
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
      "Mayor de 0.71": 100,
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
      "1": 0.6,
      "2": 0.6,
      "3": 0.9,
      "4": 0.9,
      "5": 1,
      "6": 1,
      "Área rural": 0.6,
      "Ciudad menor de cien mil habitantes": 0.9,
      "Ciudad mayor de cien mil habitantes": 1
    },
    B2: {
      "Fuera del perimetro urbano": 0.9,
      "Dentro del perimetro urbano": 1,

    },
    B3: {
      "Vive solo": 0.85,
      "Es casado": 0.85,
      "Otro": 1,
    },
    B4: {
      "Empleado": 0.9,
      "Desempleado": 1,
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
  editando: boolean = false;
  visible!: boolean;
  inscripciones: any = [];
  public editingRowId: number | null = null;
  valorOriginal: any;
  loading: boolean = false;
 
  displayedColumns: string[] = ['seleccion', 'codigo', 'documento', 'nombres', 'apellidos', 'A1', 'puntaje1', 'A2', 'puntaje2', 'A3', 'puntaje3', 'B1', 'puntaje4', 'B2', 'puntaje5', 'B3', 'puntaje6', 'B4', 'puntaje7', 'G1', 'G2', 'G3', 'G4', 'total', 'acciones'];
  @Input() datosRecibos: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<liquidacion>;

  matriculaUltimoAnio = new FormControl('');
  ingresosBrutosFam = new FormControl('');


  @ViewChild('tablaContainer')
  tablaContainer!: ElementRef;

  constructor(
    private http: HttpClient,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private tercerosService: TercerosService,
  ) 
  {
    this.obtenerClaves(this.variableA, this.variableB)
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  async generarRegistros() {
    this.loading = true;
    this.data = [];
  
    if (this.inscripciones.length != 0 && Object.keys(this.inscripciones[0]).length != 0) {
      for (const inscripcion of this.inscripciones) {
        try {
          const persona: any = await this.consultarTercero(inscripcion.PersonaId);
          if (Array.isArray(persona) && persona.length === 0) {
            continue;
          }
    
          const infoLegalizacion: any = await this.getLegalizacionMatricula(persona.Id);
          if (infoLegalizacion === "No existe legalizacion") {
            continue;
          }
    
          if (!infoLegalizacion || infoLegalizacion.pensionSM11 == null || infoLegalizacion.ingresosSMCostea == null) {
            console.error('Datos incompletos en infoLegalizacion:', infoLegalizacion);
            continue;
          }
    
          const valorStringA2 = this.calcularValorPension(infoLegalizacion.pensionSM11);
          const valorStringA3 = this.calcularValorIngresos(infoLegalizacion.ingresosSMCostea);
    
          const valorLiquidacionData: any = {
            "estado_edicion": false,
            "inscripcionId": inscripcion.Id,
            "personaId": persona.Id,
            "seleccion": true,
            "codigo": 1000,
            "documento": persona.NumeroIdentificacion,
            "nombres": `${persona.PrimerNombre} ${persona.SegundoNombre}`,
            "apellidos": `${persona.PrimerApellido} ${persona.SegundoApellido}`,
            A: {
              A1: infoLegalizacion.estratoCostea,
              puntajeA1: this.variableA.A1[infoLegalizacion.estratoCostea],
              A2: infoLegalizacion.pensionSM11,
              puntajeA2: this.variableA.A2[valorStringA2],
              A3: infoLegalizacion.ingresosSMCostea,
              puntajeA3: this.variableA.A3[valorStringA3],
            },
            B: {
              B1: infoLegalizacion.estratoCostea,
              puntajeB1: this.variableB.B1[infoLegalizacion.estratoCostea],
              B2: infoLegalizacion.ubicacionResidenciaCostea,
              puntajeB2: this.variableB.B2[infoLegalizacion.ubicacionResidenciaCostea],
              B3: infoLegalizacion.nucleoFamiliar,
              puntajeB3: this.variableB.B3[infoLegalizacion.nucleoFamiliar],
              B4: infoLegalizacion.situacionLaboral,
              puntajeB4: this.variableB.B4[infoLegalizacion.situacionLaboral],
            },
            general: {
              pbm: 10,
            },
          };
    
          this.calculoPBM(valorLiquidacionData);
          this.data.push(valorLiquidacionData);
          this.dataSource = new MatTableDataSource(this.data);
    
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 300);
        } catch (error) {
          console.error('Error procesando inscripción:', inscripcion, error);
        }
      }
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_no_aspirantes'), this.translate.instant('admision.error_no_aspirantes'))
    }
  
    this.loading = false;
  }

  retornarLugarResidencia(ubicacion: any) {
    let ubicacionString;
    if (ubicacion == 1 || ubicacion == 2 || ubicacion == 'Área rural') {
      ubicacionString = "Estrato 1 y 2 o rural"
    } else if (ubicacion == 3 || ubicacion == 4 || ubicacion == 'Ciudad menor de cien mil habitantes') {
      ubicacionString = "Estrato 3 y 4 ciudad < 100 mil hab, no estratificada"
    } else {
      ubicacionString = "Estrato 5 y 6, > 100 mil habitantes no estratificada"
    }

    return ubicacionString;
  }

  calcularValorPension(valorSM: any) {
    let valorString;

    switch (true) {
      case valorSM <= 0.004:
        valorString = "Entre 0 y,004"
        break;
      case valorSM <= 0.08:
        valorString = "Entre 0.0041 y 0.08"
        break;
      case valorSM <= 0.12:
        valorString = "Entre 0.081 y 0.12"
        break;
      case valorSM <= 0.16:
        valorString = "Entre 0.121 y 0.16"
        break;
      case valorSM <= 0.2:
        valorString = "Entre 0.161 y 0.2"
        break;
      case valorSM <= 0.3:
        valorString = "Entre 0.21 y 0,3"
        break;
      case valorSM <= 0.4:
        valorString = "Entre 0.31 y 0.4"
        break;
      case valorSM <= 0.5:
        valorString = "Entre 0.41 y 0.5"
        break;
      case valorSM <= 0.6:
        valorString = "Entre 0.51 y 0.6"
        break;
      case valorSM <= 0.7:
        valorString = "Entre 0.61 y 0.7"
        break;
      case valorSM > 0.7:
        valorString = "Entre 0.61 y 0.7"
        break;
      default:
        valorString = "No informa"
    }

    return valorString;
  }

  calcularValorIngresos(valorSM: any) {
    let valorString;

    switch (true) {
      case valorSM <= 2:
        valorString = "Entre 0 y 2"
        break;
      case valorSM <= 2.5:
        valorString = "Entre 2,1 y 2,5"
        break;
      case valorSM <= 3:
        valorString = "Entre 2,5 y 3"
        break;
      case valorSM <= 4:
        valorString = "Entre 3 y 4"
        break;
      case valorSM <= 5:
        valorString = "Entre 4 y 5"
        break;
      case valorSM <= 5.5:
        valorString = "Entre 5 y 5,5"
        break;
      case valorSM <= 6:
        valorString = "Entre 5,5 y 6"
        break;
      case valorSM <= 6.5:
        valorString = "Entre 6 y 6,5"
        break;
      case valorSM <= 7:
        valorString = "Entre 6,5 y 7"
        break;
      case valorSM <= 7.5:
        valorString = "Entre 7 y 7,5"
        break;
      case valorSM <= 8:
        valorString = "Entre 7,5 y 8"
        break;
      case valorSM <= 9.5:
        valorString = "Entre 8 y 9,5"
        break;
      case valorSM <= 11:
        valorString = "Entre 9,5 y 11"
        break;
      case valorSM <= 14:
        valorString = "Entre 11 y 14"
        break;
      case valorSM <= 18:
        valorString = "Entre 14 y 18"
        break;
      case valorSM > 18:
        valorString = ">18"
        break;
      default:
        valorString = "No informa"
    }

    return valorString;
  }

  async consultarTercero(personaId: any): Promise<any | []> {
    try {
      const response = await this.tercerosService.get('personas/' + personaId).toPromise();
      return response;
    } catch (error) {
      console.error(error)
      return []; 
    }
  }

  async getLegalizacionMatricula(personaId: any) {
    return new Promise((resolve, reject) => {
      //this.loading = true;
      this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
        .subscribe((res: any) => {
          resolve(res.Data);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(
              this.translate.instant('admision.legalizacion_error')
            );
          });
    });
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
        element.B.B1 = element.A.A1
        element.B.puntajeB1 = this.variableB.B1[element.B.B1];
        break;
      case 'A2':
        element.A.puntajeA2 = this.variableA.A2[element.A.A2];
        break;
      case 'A3':
        element.A.puntajeA3 = this.variableA.A3[element.A.A3];
        break;
      case 'B1':
        element.B.puntajeB1 = this.variableB.B1[element.B.B1];
        element.A.A1 = element.B.B1
        element.A.puntajeA1 = this.variableA.A1[element.A.A1];
        break;
      case 'B2':
        element.B.puntajeB2 = this.variableB.B2[element.B.B2];
        break;
      case 'B3':
        element.B.puntajeB3 = this.variableB.B3[element.B.B3];
        break;
      case 'B4':
        element.B.puntajeB4 = this.variableB.B4[element.B.B4];
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

  ngOnChanges(): void {
    if (this.datosRecibos.hasOwnProperty('visible')) {
      this.visible = this.datosRecibos['visible']
    }
    if (this.datosRecibos.hasOwnProperty('inscripciones')) {
      this.inscripciones = this.datosRecibos['inscripciones']
      this.generarRegistros()
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






