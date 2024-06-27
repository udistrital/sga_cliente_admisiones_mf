import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-creacion-tipo-inscipcion',
  templateUrl: './creacion-tipo-inscipcion.component.html',
  styleUrls: ['./creacion-tipo-inscipcion.component.scss']
})
export class CreacionTipoInscipcionComponent {

  constructor(
    private fb: FormBuilder,
  ) {}

  infoTipoInscripcion = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    codigo_abreviacion: ['', Validators.required],
    numero_orden: [''],
    nivel: ['', Validators.required],
    especial: ['', Validators.required]
  });

}
