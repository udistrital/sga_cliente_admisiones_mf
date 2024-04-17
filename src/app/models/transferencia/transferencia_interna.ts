import { Calendario } from "./calendario";
import { Periodo } from "../periodo/periodo";
import { ProyectoAcademicoInstitucion } from "../proyecto_academico/proyecto_academico_institucion";
import { InfoComplementariaTercero } from "../terceros/info_complementaria_tercero";
import { TipoInscripcion } from "../inscripcion/tipo_inscripcion";

export class TransferenciaInterna {
    Periodo!: Periodo | null;
    CalendarioAcademico!: Calendario | null;
    TipoInscripcion!: TipoInscripcion | null;
    CodigoEstudiante!: InfoComplementariaTercero | null;
    ProyectoCurricular!: ProyectoAcademicoInstitucion | null;
}
