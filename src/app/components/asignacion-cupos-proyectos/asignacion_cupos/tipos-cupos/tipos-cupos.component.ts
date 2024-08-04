import { Component, Inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { CrudTipoCupoComponent } from '../crud-tipo-cupo/crud-tipo-cupo.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SgaParametrosService } from 'src/app/services/sga_parametros.service';
import { MatPaginator } from '@angular/material/paginator';
import { AsignacionCupoService } from 'src/app/services/asignacion_cupo.service';

@Component({
  selector: 'app-tipos-cupos',
  templateUrl: './tipos-cupos.component.html',
  styleUrls: ['./tipos-cupos.component.scss']
})
export class TiposCuposComponent {

  displayedColumns = ["check", "Nombre", "Descripcion", "Codigo", "Estado", "Acciones"];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<AsignacionCupoService>,
    private dialogService: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parametroService: SgaParametrosService,

  ) {
    this.parametroService.get("parametro?query=TipoParametroId:87&limit=0")
      .subscribe((response: any) => {
        if (response.Status == '200' && response.Success == true && response.Data.length > 0) {

          response.Data.forEach((element: any) => {
            element.check = false;
            this.data.forEach((element2: any) => {
              if (element2.CupoId == element.Id) {
                element.check = true;
              }
            });

          });
          this.dataSource.data = response.Data;
          this.dataSource.paginator = this.paginator;

        }
      });
  }

  onAction(event: any) {
    if (event.action == 'edit') {

      this.dialogService.open(CrudTipoCupoComponent, { data: event.data });

    } else if (event.action == 'delete') {

      event.data.Activo = !event.data.Activo
      this.parametroService.put("parametro/", event.data).subscribe((response: any) => {
        if (response.Status == '200' && response.Success == true) {
          alert('Registro Actualizado con exito');
        } else {
          alert('Error al Actualizar estado de registro');
        }
      });

    }

  }

  CrearEditarTiposCupos() {
    this.dialogService.open(CrudTipoCupoComponent);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(event: Event, cupo: any) {
    const inputElement = event.target as HTMLInputElement;
    cupo.check = inputElement.checked;
  }

  onYesClick(): void {
    const dataResult: any[] = [];
    this.dataSource.data.forEach((element: any) => {
      if (element.check == true) {
        dataResult.push(element);
      }
    });    
    console.log(dataResult)
    this.dialogRef.close({ result: dataResult });
  }

}
