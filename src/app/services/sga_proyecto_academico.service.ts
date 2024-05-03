import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
    providedIn: "root",
  })
export class SgaProyectoAcademicoService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('API.PROYECTO_ACADEMICO_CRUD');
    }
    get(endpoint: string) {
        this.requestManager.setPath('API.PROYECTO_ACADEMICO_CRUD');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: string, element: any) {
    this.requestManager.setPath('API.PROYECTO_ACADEMICO_CRUD');
    return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any ) {
    this.requestManager.setPath('API.PROYECTO_ACADEMICO_CRUD');
    return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: string, element: { Id: any; }) {
    this.requestManager.setPath('API.PROYECTO_ACADEMICO_CRUD');
    return this.requestManager.delete(endpoint, element.Id);
    }
}