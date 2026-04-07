import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesCorreosService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
  }

  get(endpoint:string) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.get(endpoint);
  }

  post(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.delete(endpoint, element.Id);
  }
}