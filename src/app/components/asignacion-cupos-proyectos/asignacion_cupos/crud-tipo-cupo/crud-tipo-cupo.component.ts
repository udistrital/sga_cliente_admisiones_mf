
import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SgaParametrosService } from 'src/app/services/sga_parametros.service';

@Component({
  selector: 'app-crud-tipo-cupo',
  templateUrl: './crud-tipo-cupo.component.html',
  styleUrls: ['./crud-tipo-cupo.component.scss']
})
export class CrudTipoCupoComponent {


  titulo: string = "Crear";
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  descripcion = new FormControl('', [Validators.required, Validators.minLength(2)]);
  codigoAbreviacion = new FormControl('', [Validators.required, Validators.minLength(2)]);
  numeroOrden = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(

    @Inject(MAT_DIALOG_DATA) public data: any,
    private parametoService: SgaParametrosService

  ) {

    if (this.data != null) {
      this.titulo = "Editar"
      this.nombre.setValue(this.data.Nombre);
      this.descripcion.setValue(this.data.Descripcion);
      this.codigoAbreviacion.setValue(this.data.CodigoAbreviacion);
      this.numeroOrden.setValue(this.data.NumeroOrden);
    }

  }

  TipoCupoguardar() {
    const currentDate = new Date().toISOString().replace('T', ' ').replace('Z', ' +0000 +0000');
    const data = {
      Activo: true,
      CodigoAbreviacion: this.codigoAbreviacion.value,
      Descripcion: this.descripcion.value,
      FechaCreacion: currentDate,
      FechaModificacion:currentDate,
      Nombre: this.nombre.value,
      NumeroOrden: this.numeroOrden.value,
      TipoParametroId: {
        Id: 87
      }
    }

    if (this.nombre.valid && this.descripcion.valid && this.codigoAbreviacion.valid && this.numeroOrden.valid) {
      if(this.titulo == "Crear"){

  
        this.parametoService.post("parametro", data)
          .subscribe((response: any) => {
            if (response.Status == '201' && response.Success == true) {
              alert('Registro guardado con exito');
            }
          });
      }
      
      else{  
        this.parametoService.put("parametro/"+this.data.Id, data)
          .subscribe((response: any) => {
            if (response.Status == '200' && response.Success == true) {
              alert('Registro guardado con exito');
            }
          });
      }
    }
  }
}
