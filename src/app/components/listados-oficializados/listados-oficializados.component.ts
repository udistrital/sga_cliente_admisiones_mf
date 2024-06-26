import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-listados-oficializados',
  templateUrl: './listados-oficializados.component.html',
  styleUrls: ['./listados-oficializados.component.scss']
})
export class ListadosOficializadosComponent implements OnInit, AfterViewInit {

  uid: number = 0;
  cambiotab: boolean = false;
  source: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns = ['Proceso', 'Fechas', 'Estado', 'Gestion'];
  @Output() editarElemento = new EventEmitter<number>();

  constructor(
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(() => {});
  }

  ngOnInit() {
    this.addFakeRecords();
  }

  ngAfterViewInit() {
    this.source.paginator = this.paginator;
    this.source.sort = this.sort;
  }

  addFakeRecords() {
    const fakeRecords = [
      { Nombre: 'Proceso 1', Fechas: 'Fecha 1 - Fecha 2', Estado: 'Abierto' },
      { Nombre: 'Proceso 2', Fechas: 'Fecha 3 - Fecha 4', Estado: 'Culminado' },
      { Nombre: 'Proceso 3', Fechas: 'Fecha 5 - Fecha 6', Estado: 'Solicitud de correos realizada' },
      { Nombre: 'Proceso 4', Fechas: 'Fecha 7 - Fecha 8', Estado: 'Abierto' },
      { Nombre: 'Proceso 5', Fechas: 'Fecha 9 - Fecha 10', Estado: 'Culminado' },
    ];
    this.source.data = fakeRecords;
  }

  onView() {
    this.uid = 0;
    this.activetab();
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event: any): void {
    this.cambiotab = event.tabTitle !== this.translate.instant('GLOBAL.lista');
  }

  onChange(event: any) {
    if (event) {
      this.cambiotab = !this.cambiotab;
    }
  }
}
