import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from '../../services/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SolicitudesAdmisiones } from 'src/app/services/solicitudes_admisiones.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-listados-oficializados',
  templateUrl: './listados-oficializados.component.html',
  styleUrls: ['./listados-oficializados.component.scss']
})
export class ListadosOficializadosComponent implements OnInit {

  uid: number = 0;
  cambiotab: boolean = false;
  source: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  showInactives: boolean = true;
  datos: any[] = [];
  displayedColumns = ['Proceso', 'Fechas', 'Estado', 'Gestion'];
  @Output() editarElemento = new EventEmitter<number>();

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private solicitudesAdmisiones: SolicitudesAdmisiones,
  ) {
    this.source = new MatTableDataSource<any>([]); 
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }
  
  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.solicitudesAdmisiones.get('solicitud?query=EstadoTipoSolicitudId.TipoSolicitud.Id:40').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>><unknown>res;
        this.datos = data.map(item => ({
          Proceso: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
          Fechas: this.formatDate(item.FechaRadicacion), 
          Estado: item.EstadoTipoSolicitudId.EstadoId.Nombre,
          Gestion: item 
        }));
        this.datos.sort((a, b) => new Date(b.Fechas).getTime() - new Date(a.Fechas).getTime()); // Ordenar por fecha descendente
        this.source = new MatTableDataSource(this.datos);
        this.source.paginator = this.paginator;
        this.source.sort = this.sort;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  cargarDatosTabla(datosCargados: any[]): void {
    let datos = this.showInactives ? datosCargados : datosCargados.filter(d => d.Activo == true);
    this.source = new MatTableDataSource(datos);
    this.source.paginator = this.paginator;
    this.source.sort = this.sort;
  }

  hideInactive() {
    this.showInactives = !this.showInactives;
    this.cargarDatosTabla(this.datos);
  }

  ngOnInit() { 
    this.source = new MatTableDataSource<any>([]); 
    this.addFakeRecords();
  } 

  onEdit(event: any) {
    if (event && event.Id) {
      this.uid = event.Id;
      this.activetab();
    } else {
      console.error('No se pudo obtener el ID del elemento seleccionado.');
    }
  }

  onCreate() {
    this.uid = 0;
    this.activetab();
  }

  onDelete(event: any): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('tipo_inscripcion.seguro_deshabilitar_tipo_inscripcion'),
      this.translate.instant('tipo_inscripcion.inactivar'),
    ).then(willDelete => {
      if (willDelete.value) {
        this.inscripcionService.put('tipo_inscripcion/' + event.Id,
          JSON.stringify({
            Activo: false,
            CodigoAbreviacion: event.CodigoAbreviacion,
            Descripcion: event.Descripcion,
            Especial: event.Especial,
            FechaCreacion: event.FechaCreacion,
            FechaModificacion: event.FechaModificacion,
            Id: event.Id,
            NivelId: event.NivelId,
            Nombre: event.Nombre,
            NumeroOrden: event.NumeroOrden,
          }),
        ).subscribe((response: any) => {
          if (JSON.stringify(response) == null) {
            this.popUpManager.showErrorAlert(
              this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'),
            );
          } else {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado'),
            );
            this.loadData();
          }
        },
          error => {
            this.popUpManager.showErrorToast(
              this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'),
            );
          },
        );
      }
    });
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event: any): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event: any) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }

  itemselec(event: any): void {
    return;
  }

  addFakeRecords() {
    const fakeRecords = [
      { Proceso: 'Proceso 1', Fechas: 'Fecha 1 - Fecha 2', Estado: 'Abierto' },
      { Proceso: 'Proceso 2', Fechas: 'Fecha 3 - Fecha 4', Estado: 'Culminado' },
      { Proceso: 'Proceso 3', Fechas: 'Fecha 5 - Fecha 6', Estado: 'Solicitud de correos realizada' },
      { Proceso: 'Proceso 4', Fechas: 'Fecha 7 - Fecha 8', Estado: 'Abierto' },
      { Proceso: 'Proceso 5', Fechas: 'Fecha 9 - Fecha 10', Estado: 'Abierto' }
    ];
    this.source.data = fakeRecords;
  }

  formatCurrentDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${this.padToTwoDigits(date.getMonth() + 1)}-${this.padToTwoDigits(date.getDate())}`;
  }

  padToTwoDigits(num: number): string {
    return num.toString().padStart(2, '0');
  }

  generarSolicitud(): void {
    const solicitudData = {
      EstadoTipoSolicitudId: { Id: 92 },
      Referencia: "{}",
      Resultado: "",
      FechaRadicacion: this.formatCurrentDate(),
      FechaCreacion: null,
      FechaModificacion: null,
      SolicitudFinalizada: false,
      Activo: true,
      SolicitudPadreId: null
    };

    this.solicitudesAdmisiones.post('solicitud', solicitudData).subscribe(() => {
      this.loadData();
    }, error => {
      console.error('Error al generar la solicitud:', error);
    });
  }
}