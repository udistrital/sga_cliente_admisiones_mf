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

  checked = 0;
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = ["check", "Nombre", "Descripcion", "Codigo", "Estado", "Acciones"];



  constructor(
    private dialogService: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parametroService: SgaParametrosService,
    public dialogRef: MatDialogRef<AsignacionCupoService>,
  ) {
    this.cargarDatosTiposCupos();
  }

  cargarDatosTiposCupos() {
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
    if (event.action == 'crear') {
      this.dialogService.open(CrudTipoCupoComponent, {
        width: '500px',
      });
    }

    if (event.action == 'edit') {

      this.dialogService.open(CrudTipoCupoComponent, {
        width: '500px',
        data: event.data
       });

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



  onNoClick(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(event: Event, cupo: any) {
    const inputElement = event.target as HTMLInputElement;

    if (this.checked == 0) {
      this.checked = 1;
      cupo.check = inputElement.checked;
    } else {
      alert('Solo se puede seleccionar un tipo de cupo');
      cupo.check = false;
      inputElement.checked = false; // Desmarcar el checkbox en el DOM
    }
  }
  onYesClick(): void {
    const dataResult: any[] = [];
    this.dataSource.data.forEach((element: any) => {
      if (element.check == true) {
        dataResult.push(element);
      }
    });
    this.dialogRef.close({ result: dataResult });
  }

}
