import { Component } from '@angular/core';

@Component({
  selector: 'app-tipo-cupos',
  standalone: false,
  template: `
    @if (formulario === null) {
      <app-lista-tipo-cupos
        (crear)="abrirCreacion()"
        (editar)="abrirEdicion($event)">
      </app-lista-tipo-cupos>
    } @else {
      <app-creacion-tipo-cupos
        [data]="formulario"
        (guardado)="volverAlListado()"
        (cancelado)="volverAlListado()">
      </app-creacion-tipo-cupos>
    }
  `,
})
export class TipoCuposComponent {
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