import { Injectable } from '@angular/core';
import { RequestManager } from 'src/app/core/managers/requestManager';

@Injectable({
    providedIn: "root",
  })
export class SgaAdmisionesMidService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('API.ADMISIONES_MID');
    }
    get(endpoint: string) {
        this.requestManager.setPath('API.ADMISIONES_MID');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: string, element: any) {
    this.requestManager.setPath('API.ADMISIONES_MID');
    return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any ) {
    this.requestManager.setPath('API.ADMISIONES_MID');
    return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: string, element: { Id: any; }) {
    this.requestManager.setPath('API.ADMISIONES_MID');
    return this.requestManager.delete(endpoint, element.Id);
    }
}