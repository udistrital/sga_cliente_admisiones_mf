export class Periodo {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Year: number;
  Ciclo: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  AplicacionId: number;
  InicioVigencia: string
  FinVigencia: string;
  FechaCreacion: string;
  FechaModificacion: string;

  constructor(data: Partial<Periodo>) {
      this.Id = data.Id ?? 0;
      this.Nombre = data.Nombre ?? '';
      this.Descripcion = data.Descripcion ?? '';
      this.Year = data.Year ?? 0;
      this.Ciclo = data.Ciclo ?? '';
      this.CodigoAbreviacion = data.CodigoAbreviacion ?? '';
      this.Activo = data.Activo ?? false;
      this.AplicacionId = data.AplicacionId ?? 0;
      this.InicioVigencia = data.InicioVigencia ?? '';
      this.FinVigencia = data.FinVigencia ?? '';
      this.FechaCreacion = data.FechaCreacion ?? '';
      this.FechaModificacion = data.FechaModificacion ?? '';
  }
}