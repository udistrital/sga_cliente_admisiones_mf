export class liquidacion {
  estado_edicion!: boolean;
  inscripcionId!: number;
  personaId!: number;
  seleccion!: boolean;
  codigo!: number;
  documetno!: number;
  nombres!: string;
  apellidos!: string;
  A!: {
    A1: string;
    puntajeA1: number;
    A2: string;
    puntajeA2: number;
    A3: string;
    puntajeA3: number;
  }
  B!: {
    B1: string;
    puntajeB1: number;
    B2: string;
    puntajeB2: number;
    B3: string;
    puntajeB3: number;
    B4: string;
    puntajeB4: number;
  }

  general!: {
    pbm: number
  }
}
