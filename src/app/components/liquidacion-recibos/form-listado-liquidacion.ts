import { Component } from '@angular/core';

// Modelo de datos para DETALLES DEL PAGO
export interface DetallesPago {
  codigo: string;
  cedula: string;
  nombreApellido: string;
  creditos: number;
  cuotas: number;
}

// Modelo de datos para CONCEPTOS BASE
export interface ConceptosBase {
  seguroEstudiantil: boolean;
  carneEstudiantil: boolean;
  sistematizacion: boolean;
}

// Modelo de datos para CONCEPTOS DESCUENTOS
export interface ConceptosDescuentos {
  votacion: boolean;
  monitor: boolean;
  egresado: boolean;
  docente: boolean;
  beneficiario: boolean;
  beca: boolean;
  mejorECAES: boolean;
  gradoHonor: boolean;
  segundoHermano: boolean;
  secretariaEducacion: boolean;
  doctoradoInterinstitucio: boolean;
}

export interface Cuotas {
  primeraCuota: number;
  segundaCuota: number;
  terceraCuota: number;
  fechaCuotaUno: string;
  fechaCuotaDos: string;
  fechaCuotaTres: string;
}