import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignacionCupoService {
  private datosSeleccionados = new BehaviorSubject<any>(null);
  datosSeleccionados$ = this.datosSeleccionados.asObservable();

  constructor() { }

  enviarDatos(datos: any) {
    this.datosSeleccionados.next(datos);
  }
}