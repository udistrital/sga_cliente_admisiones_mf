import { MatTableDataSource } from "@angular/material/table";

export class Criterio {
    Id!: number;
    Nombre!: string;
    Descripcion!: string;
    CodigoAbreviacion!: string;
    Asistencia!: boolean;
    Activo!: boolean;
    NumeroOrden!: number;
    FechaCreacion!: Date;
    FechaModificacion!: Date;
    RequisitoPadreId!: { Id: number };
 Subcriterios!: Criterio[];

}