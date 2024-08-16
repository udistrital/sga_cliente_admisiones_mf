import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TiposCuposComponent } from '../tipos-cupos/tipos-cupos.component';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SoporteConfiguracionComponent } from 'src/app/components/soporte-configuracion/soporte-configuracion.component';
import { SoporteCupoInscripcionComponent } from '../soporte-cupo-inscripcion/soporte-cupo-inscripcion.component';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { Periodo } from 'src/app/models/periodo/periodo';
import { __awaiter } from 'tslib';


@Component({
  selector: "crud-asignacion-cupo",
  templateUrl: "./crud-asignacion_cupo.component.html",
  styleUrls: ["./crud-asignacion_cupo.component.scss"],
})
export class CrudAsignacionCupoComponent implements OnInit {

  cupo: any;
  cuposAdmitidos: number = 0;
  cuposOpcionados: number = 0;
  base64String!: string;
  errorMessage!: string;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado', 'tipo', 'cuposhabilitados', "cuposopcionados", "soporte", 'acciones'];

  @Input() info_periodo: any;
  @Input() info_proyectos: any;
  @Input() info_nivel!: boolean;
  @Output() eventChange = new EventEmitter();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  constructor(
    private newNuxeoService: NewNuxeoService,
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
        console.error("Error al obtener los cupos:", error);
      }
    );
  }

  CargarSoporte(data: any) {
    const dialogRef = this.dialogService.open(SoporteCupoInscripcionComponent, {
      width: '800px',
      data: event
    });
    dialogRef.afterClosed().subscribe(result => {
      data.base64 = result.result.base64;
      data.Comentario = result.result.comentario;
      data.TipoInscripcionId = this.dataSource.data[0].TipoInscripcionId
      data.PeriodoId = this.dataSource.data[0].PeriodoId
      data.ProyectoAcademicoId = this.dataSource.data[0].ProyectoAcademicoId
    });
  }

  TiposCupos() {
    const dialogRef = this.dialogService.open(TiposCuposComponent, {
      width: '1500px',
      data: this.dataSource.data
    });
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
      PeriodoId: cupo.PeriodoId,
      Descripcion: cupo.Descripcion,
      ProyectoAcademicoId: cupo.ProyectoAcademicoId,
      TipoInscripcionId: { Id: cupo.TipoInscripcionId },
    }
    this.inscripcion.put(`cupo_inscripcion/` + cupo.Id, data).subscribe((response: any) => {
      if (response != null || response != undefined || response != "") {
        alert("Cupo eliminado con exito");
        this.dataSource.data = [];
        this.obtenerCupos();
      }
    });

  }

  onAction(event: any) {
    if (event.action == 'eliminar') {
      this.EliminarCupo(event.data)
    }

    if (event.action == 'soporte') {

      this.CargarSoporte(event.data)

    }
  }

  guardarDocumento() {
    this.dataSource.data.forEach((element: any, index:any) => {
      const file: any[] = [];;
      if (element.Id == undefined) {
        file.push({
          IdDocumento: 74,
          base64: element.base64,
          nombre: element.Nombre,
          descripcion: element.Descripcion
        })
      }
      this.newNuxeoService.uploadFiles(file).subscribe((response: any) => {
        console.log(response)
        if (response[0].Status == "200") {
          console.log(response[0].res.Enlace)
          //element.Enlace = response[0].res.Enlace
          this.dataSource.data[index].Enlace = response[0].res.Enlace
        }
      });
    });
  }


  async guardarCupos() {
    let Validar = true;
    this.dataSource.data.forEach((element: any) => {
      if (element.Id == undefined) {
        if (element.base64 == undefined || element.Comentario == undefined || element.base64 == "" || element.Comentario == "") {
          Validar = false;
          alert("Cargar soporte");
          return;
        }

        if (element.CuposOpcionados == undefined || element.CuposHabilitados == undefined || element.cuposOpcionados == 0 || element.cuposHabilitados == 0) {
          Validar = false;
          alert("Asignar cantidad de cupos habilitados y opcionados");
          return;
        }
      }
    });
    if (Validar) {
      await this.guardarDocumento();
      console.log(this.dataSource.data)
      setTimeout(() => {
        this.inscripcionMidService.post('cupos', this.dataSource.data).subscribe(
          (response: any) => {
            if (response.Status == 200) {
              alert("Guardado con exito");
              console.log(response);
              this.dataSource.data = [];
              this.obtenerCupos();
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }, 3000);

    }
  }


  ngOnInit(): void {
    this.obtenerCupos();
  }








}
