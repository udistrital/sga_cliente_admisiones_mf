import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Admitido {
  id: number;
  apellido: string;
  nombre: string;
  estadoAdmision: string;
  enfasis: string;
  numeroDocumento: string;
  codigo: string;
}

const ELEMENT_DATA: Admitido[] = [
  { id: 1, apellido: 'González', nombre: 'Juan', estadoAdmision: 'Admitido', enfasis: 'Sistemas', numeroDocumento: '123456789', codigo: '20201-ING-001' },
  { id: 2, apellido: 'Martínez', nombre: 'Laura', estadoAdmision: 'Lista de espera', enfasis: 'Industrial', numeroDocumento: '987654321', codigo: '20201-IND-002' },
  { id: 3, apellido: 'Rodríguez', nombre: 'Carlos', estadoAdmision: 'Admitido', enfasis: 'Mecánica', numeroDocumento: '112233445', codigo: '20201-MEC-003' },
  { id: 4, apellido: 'López', nombre: 'Sofía', estadoAdmision: 'No admitido', enfasis: 'Electrónica', numeroDocumento: '998877665', codigo: '20201-ELEC-004' },
  { id: 5, apellido: 'Hernández', nombre: 'Miguel', estadoAdmision: 'Admitido', enfasis: 'Civil', numeroDocumento: '556677889', codigo: '20201-CIV-005' }
];


@Component({
  selector: 'app-codificacion',
  templateUrl: './codificacion.component.html',
  styleUrls: ['./codificacion.component.scss']
})
export class CodificacionComponent {
  selectionForm: FormGroup;

  // Datos de ejemplo, deberías reemplazarlos con datos reales, posiblemente obtenidos de un servicio
  proyectosCurriculares = ['Proyecto A', 'Proyecto B', 'Proyecto C'];
  anosInicio = ['2020', '2021', '2022'];
  periodosAcademicos = ['2020-1', '2020-2', '2021-1'];
  listasAdmitidos = ['Lista 1', 'Lista 2', 'Lista 3'];

  constructor(private fb: FormBuilder) {
    this.selectionForm = this.fb.group({
      proyectoCurricular: ['', Validators.required],
      anoInicio: ['', Validators.required],
      listaAdmitidos: [''],
      codigoProyectoCurricular: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      planEstudios: [''],
      periodoAcademico: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.selectionForm.value);
  }

  //TABLE

  displayedColumns: string[] = ['id', 'apellido', 'nombre', 'estadoAdmision', 'enfasis', 'numeroDocumento', 'codigo'];
  dataSource = ELEMENT_DATA;
  
  generarCodigos() {
    // Lógica para generar códigos
  }

  asignarCodificacion() {
    // Lógica para asignar codificación
  }

  descargarListado() {
    // Lógica para descargar el listado
  }

}
