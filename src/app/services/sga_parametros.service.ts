import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
    providedIn: "root",
  })
export class SgaParametrosService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('PARAMETROS_SERVICE');
    }
    get(endpoint: string) {
        this.requestManager.setPath('PARAMETROS_SERVICE');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: string, element: any) {
    this.requestManager.setPath('PARAMETROS_SERVICE');
    return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any ) {
    this.requestManager.setPath('PARAMETROS_SERVICE');
    return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: string, element: { Id: any; }) {
    this.requestManager.setPath('PARAMETROS_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
    }
}