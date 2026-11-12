import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { ParametrosService } from 'src/app/services/parametros.service';
import { getRolesUsuario } from 'src/utils/auth.util';
import { PermisosUtils } from 'src/utils/role-permissions';
import { tieneRolEscritura } from 'src/app/models/roles.model';

@Component({
    selector: 'app-lista-tipo-cupos',
    templateUrl: './lista-tipo-cupos.component.html',
    styleUrls: ['./lista-tipo-cupos.component.scss'],
    standalone: false
})
export class ListaTipoCuposComponent {
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'estado'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading!: boolean;
  tiposCupos!: any;

  readonly opcionesPermisos = [
    'crear_tipo_cupo',
    'editar_tipo_cupo',
    'desactivar_tipo_cupo',
    'reactivar_tipo_cupo',
  ]

  permisos: { [key: string]: boolean } = {};
  permisosListos = false;

  constructor(
    private parametrosService: ParametrosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private router: Router,
    private permisosUtils: PermisosUtils,
  ) {}

  async ngOnInit() {
    this.cargarPermisos();
    this.loading = true;
    try {
      await this.cargarTiposCupos();
      this.dataSource.data = this.tiposCupos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch {} 
    finally {
      this.loading = false;
    }
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
      'id', 'nombre', 'descripcion', 'estado',
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

  get puedeCrear(): boolean { return this.tienePermiso('crear_tipo_cupo'); }
  get puedeEditar(): boolean { return this.tienePermiso('editar_tipo_cupo'); }
  get puedeDesactivar(): boolean { return this.tienePermiso('desactivar_tipo_cupo'); }
  get puedeReactivar(): boolean { return this.tienePermiso('reactivar_tipo_cupo'); }

  private validarPermiso(permitido: boolean): boolean {
    if (!permitido) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('ERROR.rol_insuficiente_titulo'),
      );
    }

    return permitido;
  }

  cargarTiposCupos() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro?sortby=Id&order=desc&limit=0&query=TipoParametroId%3A87')
        .subscribe(
          (res: any) => {
            this.tiposCupos = res.Data;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('cupos.error_recuperar_tipos_cupo'));
            reject([]);
          }
        );
    });
  }

  navigateToCrearTipoCupo() {
    if (!this.validarPermiso(this.puedeCrear)) return;
    this.router.navigate(
      ['/crear-tipo-cupos'], 
      { state: { data: 
        {editando: false} 
      } }
    );
  }

  navigateToEditarTipoCupo(data: any) {
    if (!this.validarPermiso(this.puedeEditar)) return;
    this.router.navigate(
      ['/crear-tipo-cupos'], 
      { state: { data: {
          editando: true,
          info: data
        }} 
      }
    );
  }

  eliminar(data: any) {
    this.confirmarEstado(data, false);
  }

  activar(data: any) {
    this.confirmarEstado(data, true);
  }

  private async confirmarEstado(data: any, activo: boolean) {
    if (this.loading || data.Activo === activo) return;
    if (!this.validarPermiso(activo ? this.puedeReactivar : this.puedeDesactivar)) return;
    const accion = activo ? 'reactivar' : 'desactivar';
    const resultado = await this.popUpManager.showPopUpGeneric(
      this.translate.instant('cupos.' + accion),
      this.translate.instant('cupos.confirmar_' + accion),
      MODALS.INFO, true,
    );
    if (!resultado.value || this.loading) return;
    this.loading = true;
    try {
      const guardado = await this.actualizarTipoCupo({
        ...data,
        Activo: activo,
        TipoParametroId: { Id: data.TipoParametroId.Id },
      });
      if (guardado) {
        data.Activo = activo;
        this.dataSource.data = [...this.tiposCupos];
      }
    } finally {
      this.loading = false;
    }
  }

  actualizarTipoCupo(body: any): Promise<boolean> {
    if (!this.validarPermiso(body.Activo === true ? this.puedeReactivar : this.puedeDesactivar)) {
      return Promise.resolve(false);
    }
    return new Promise(resolve => {
      this.parametrosService.put('parametro/', body).subscribe({
        next: () => {
          this.popUpManager.showSuccessAlert(this.translate.instant(
            body.Activo ? 'cupos.reactivacion_exitosa' : 'cupos.desactivacion_exitosa',
          ));
          resolve(true);
        },
        error: () => {
          this.popUpManager.showErrorAlert(this.translate.instant('cupos.error_cambiar_estado'));
          resolve(false);
        },
      });
    });
  }
}
