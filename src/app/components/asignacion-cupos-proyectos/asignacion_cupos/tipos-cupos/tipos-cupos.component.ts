import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { CrudTipoCupoComponent } from '../crud-tipo-cupo/crud-tipo-cupo.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tipos-cupos',
  templateUrl: './tipos-cupos.component.html',
  styleUrls: ['./tipos-cupos.component.scss']
})
export class TiposCuposComponent {


  dataSource = new MatTableDataSource();
  displayedColumns = ["Nombre", "Descripcion", "Tipo", "Subtipo", "Estado", "Acciones"];

  constructor(
    private inscripcionService: InscripcionService,
    private dialogService: MatDialog,
  ) {
    this.inscripcionService.get("cupo_inscripcion?query=Activo:true&limit=0")
    .subscribe({})
  }

  CrearEditarTiposCupos() {
    this.dialogService.open(CrudTipoCupoComponent);
  }


}
