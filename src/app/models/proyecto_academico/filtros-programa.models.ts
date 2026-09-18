export interface OpcionPrograma {
  Id: number;
  Nombre: string;
}

export interface SeleccionPrograma {
  periodo: any;
  facultad: OpcionPrograma | null;
  nivel: any;
  programa: any;
}
