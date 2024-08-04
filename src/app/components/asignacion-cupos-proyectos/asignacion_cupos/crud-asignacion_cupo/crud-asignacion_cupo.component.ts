import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TiposCuposComponent } from '../tipos-cupos/tipos-cupos.component';
import { InscripcionService } from 'src/app/services/inscripcion.service';


@Component({
  selector: 'crud-asignacion-cupo',
  templateUrl: './crud-asignacion_cupo.component.html',
  styleUrls: ['./crud-asignacion_cupo.component.scss'],
})
export class CrudAsignacionCupoComponent implements OnInit {

  cupo: any;
  cuposAdmitidos: number = 0;
  cuposOpcionados: number = 0;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado', 'tipo', 'cuposhabilitados', "cuposopcionados", 'acciones'];

  @Input() info_periodo: any;
  @Input() info_proyectos: any;
  @Input() info_nivel!: boolean;
  @Output() eventChange = new EventEmitter();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private dialogService: MatDialog,
    private inscripcion: InscripcionService,
    private inscripcionMidService: InscripcionMidService,

  ) { }

  obtenerCupos() {
    this.http.get<any>(`${environment.INSCRIPCION_MID_SERVICE}/cupos/`).subscribe(
      (response) => {
        response.Data.forEach((element: any) => {
          this.cuposAdmitidos = this.cuposAdmitidos + element.CuposHabilitados
          this.cuposOpcionados = this.cuposOpcionados + element.CuposOpcionados
        });
        this.dataSource = new MatTableDataSource(response.Data)
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al obtener los cupos:', error);
      }
    );
  }

  CrudTiposCupos() {
    const dialogRef = this.dialogService.open(TiposCuposComponent, { 
      width: '1500px',  // Define el ancho de la modal
      data: this.dataSource.data });
    dialogRef.afterClosed().subscribe(result => {
      this.logicaTablaCloseModal(result.result)
    });

  }

  logicaTablaCloseModal(result: any) {
    this.dataSource.data.forEach((element: any) => {
      const exist = result.some((item: any) => item.Id === element.CupoId);
      if (exist == false) {
        this.dataSource.data.splice(this.dataSource.data.indexOf(element), 1)
        this.dataSource.paginator = this.paginator;
      }
    });

    result.forEach((element: any) => {
      const exist = this.dataSource.data.some((item: any) => item.CupoId === element.Id);
      if (exist == false) {
        const registro = {
          Nombre: element.Nombre,
          Descripcion: element.Descripcion,
          Tipo: element.Tipo,
          Activo: true,
          NombreInscripcion: this.dataSource.data[0].NombreInscripcion,
          CuposHabilitados: element.CuposHabilitados,
          CuposOpcionados: element.CuposOpcionados,
          CupoId: element.Id
        }
        this.dataSource.data.push(registro)
        this.dataSource.paginator = this.paginator;
      }
    });
  }


  EliminarCupo(cupo: any) {
    console.log(cupo)
    const data = {
      Activo: !cupo.Activo,
      CupoId: cupo.CupoId,
      CuposHabilitados: cupo.CuposHabilitados,
      CuposOpcionados: cupo.CuposOpcionados,
      NombreInscripcion: cupo.NombreInscripcion,
      Nombre: cupo.Nombre,
      Descripcion: cupo.Descripcion,
      ProyectoAcademicoId: cupo.ProyectoAcademicoId,
      TipoInscripcionId: {Id:cupo.TipoInscripcionId},
    }
    this.inscripcion.put(`cupo_inscripcion/`+cupo.Id, data).subscribe((response: any) => {
      console.log(response)
    });

  }

  onAction(event: any) {
    if (event.action == 'eliminar') {
      this.EliminarCupo(event.data)
    }

  }

  ngOnInit(): void {
    this.obtenerCupos();
  }








}
