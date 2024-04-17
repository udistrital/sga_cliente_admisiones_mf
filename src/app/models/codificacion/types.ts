export interface NivelFormacion {
  Id: number;
  Nombre: string;
  Descripcion: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  NumeroOrden: number;
  FechaCreacion: string;
  FechaModificacion: string;
  NivelFormacionPadreId: NivelFormacion | null;
}

export interface ProyectoCurricular {
  Id: number;
  Codigo: string;
  Nombre: string;
  CodigoSnies: string;
  Duracion: number;
  CorreoElectronico: string;
  NumeroCreditos: number;
  CiclosPropedeuticos: boolean;
  NumeroActoAdministrativo: number;
  EnlaceActoAdministrativo: string;
  Competencias: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
  UnidadTiempoId: number;
  AnoActoAdministrativo: string;
  Oferta: boolean;
  DependenciaId: number;
  AreaConocimientoId: number;
  NucleoBaseId: number;
  MetodologiaId: Metodologia;
  NivelFormacionId: NivelFormacion;
  FacultadId: number;
  ProyectoPadreId?: ProyectoCurricular;
  ModalidadId?: number;
}

export interface Metodologia {
  Id: number;
  Nombre: string;
  Descripcion: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  NumeroOrden: number;
  FechaCreacion: string;
  FechaModificacion: string;
}

export interface Metodologia {
  Id: number;
  Nombre: string;
  Descripcion: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  NumeroOrden: number;
  FechaCreacion: string;
  FechaModificacion: string;
}

export interface PeriodoAcademico {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Year: number;
  Ciclo: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  AplicacionId: number;
  InicioVigencia: string; // O Date, si prefieres trabajar con objetos Date
  FinVigencia: string; // O Date, por la misma razón
  FechaCreacion: string; // O Date
  FechaModificacion: string; // O Date
}

interface RespuestaAPI {
  Data: PeriodoAcademico[];
  Message: string;
  Status: string;
  Success: boolean;
}

export interface Admitido {
  id: number;
  apellido: string;
  nombre: string;
  estadoAdmision: string;
  enfasis: string;
  numeroDocumento: string;
  codigo: string;
}

export interface SelectOption {
  value: number;
  viewValue: string;
}

export interface planEstudios {
  id: number;
  nombre: string;
}
