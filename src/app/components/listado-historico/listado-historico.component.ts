import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DetallesPago, ConceptosBase, ConceptosDescuentos, Cuotas } from './form-listado-historicio'; // Importa los modelos de datos



interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'udistrital-listado-historico',
  templateUrl: './listado-historico.component.html',
  styleUrls: ['./listado-historico.component.scss']
})


export class ListadoHistoricoComponent {

  dataSource = new MatTableDataSource<any>();

  displayedColumns: string[] = ['detallesPagoHeader', 'conceptosBaseHeader', 'conceptosDescuentosHeader', 'fechaPagoCoutasHeader', 'porcentajeCoutasHeader']; // HEADERS
  detallesPagoColumns: string[] = ['codigo', 'cedula', 'nombreApellido', 'creditos', 'cuotas']; // Columnas para DETALLES DEL PAGO
  conceptosBaseColumns: string[] = ['seguroEstudiantil', 'carneEstudiantil', 'sistematizacion']; // Columnas para CONCEPTOS BASE
  conceptosDescuentosColumns: string[] = ['votacion', 'monitor', 'egresado', 'docente', 'beneficiario', 'beca', 'mejorECAES', 'gradoHonor', 'segundoHermano', 'secretariaEducacion', 'doctoradoInterinstitucio']; // Columnas para CONCEPTOS DESCUENTOS
  porcentajeCoutasColumns: string[] = ['fechaCuotaUno', 'fechaCuotaDos', 'fechaCuotaTres', 'primeraCuota', 'segundaCuota', 'terceraCuota']; // Columnas para PORCENTAJE DE CUOTAS

  firstFormGroup = this._formBuilder.group({
    validatorCodigo: ['', Validators.required],
    validatorProyecto: ['', Validators.required],
    validatorFecha: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorSemestre: ['', Validators.required]
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true; //////////////////////////////////////////////////////

  constructor(private _formBuilder: FormBuilder) {
    const detallesPago: DetallesPago[] = [
      {codigo: '123', cedula: '1234567890', nombreApellido: 'Juan Perez', creditos: 10, cuotas: 3},
      {codigo: '456', cedula: '0987654321', nombreApellido: 'Maria Rodriguez', creditos: 15, cuotas: 3},
      {codigo: '789', cedula: '1357924680', nombreApellido: 'Pedro Gomez', creditos: 20, cuotas: 3},
    ];

    const conceptosBase: ConceptosBase[] = [
      {seguroEstudiantil: true, carneEstudiantil: false, sistematizacion: true},
      {seguroEstudiantil: false, carneEstudiantil: true, sistematizacion: false},
      {seguroEstudiantil: true, carneEstudiantil: true, sistematizacion: true},
    ];

    const conceptosDescuentos: ConceptosDescuentos[] = [
      {votacion: true, monitor: false, egresado: true, docente: false, beneficiario: true, beca: false, mejorECAES: true, gradoHonor: false, segundoHermano: true, secretariaEducacion: false, doctoradoInterinstitucio: true},
      {votacion: false, monitor: true, egresado: false, docente: true, beneficiario: false, beca: true, mejorECAES: false, gradoHonor: true, segundoHermano: false, secretariaEducacion: true,  doctoradoInterinstitucio: false},
      {votacion: true, monitor: true, egresado: true, docente: true, beneficiario: true, beca: true, mejorECAES: true, gradoHonor: true, segundoHermano: true, secretariaEducacion: true, doctoradoInterinstitucio: true},
    ];

    const cuotas: Cuotas[] = [
      {primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024'},
      {primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024'},
      {primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024'},
    ];

    const combinedData = detallesPago.map((detalles, index) => ({
      detallesPago: detalles,
      conceptosBase: conceptosBase[index],
      conceptosDescuentos: conceptosDescuentos[index],
      porcentajeCoutas: cuotas[index],
    }));

    this.dataSource.data = combinedData;
  }

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  descargar = (data: any) => {
  }

}
