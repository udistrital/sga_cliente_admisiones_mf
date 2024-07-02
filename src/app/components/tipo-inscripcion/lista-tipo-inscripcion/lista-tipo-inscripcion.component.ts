import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';

@Component({
  selector: 'app-lista-tipo-inscripcion',
  templateUrl: './lista-tipo-inscripcion.component.html',
  styleUrls: ['./lista-tipo-inscripcion.component.scss']
})
export class ListaTipoInscripcionComponent {
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'nivel', 'estado', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading!: boolean;

  niveles!: any;
  tiposInscripcion!: any;

  constructor(
    private router: Router,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private projectService: ProyectoAcademicoService,
    private inscripcionService: InscripcionService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.cargarNiveles();
    await this.cargarTiposInscripcion();
    this.tiposInscripcion = this.organizarDataTabla(this.tiposInscripcion);
    this.dataSource = new MatTableDataSource(this.tiposInscripcion);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cargarNiveles() {
    return new Promise((resolve, reject) => {
      this.projectService
        .get('nivel_formacion?query=Activo:true&sortby=Id&order=asc')
        .subscribe(
          (res: any) => {
            this.niveles = res
            resolve(res);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.error_nieveles'));
            reject([]);
          }
        );
    });
  }

  cargarTiposInscripcion() {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .get('tipo_inscripcion?sortby=Id&order=desc&limit=0')
        .subscribe(
          (res: any) => {
            this.tiposInscripcion = res;
            resolve(res);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.error_tipo_inscripcion'));
            reject([]);
          }
        );
    });
  }

  organizarDataTabla(tiposInscripcion: any) {
    for (const tipo of tiposInscripcion) {
      const nivel: any = this.niveles.find((nivel: any) => nivel.Id == tipo.NivelId)
      tipo["Nivel"] = nivel ? nivel.Nombre : 'Indefinido';
    }
    return tiposInscripcion
  }

  navigateToCrearTipoInscripcion() {
    this.router.navigate(
      ['/crear-tipo-inscripcion'], 
      { state: { data: 
        {editando: false} 
      } }
    );
  }

  navigateToEditarTipoInscripcion(data: any) {
    this.router.navigate(
      ['/crear-tipo-inscripcion'], 
      { state: { data: {
          editando: true,
          info: data
        }} 
      }
    );
  }

  eliminar(data: any) {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('tipo_inscripcion.tooltip_eliminar'),
      this.translate.instant('tipo_inscripcion.seguro_deshabilitar_tipo_inscripcion'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            await this.prepararEliminacion(data);
          }
        });
  }

  async prepararEliminacion(data: any) {
    this.loading = true;
    data.Activo = false;
    await this.actualizarTipoInscripcion(data);
    this.loading = false;
  }

  actualizarTipoInscripcion(body: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .put('tipo_inscripcion/', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'));
            reject(false);
          }
        );
    });
  }
}