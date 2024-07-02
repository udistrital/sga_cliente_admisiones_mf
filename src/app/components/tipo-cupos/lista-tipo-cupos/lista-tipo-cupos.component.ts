import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MODALS } from 'src/app/models/diccionario/diccionario';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-lista-tipo-cupos',
  templateUrl: './lista-tipo-cupos.component.html',
  styleUrls: ['./lista-tipo-cupos.component.scss']
})
export class ListaTipoCuposComponent {
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'estado', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading!: boolean;
  tiposCupos!: any;

  constructor(
    private parametrosService: ParametrosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.cargarTiposCupos()
    this.dataSource = new MatTableDataSource(this.tiposCupos);
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
            console.log(error);
            reject([]);
          }
        );
    });
  }

  navigateToCrearTipoCupo() {
    this.router.navigate(
      ['/crear-tipo-cupos'], 
      { state: { data: 
        {editando: false} 
      } }
    );
  }

  navigateToEditarTipoCupo(data: any) {
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
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('cupos.eliminar_tipos_cupo'),
      this.translate.instant('cupos.descripcion_eliminar_tipos_cupo'),
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
    data.TipoParametroId = {
      "Id": data.TipoParametroId.Id
    }
    await this.actualizarTipoCupo(data);
    this.loading = false;
  }

  actualizarTipoCupo(body: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .put('parametro/', body)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('cupos.eliminacion_tipos_cupo_exito'));
            resolve(true);
          },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('cupos.eliminacion_tipos_cupo_fallo'));
            reject(false);
          }
        );
    });
  }
  
}
