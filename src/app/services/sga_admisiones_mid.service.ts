<<<<<<< HEAD:src/app/codificacion-module/services/sga_admisiones_mid.service.ts
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
=======
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
  }),
}

const path = environment.SGA_ADMISIONES_MID;

@Injectable()

export class SgaAdmisionesMid {

  constructor(private requestManager: RequestManager, private http: HttpClient) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
  }

  get(endpoint: any): any {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any ) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.put(endpoint, element);
  }
}
>>>>>>> develop:src/app/services/sga_admisiones_mid.service.ts
