import { ProyectoAcademicoInstitucion } from "../proyecto_academico/proyecto_academico_institucion";

export class TransferenciaInternaReintegro {
    UniversidadOrigen!: string;
    ProgramaOrigen!: ProyectoAcademicoInstitucion;
    ProgramaOrigenInput!: string;
    CodigoEstudiante!: number;
    CodigoEstudianteExterno!: string;
    CantidadCreditos!: number;
    UltimoSemestre!: number;
    Cancelo!: boolean;
    ProgramaDestino!: ProyectoAcademicoInstitucion;
    MotivoCambio!: string
    SoporteDocumento!: number;
    Acuerdo!: boolean;
}
