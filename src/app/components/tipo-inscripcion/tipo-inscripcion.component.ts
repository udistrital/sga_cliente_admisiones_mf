import { Component } from '@angular/core';

@Component({
  selector: 'app-tipo-inscripcion',
  standalone: false,
  template: `
    @if (formulario === null) {
      <app-lista-tipo-inscripcion
        (crear)="abrirCreacion()"
        (editar)="abrirEdicion($event)">
      </app-lista-tipo-inscripcion>
    } @else {
      <app-creacion-tipo-inscipcion
        [data]="formulario"
        (guardado)="volverAlListado()"
        (cancelado)="volverAlListado()">
      </app-creacion-tipo-inscipcion>
    }
  `,
})
export class TipoInscripcionComponent {
  formulario: { editando: boolean; info?: any } | null = null;

  abrirCreacion(): void {
    this.formulario = { editando: false };
  }

  abrirEdicion(registro: any): void {
    this.formulario = {
      editando: true,
      info: { ...registro },
    };
  }

  volverAlListado(): void {
    this.formulario = null;
  }
}