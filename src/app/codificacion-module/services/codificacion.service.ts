import { Injectable } from "@angular/core";
import { RequestManager } from "src/app/core/managers/requestManager";
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class CodificacionService {
  constructor(private requestManager: RequestManager) { }

  getNiveles() {
    this.requestManager.setPath("API.PROYECTO_ACADEMICO_CRUD");
    return this.requestManager.get(
      "nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0"
    );
  }

  getProyectosCurriculares() {
    this.requestManager.setPath("API.PROYECTO_ACADEMICO_CRUD");
    return this.requestManager.get(
      "proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0"
    );
  }

  getPlanDeEstudios(idProyecto: number) {
    this.requestManager.setPath("API.PLANES_ESTUDIO_CRUD");
    return this.requestManager.get(
      `plan_estudio?query=ProyectoAcademicoId:${idProyecto},Activo:true&sortby=Nombre&order=asc&imit=0`
    );
  }

  getAdmitidos(periodoId: number, proyectoId: number, periodoValor: string, codigoProyecto: string) {
    this.requestManager.setPath("API.ADMISIONES_MID");
    return this.requestManager.get(
      `codificacion/getAdmitidos/?id_periodo=${periodoId}&id_proyecto=${proyectoId}&valor_periodo=${periodoValor}&codigo_proyecto=${codigoProyecto}`
    );
  }

  postGenerarCodigos(data: Array<Record<string, any>>, sortTipo: number) {
    this.requestManager.setPath("API.ADMISIONES_MID");
    return this.requestManager.post(
      `codificacion/generarCodigos/?tipo_sort=${sortTipo}`, data
    );
  }


  postGuardarCodigos(data: Array<Record<string, any>>) {
    this.requestManager.setPath("API.ADMISIONES_MID");
    return this.requestManager.post(
      "codificacion/guardarCodigos", data
    );
  }

  getPeriodosAcademicos() {
    this.requestManager.setPath("API.PARAMETRO_CRUD");
    return this.requestManager.get("periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0")
      .pipe(
        map((response: any) => {
          // Verifica si 'Data' existe y es una lista
          if (response && Array.isArray(response.Data)) {
            return response.Data;
          } else {
            // Manejo de una respuesta inesperada
            // Puedes lanzar un error o retornar una lista vacía
            throw new Error('Respuesta inesperada: no se encontró "Data"');
            // O retornar una lista vacía si prefieres
            // return [];
          }
        }),
        catchError((error) => {
          // Manejo de errores de la petición HTTP
          // Aquí puedes decidir cómo manejar estos errores,
          // por ejemplo, mostrar un mensaje al usuario, registrar el error, etc.
          console.error('Error en la petición HTTP:', error);
          // Es opcional lanzar el error o manejarlo de alguna otra forma
          throw error;
        })
      );
  }
}
