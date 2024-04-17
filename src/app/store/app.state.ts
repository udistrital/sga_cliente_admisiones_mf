import { TipoLugar } from '../models/informacion/tipo_lugar';
import { TipoDiscapacidad } from '../models/informacion/tipo_discapacidad';
import { TipoContacto } from '../models/informacion/tipo_contacto';
import { ProgramaAcademico } from '../models/proyecto_academico/programa_academico';
import { NivelIdioma } from '../models/idioma/nivel_idioma';
import { NivelFormacion } from '../models/proyecto_academico/nivel_formacion';
import { Metodologia } from '../models/proyecto_academico/metodologia';
import { Lugar } from '../models/informacion/lugar';
import { LineaInvestigacion } from '../models/investigacion/linea_investigacion';
import { TipoParametro } from '../models/parametro/tipo_parametro';
import { Idioma } from '../models/idioma/idioma';
import { TipoPoblacion } from '../models/informacion/tipo_poblacion';
import { EstadoCivil } from '../models/informacion/estado_civil';
import { EstadoInscripcion } from '../models/inscripcion/estado_inscripcion';
import { ClasificacionNivelIdioma } from '../models/idioma/clasificacion_idioma';
import { Genero } from '../models/informacion/genero';
import { Titulacion } from '../models/proyecto_academico/titulacion';
import { TipoIdentificacion } from '../models/informacion/tipo_identificacion';
import { TipoProyecto } from '../models/investigacion/tipo_proyecto';
import { TipoTercero } from '../models/terceros/tipo_tercero';
import { GrupoInvestigacion } from '../models/investigacion/grupo_investigacion';
import { PeriodoAcademico } from '../models/periodo/periodo_academico';
import { InfoComplementaria } from '../models/terceros/info_complementaria';
import { TipoDocumento } from '../models/documento/tipo_documento';
import { TipoContribuyente } from '../models/terceros/tipo_contribuyente';
import { OrientacionSexual } from '../models/informacion/orientacion_sexual';
import { IdentidadGenero } from '../models/informacion/identidad_genero';
// import { TipoPublicacionLibro } from '../data/models/tipo_publicacion_libro';

export interface IAppState {
  listGenero: Genero[],
  listOrientacionSexual: OrientacionSexual[],
  listIdentidadGenero: IdentidadGenero[],
  listClasificacionNivelIdioma: ClasificacionNivelIdioma[],
  listEstadoInscripcion: EstadoInscripcion[],
  listEstadoCivil: EstadoCivil[],
  listGrupoSanguineo: Genero[] ,
  listFactorRh: Genero [],
  listICFES: Genero [],
  listEPS: Genero [],
  listTipoPoblacion: TipoPoblacion[],
  listIdioma: Idioma[],
  listLineaInvestigacion: LineaInvestigacion[],
  listTipoParametro: TipoParametro[],
  listPais: Lugar[],
  listCiudad: Lugar[],
  listLugar: Lugar[],
  listMetodologia: Metodologia[],
  listNivelFormacion: NivelFormacion[],
  listNivelIdioma: NivelIdioma[],
  listProgramaAcademico: ProgramaAcademico[],
  listTipoContribuyente: TipoContribuyente[],
  listTipoDocumento: TipoDocumento[],
  listTipoContacto: TipoContacto[],
  listTipoDiscapacidad: TipoDiscapacidad[],
  listTipoLugar: TipoLugar[],
  listTitulacion: Titulacion[],
  listTipoIdentificacion: TipoIdentificacion[],
  listTipoProyecto: TipoProyecto[],
  listGrupoInvestigacion: GrupoInvestigacion[],
  listPeriodoAcademico: PeriodoAcademico[],
  listLocalidadesBogota: InfoComplementaria[],
  listTipoColegio: InfoComplementaria[],
  listSemestresSinEstudiar: InfoComplementaria[],
  listMediosEnteroUniversidad: InfoComplementaria[],
  listSePresentaAUniversidadPor: InfoComplementaria[],
  listTipoInscripcionUniversidad: InfoComplementaria[],
  listTipoDedicacion: InfoComplementaria[],
  listTipoVinculacion: InfoComplementaria[],
  listTipoTercero: TipoTercero[],
  listCargo: InfoComplementaria[],
  listTipoOrganizacion: InfoComplementaria[],
  listDocumentoPrograma: any[],
  listDescuentoDependencia: any[],
  listInfoSocioEconomica: InfoComplementaria[],
  listInfoContacto: InfoComplementaria[],
  // listTipoPublicacionLibro: TipoPublicacionLibro[],
}
