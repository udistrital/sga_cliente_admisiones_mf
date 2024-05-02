import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { OikosService } from 'src/app/services/oikos.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';

interface Food {
  value: string;
  viewValue: string;
}

interface colums {
  Orden: number;
  // Documento: string;
  NombreCompleto: string;
  Telefono: string;
  Correo: string;
  Puntaje: number;
  TipoInscripcion: string;
  EstadoInscripcion: string;
  EstadoRecibo: string;
  Credencial: string;
  IdentificacionEnExamenEstado: string;
  IdentificacionActual: string;
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
  selector: 'ngx-listado-aspirantes-pregrado',
  templateUrl: './listado-aspirantes-pregrado.component.html',
  styleUrls: ['./listado-aspirantes-pregrado.component.scss']
})
export class ListadoAspirantesPregradoComponent {
  formulario: boolean = false;
  dataSource = new MatTableDataSource<any>();

  public editingRowId: number | null = null;


  colums: string [] = [
    'Orden',
    'Credencial',
    'IdentificacionEnExamenEstado',
    'IdentificacionActual',
    'NombreCompleto',
    'Telefono',
    'Correo',
    'CodigoProyecto',
    'TipoInscripcion',
    'Puntaje',
    'EstadoInscripcion',
    'EstadoRecibo',
    'SNP',
    // 'Documento',
    'Acciones'
  ];


  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
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
    {text: '0', cols: 7, rows: 1, color: '#03678F', textColor: 'white'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
    {text: '0', cols: 1, rows: 2, color: 'white', textColor: 'black'},
  ];

  //****************************************************//
  proyectosCurriculares!: any[]
  periodos!: any[]
  facultades!: any[]

  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog, 
    private translate: TranslateService,
    private oikosService: OikosService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });

    const columns: colums[] = [
      {
        Orden: 1,
        NombreCompleto: 'Juan Perez',
        Telefono: '1234567890',
        Correo: 'juan.perez@example.com',
        Puntaje: 100,
        TipoInscripcion: 'Tipo 1',
        EstadoInscripcion: 'Inscrito',
        EstadoRecibo: 'Pagado',
        Credencial: 'Credencial 1',
        IdentificacionEnExamenEstado: '11111111',
        IdentificacionActual: '11111112',
        CodigoProyecto: 'Proyecto 1',
        SNP: 'SNP 1'
      },
      {
        Orden: 2,
        NombreCompleto: 'Maria Rodriguez',
        Telefono: '0987654321',
        Correo: 'maria.rodriguez@example.com',
        Puntaje: 95,
        TipoInscripcion: 'Tipo 2',
        EstadoInscripcion: 'Inscrito',
        EstadoRecibo: 'Pagado',
        Credencial: 'Credencial 2',
        IdentificacionEnExamenEstado: '22222222',
        IdentificacionActual: '12111112',
        CodigoProyecto: 'Proyecto 2',
        SNP: 'SNP 2'
      }
    ];

    this.dataSource.data = columns.map(info => ({data: info}));
  }

  async ngOnInit() {
    await this.cargarSelects();
  }

  async cargarSelects() {
    await this.cargarPeriodos();
    await this.cargarFacultades();
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          console.log(this.facultades);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          console.log(this.periodos);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.periodo_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    this.proyectosCurriculares = facultad.Opciones;
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
