import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';


@Injectable({
  providedIn: 'root'
})
export class SgaProyectoCurricularMidService {
  constructor(
    private requestManager: RequestManager
  ) {
    this.requestManager.setPath('SGA_PROYECTO_CURRICULAR_MID');
  }

  get(endpoint: any) {
    this.requestManager.setPath('SGA_PROYECTO_CURRICULAR_MID');
    return this.requestManager.get(endpoint);
  }
  post(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_PROYECTO_CURRICULAR_MID');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_PROYECTO_CURRICULAR_MID');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint: any, element: { Id: any }) {
    this.requestManager.setPath('SGA_PROYECTO_CURRICULAR_MID');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
