import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { PopUpManager } from 'src/app/managers/popUpManager';

@Component({
  selector: 'udistrital-listados-oficializados',
  templateUrl: './crud-listados-oficializados.component.html',
  styleUrls: ['./crud-listados-oficializados.component.scss']
})
export class CrudListadosOficializadosComponent implements OnInit {

  periodoId: number = 40;
  uid: number = 0;
  cambiotab: boolean = false;

  source: MatTableDataSource<any> = new MatTableDataSource<any>();
  sourceReplicada: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild('paginatorReplicada', { static: false }) paginatorReplicada!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  showInactives: boolean = true;

  datos: any[] = [
    { Facultad: 'Ingeniería', Codigo: '12345', Documento: '1234567890', PrimerNombre: 'Juan', SegundoNombre: 'Carlos', PrimerApellido: 'Pérez', SegundoApellido: 'González', CorreoPersonal: 'juan@example.com', Telefono: '123456789', Sugerido: 'Sí', Asignado: 'No' },
    { Facultad: 'Medicina', Codigo: '67890', Documento: '0987654321', PrimerNombre: 'María', SegundoNombre: 'Elena', PrimerApellido: 'Rodríguez', SegundoApellido: 'López', CorreoPersonal: 'maria@example.com', Telefono: '987654321', Sugerido: 'No', Asignado: 'Sí' },
    { Facultad: 'Derecho', Codigo: '54321', Documento: '1122334455', PrimerNombre: 'Luis', SegundoNombre: 'Miguel', PrimerApellido: 'Martínez', SegundoApellido: 'Ramírez', CorreoPersonal: 'luis@example.com', Telefono: '112233445', Sugerido: 'Sí', Asignado: 'No' },
    { Facultad: 'Arquitectura', Codigo: '98765', Documento: '5566778899', PrimerNombre: 'Ana', SegundoNombre: 'Isabel', PrimerApellido: 'Gómez', SegundoApellido: 'Fernández', CorreoPersonal: 'ana@example.com', Telefono: '556677889', Sugerido: 'No', Asignado: 'Sí' },
    { Facultad: 'Economía', Codigo: '13579', Documento: '9988776655', PrimerNombre: 'José', SegundoNombre: 'María', PrimerApellido: 'Hernández', SegundoApellido: 'Sánchez', CorreoPersonal: 'jose@example.com', Telefono: '998877665', Sugerido: 'Sí', Asignado: 'No' }
  ];

  displayedColumns = ['Facultad', 'Codigo', 'Documento', 'PrimerNombre', 'SegundoNombre', 'PrimerApellido', 'SegundoApellido', 'CorreoPersonal', 'Telefono', 'Sugerido', 'Asignado'];
  displayedColumnsReplicada = ['Facultad', 'Codigo', 'Documento', 'PrimerNombre', 'SegundoNombre', 'PrimerApellido', 'SegundoApellido', 'CorreoPersonal', 'Telefono'];

  constructor(
    private translate: TranslateService,
    private sgaInscripcionMid: InscripcionMidService,
    private popUpManager: PopUpManager,
  ) {}

  loadData(): void {
    this.cargarDatosTabla(this.datos);
    this.cargarDatosTablaReplicada(this.datos);
  }

  cargarDatosTabla(datosCargados: any[]): void {
    this.source = new MatTableDataSource(datosCargados);
    this.source.paginator = this.paginator;
    this.source.sort = this.sort;
  }

  cargarDatosTablaReplicada(datosCargados: any[]): void {
    this.sourceReplicada = new MatTableDataSource(datosCargados);
    this.sourceReplicada.paginator = this.paginatorReplicada;
    this.sourceReplicada.sort = this.sort;
  }

  hideInactive() {
    this.showInactives = !this.showInactives;
    this.cargarDatosTabla(this.datos);
    this.cargarDatosTablaReplicada(this.datos);
  }

  ngOnInit() {
    this.cargarDatosTabla(this.datos);
    this.cargarDatosTablaReplicada(this.datos);
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event: any): void {
    this.cambiotab = event.index !== 0;
  }

  liberarCupos(periodoId: number) {
    const body = {
      "periodoId": periodoId
    }
    return new Promise((resolve, reject) => {
      this.sgaInscripcionMid.put('actualizar-cupos-admitidos-opcionados', body).subscribe((res: any) => {
        console.log(res);
        this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.cupos_liberados_exito'));
        resolve(res);
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.cupos_liberados_exito'));
          reject(error);
        });
    });
  }
}
