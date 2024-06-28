import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
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
        .get('parametro?limit=0&query=TipoParametroId%3A87')
        .subscribe(
          (res: any) => {
            console.log(res);
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
}
