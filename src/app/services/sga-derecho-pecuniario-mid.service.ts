import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root'
})
export class SgaDerechoPecuniarioMidService {

  constructor(private requestManager: RequestManager) {}

  get(endpoint: string) {
    this.requestManager.setPath('SGA_DERECHO_PECUNARIO_MID');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_DERECHO_PECUNARIO_MID');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_DERECHO_PECUNARIO_MID');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: string, elementId: string) {
    this.requestManager.setPath('SGA_DERECHO_PECUNARIO_MID');
    return this.requestManager.delete(endpoint, elementId);
  }
}
