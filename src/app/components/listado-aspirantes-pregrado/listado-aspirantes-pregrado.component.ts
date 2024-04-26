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
  Documento: string;
  NombreCompleto: string;
  Telefono: string;
  Correo: string;
  Puntaje: number;
  TipoInscripcion: string;
  EstadoInscripcion: string;
  EstadoRecibo: string;
  Credencial: string;
  IdentificacionEnExamenEstado: string;
  CodigoProyecto: string;
  SNP: string;
}


@Component({
  selector: 'ngx-listado-aspirantes-pregrado',
  templateUrl: './listado-aspirantes-pregrado.component.html',
  styleUrls: ['./listado-aspirantes-pregrado.component.scss']
})
export class ListadoAspirantesPregradoComponent {
  formulario: boolean = false;
  dataSource = new MatTableDataSource<any>();


  colums: string [] = [
    'Orden',
    'Documento',
    'NombreCompleto',
    'Telefono',
    'Correo',
    'Puntaje',
    'TipoInscripcion',
    'EstadoInscripcion',
    'EstadoRecibo',
    'Credencial',
    'IdentificacionEnExamenEstado',
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

  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog, private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });

    const columns: colums[] = [
      {
        Orden: 1,
        Documento: '123456789',
        NombreCompleto: 'Juan Perez',
        Telefono: '1234567890',
        Correo: 'juan.perez@example.com',
        Puntaje: 100,
        TipoInscripcion: 'Tipo 1',
        EstadoInscripcion: 'Inscrito',
        EstadoRecibo: 'Pagado',
        Credencial: 'Credencial 1',
        IdentificacionEnExamenEstado: 'Identificado',
        CodigoProyecto: 'Proyecto 1',
        SNP: 'SNP 1'
      },
      {
        Orden: 2,
        Documento: '987654321',
        NombreCompleto: 'Maria Rodriguez',
        Telefono: '0987654321',
        Correo: 'maria.rodriguez@example.com',
        Puntaje: 95,
        TipoInscripcion: 'Tipo 2',
        EstadoInscripcion: 'Inscrito',
        EstadoRecibo: 'Pagado',
        Credencial: 'Credencial 2',
        IdentificacionEnExamenEstado: 'Identificado',
        CodigoProyecto: 'Proyecto 2',
        SNP: 'SNP 2'
      }
    ];

    this.dataSource.data = columns.map(info => ({data: info}));
  }

  editar = (data: any) => {
    console.log('Editando...');
    console.log(data);
    this.formulario = true;
  }

  cerrar = () => {
    this.formulario = false;
  }

}
