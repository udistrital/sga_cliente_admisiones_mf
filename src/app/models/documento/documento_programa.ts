import { TipoDocumentoPrograma } from "./tipo_documento_programa";
export class DocumentoPrograma {
  Id!: number;
  Activo!: boolean;
  ProgramaId!: number;
  PeriodoId!: number;
  TipoDocumentoProgramaId!: TipoDocumentoPrograma;
  FechaCreacion!: Date;
  TipoInscripcionId!: number;
  Obligatorio!: boolean;
}
