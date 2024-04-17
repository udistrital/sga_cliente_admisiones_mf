import { TipoIdentificacion } from './tipo_identificacion';
import { EstadoCivil } from './estado_civil';
import { Genero } from './genero';
import { OrientacionSexual } from './orientacion_sexual';
import { IdentidadGenero } from './identidad_genero';

export class InfoPersona {
  PrimerNombre!: string;
  SegundoNombre!: string;
  PrimerApellido!: string;
  SegundoApellido!: string;
  TipoIdentificacion!: TipoIdentificacion;
  NumeroIdentificacion!: string;
  FechaNacimiento!: string;
  FechaExpedicion!: string;
  EstadoCivil!: EstadoCivil;
  Genero!: Genero;
  OrientacionSexual!: OrientacionSexual;
  IdentidadGenero!: IdentidadGenero;
  Usuario!: string;  
  Id!: number;
  Telefono!: Number;
}
