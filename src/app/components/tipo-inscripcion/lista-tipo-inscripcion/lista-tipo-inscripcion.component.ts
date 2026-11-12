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
import { getRolesUsuario } from 'src/utils/auth.util';
import { PermisosUtils } from 'src/utils/role-permissions';
import { tieneRolEscritura } from 'src/app/models/roles.model';

@Component({
    selector: 'app-lista-tipo-inscripcion',
    templateUrl: './lista-tipo-inscripcion.component.html',
    styleUrls: ['./lista-tipo-inscripcion.component.scss'],
    standalone: false
})
export class ListaTipoInscripcionComponent {
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'nivel', 'estado',];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading!: boolean;

  niveles!: any;
  tiposInscripcion!: any;

  readonly opcionesPermisos = [
    'crear_tipo_inscripcion',
    'editar_tipo_inscripcion',
    'desactivar_tipo_inscripcion',
    'reactivar_tipo_inscripcion',
  ]

  permisos: { [key: string]: boolean } = {};
  permisosListos = false;

  constructor(
    private router: Router,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private projectService: ProyectoAcademicoService,
    private inscripcionService: InscripcionService,
    private permisosUtils: PermisosUtils,
  ) { }

  async ngOnInit() {
    this.cargarPermisos();
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

  private cargarPermisos(): void {
    this.permisosListos = false;
    this.permisos = {};
    this.displayedColumns = [
      'id', 'nombre', 'descripcion', 'nivel', 'estado',
    ];

    this.permisosUtils
      .obtenerPermisos(getRolesUsuario(), this.opcionesPermisos)
      .subscribe(permisos => {
        this.permisos = permisos;
        this.permisosListos = true;

        const tieneAcciones =
          this.puedeEditar ||
          this.puedeDesactivar ||
          this.puedeReactivar;

        if (tieneAcciones) {
          this.displayedColumns = [...this.displayedColumns, 'acciones'];
        }
      });
  }

  private tienePermiso(opcion: string): boolean {
    return tieneRolEscritura(getRolesUsuario())
      && this.permisosListos
      && this.permisos[opcion] === true;
  }

  get puedeCrear(): boolean { return this.tienePermiso('crear_tipo_inscripcion'); }
  get puedeEditar(): boolean { return this.tienePermiso('editar_tipo_inscripcion'); }
  get puedeDesactivar(): boolean { return this.tienePermiso('desactivar_tipo_inscripcion'); }
  get puedeReactivar(): boolean { return this.tienePermiso('reactivar_tipo_inscripcion'); }

  private validarPermiso(permitido: boolean): boolean {
    if (!permitido) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('ERROR.rol_insuficiente_titulo'),
      );
    }

    return permitido;
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
    if (!this.validarPermiso(this.puedeCrear)) return;
    this.router.navigate(
      ['/crear-tipo-inscripcion'], 
      { state: { data: 
        {editando: false} 
      } }
    );
  }

  navigateToEditarTipoInscripcion(data: any) {
    if (!this.validarPermiso(this.puedeEditar)) return;
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
    if (!this.validarPermiso(this.puedeDesactivar)) return;
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
    if (!this.validarPermiso(this.puedeDesactivar)) return;

    this.loading = true;

    try {
      const guardado = await this.actualizarTipoInscripcion({
        ...data,
        Activo: false,
      });

      if (guardado) {
        data.Activo = false;
      }
    } finally {
      this.loading = false;
    }
  }

  actualizarTipoInscripcion(body: any): Promise<boolean> {
    const permitido = body.Activo === true
      ? this.puedeReactivar
      : this.puedeDesactivar;

    if (!this.validarPermiso(permitido)) {
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      this.inscripcionService.put('tipo_inscripcion/', body).subscribe({
        next: () => {
          this.popUpManager.showSuccessAlert(
            body.Activo
              ? 'Tipo de inscripción reactivado correctamente.'
              : 'Tipo de inscripción desactivado correctamente.',
          );
          resolve(true);
        },
        error: () => {
          this.popUpManager.showErrorAlert(
            'No fue posible cambiar el estado del tipo de inscripción.',
          );
          resolve(false);
        },
      });
    });
  }

  activar(data: any) {
    if (!this.validarPermiso(this.puedeReactivar)) return;
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('tipo_inscripcion.tooltip_activar'),
      this.translate.instant('tipo_inscripcion.seguro_activar_tipo_inscripcion'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            await this.prepararActivacion(data);
          }
        });
  }

  async prepararActivacion(data: any) {
    if (!this.validarPermiso(this.puedeReactivar)) return;

    this.loading = true;

    try {
      const guardado = await this.actualizarTipoInscripcion({
        ...data,
        Activo: true,
      });

      if (guardado) {
        data.Activo = true;
      }
    } finally {
      this.loading = false;
    }
  }
}