import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { PopUpManager } from '../../managers/popUpManager';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
export interface Estudiante {
  nombres: string;
  apellidos: string;
  identificacion: string;
  correo: string;
  telefono: string;
  localidad: string;
  estrato: number;
  nombre_colegio: string;
  tipo_colegio: string;
  tipo_poblacion: string;
  tipo_discapacidad: string;
  tiempo_grado: string;
  edad: number;
  sexo: string;
  estado_inscripcion: string;
  estado_admision: string;
}
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  data_proceso = [{ Id: 1, Nombre: 'Inscripciones' }, { Id: 2, Nombre: 'Admisiones' }];
  loading: boolean = false;
  CampoControl = new FormControl("", [Validators.required]);
  Campo1Control = new FormControl("", [Validators.required]);
  Campo2Control = new FormControl("", [Validators.required]);
  Campo3Control = new FormControl("", [Validators.required]);

  periodos: any[] = [];
  nivel_load: any[] = [];
  proyectos: any[] = [];

  selectednivel: any;

  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroupNivel!: FormGroup;

  displayedColumns: string[] = [
    'nombres',
    'apellidos',
    'identificacion',
    'correo',
    'telefono',
    'localidad',
    'estrato',
    'nombre_colegio',
    'tipo_colegio',
    'tipo_poblacion',
    'tipo_discapacidad',
    'tiempo_grado',
    'edad',
    'sexo',
    'estado_inscripcion',
    'estado_admision'
  ];

  dataSource = new MatTableDataSource<Estudiante>([]);

  constructor(
    private translate: TranslateService,    
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager    
  ) {}

  ngOnInit() {
    this.loadData();
    this.firstFormGroup = new FormGroup({
      CampoControl: this.CampoControl,
      Campo1Control: this.Campo1Control,
      Campo2Control: this.Campo2Control
    });
    this.secondFormGroupNivel = new FormGroup({});
    this.loadDataTabla();
  }

  async loadData() {
    try {
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error) {
      this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_cargar_informacion'));
    }
  }

  cargarPeriodo() {
    return this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').toPromise().then((res: any) => {
      this.periodos = res.Data;
    }).catch((error: HttpErrorResponse) => {
      console.error('Error cargando periodos', error);
    });
  }

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe((response: any) => {
      this.nivel_load = response;
    });
  }

  cambiarSelectPeriodoSegunNivel(nivelSeleccionado: any) {
    this.loadProyectos(nivelSeleccionado);
  }

  loadProyectos(nivelSeleccionado: any) {
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe((response: any) => {
      this.proyectos = response.filter((proyecto: any) => this.filtrarProyecto(proyecto, nivelSeleccionado));
    });
  }

  filtrarProyecto(proyecto: any, nivelSeleccionado: any) {
    return proyecto.NivelFormacionId.Id === nivelSeleccionado;
  }

  loadDataTabla() {
    const estudiantes: Estudiante[] = [
      {
        nombres: 'Juan',
        apellidos: 'Pérez',
        identificacion: '12345678',
        correo: 'juan.perez@example.com',
        telefono: '3216549870',
        localidad: 'Localidad 1',
        estrato: 3,
        nombre_colegio: 'Colegio A',
        tipo_colegio: 'Público',
        tipo_poblacion: 'Rural',
        tipo_discapacidad: 'Ninguna',
        tiempo_grado: '2 años',
        edad: 16,
        sexo: 'Masculino',
        estado_inscripcion: 'Inscrito',
        estado_admision: 'Aceptado'
      },
      {
        nombres: 'María',
        apellidos: 'González',
        identificacion: '23456789',
        correo: 'maria.gonzalez@example.com',
        telefono: '3219876540',
        localidad: 'Localidad 2',
        estrato: 4,
        nombre_colegio: 'Colegio B',
        tipo_colegio: 'Privado',
        tipo_poblacion: 'Urbano',
        tipo_discapacidad: 'Auditiva',
        tiempo_grado: '1 año',
        edad: 17,
        sexo: 'Femenino',
        estado_inscripcion: 'Inscrito',
        estado_admision: 'Pendiente'
      },
      {
        nombres: 'Carlos',
        apellidos: 'Martínez',
        identificacion: '34567890',
        correo: 'carlos.martinez@example.com',
        telefono: '3211234567',
        localidad: 'Localidad 3',
        estrato: 2,
        nombre_colegio: 'Colegio C',
        tipo_colegio: 'Público',
        tipo_poblacion: 'Rural',
        tipo_discapacidad: 'Ninguna',
        tiempo_grado: '3 años',
        edad: 18,
        sexo: 'Masculino',
        estado_inscripcion: 'Inscrito',
        estado_admision: 'Rechazado'
      },
      {
        nombres: 'Ana',
        apellidos: 'López',
        identificacion: '45678901',
        correo: 'ana.lopez@example.com',
        telefono: '3217654321',
        localidad: 'Localidad 4',
        estrato: 5,
        nombre_colegio: 'Colegio D',
        tipo_colegio: 'Privado',
        tipo_poblacion: 'Urbano',
        tipo_discapacidad: 'Ninguna',
        tiempo_grado: '6 meses',
        edad: 15,
        sexo: 'Femenino',
        estado_inscripcion: 'No Inscrito',
        estado_admision: 'N/A'
      },
      {
        nombres: 'Luis',
        apellidos: 'Ramírez',
        identificacion: '56789012',
        correo: 'luis.ramirez@example.com',
        telefono: '3210987654',
        localidad: 'Localidad 5',
        estrato: 1,
        nombre_colegio: 'Colegio E',
        tipo_colegio: 'Público',
        tipo_poblacion: 'Rural',
        tipo_discapacidad: 'Visual',
        tiempo_grado: '1 año',
        edad: 19,
        sexo: 'Masculino',
        estado_inscripcion: 'Inscrito',
        estado_admision: 'Aceptado'
      }
    ];
    this.dataSource.data = estudiantes;
  }
}
