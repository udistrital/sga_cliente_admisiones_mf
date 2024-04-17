import { Injectable } from '@angular/core';
import { RequestManager } from 'src/app/core/managers/requestManager';

@Injectable({
    providedIn: "root",
  })
export class SgaParametrosService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('API.PARAMETRO_CRUD');
    }
    get(endpoint: string) {
        this.requestManager.setPath('API.PARAMETRO_CRUD');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: string, element: any) {
    this.requestManager.setPath('API.PARAMETRO_CRUD');
    return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any ) {
    this.requestManager.setPath('API.PARAMETRO_CRUD');
    return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: string, element: { Id: any; }) {
    this.requestManager.setPath('API.PARAMETRO_CRUD');
    return this.requestManager.delete(endpoint, element.Id);
    }
}