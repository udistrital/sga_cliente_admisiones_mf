import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { PopUpManager } from '../../managers/popUpManager';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  data_proceso = [{ Id: 1, Nombre: 'Pregrado' }, { Id: 2, Nombre: 'Postgrado' }];
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
    return this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').toPromise().then((res: any) => {
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
}
