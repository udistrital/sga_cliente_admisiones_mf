import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

interface Food {
  value: string;
  viewValue: string;
}

interface colums {
  Orden: number;
  NombreCompleto: string;
  Telefono: string;
  Correo: string;
  Credencial: string;
  IdentificacionEnExamenEstado: string;
  CodigoProyecto: string;
  SNP: string;
}

interface Tile {
  color: string;
  textColor: string;
  cols: number;
  rows: number;
  text: string;
}


@Component({
  selector: 'ngx-cargue-snp',
  templateUrl: './cargue-snp.component.html',
  styleUrls: ['./cargue-snp.component.scss']
})
export class CargueSnpComponent {

  formulario: boolean = false;
  dataSource = new MatTableDataSource<any>();

  public editingRowId: number | null = null;


  colums: string [] = [
    'Orden',
    'Credencial',
    'IdentificacionEnExamenEstado',
    'NombreCompleto',
    'Correo',
    'Telefono',
    'CodigoProyecto',
    'SNP',
    'Acciones'
  ];



  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorNivel: ['', Validators.required],
    validatorFacultad: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true; //////////////////////////////////////////////////////

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  tiles: Tile[] = [
    {text: '0', cols: 3, rows: 1, color: '#03678F', textColor: 'white'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
  ];

  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog, private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });

    const columns: colums[] = [
      {
        Orden: 1,
        NombreCompleto: 'Juan Perez',
        Telefono: '1234567890',
        Correo: 'juan.perez@example.com',
        Credencial: 'Credencial 1',
        IdentificacionEnExamenEstado: 'Identificado',
        CodigoProyecto: 'Proyecto 1',
        SNP: 'SNP 1'
      },
      {
        Orden: 2,
        NombreCompleto: 'Maria Rodriguez',
        Telefono: '0987654321',
        Correo: 'maria.rodriguez@example.com',
        Credencial: 'Credencial 2',
        IdentificacionEnExamenEstado: 'Identificado',
        CodigoProyecto: 'Proyecto 2',
        SNP: 'SNP 2'
      }
    ];

    this.dataSource.data = columns.map(info => ({data: info}));
  }

  editar = (orden: any) => {
    console.log('Editando la fila con orden:', orden);
    if (this.editingRowId === orden) {
      this.editingRowId = null;
      this.formulario = false; 
    } else {
      this.editingRowId = orden;
      this.formulario = true;
    }
  }

}
