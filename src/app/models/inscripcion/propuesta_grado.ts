import { TipoProyecto } from '../investigacion/tipo_proyecto';
import { Inscripcion } from './inscripcion';
import { GrupoInvestigacion } from '../investigacion/grupo_investigacion';

export class PropuestaGrado {
  Id!: number;
  Nombre!: string;
  Resumen!: string;
  GrupoInvestigacion: GrupoInvestigacion = new GrupoInvestigacion;
  LineaInvestigacion: any;
  FormatoProyecto!: string;
  DocumentoId!: number;
  GrupoInvestigacionId!: number;
  LineaInvestigacionId!: number;
  InscripcionId!: Inscripcion;
  TipoProyecto: TipoProyecto = new TipoProyecto;
  TipoProyectoId: TipoProyecto = new TipoProyecto;
  Soporte: any;
}
