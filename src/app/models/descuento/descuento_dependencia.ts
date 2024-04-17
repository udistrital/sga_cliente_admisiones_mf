import { TipoDescuento } from './tipo_descuento';

export class DescuentoDependencia {
  Id!: number;
  DependenciaId!: number;
  PeriodoId!: number;
  PorcentajeDescuento!: number;
  Activo!: boolean;
  TipoDescuentoId!: TipoDescuento;
}
