import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-crud-tipo-cupo',
  templateUrl: './crud-tipo-cupo.component.html',
  styleUrls: ['./crud-tipo-cupo.component.scss']
})
export class CrudTipoCupoComponent {

  titulo!: string;
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  descripcion = new FormControl('', [Validators.required, Validators.minLength(2)]);
  tipo = new FormControl('', [Validators.required, Validators.minLength(2)]);
  subtipo = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(){

  }

}
