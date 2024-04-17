import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

const path = environment.DOCUMENTO_PROGRAMA_SERVICE;

@Injectable({
  providedIn: 'root',
})

export class DocumentoProgramaService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('DOCUMENTO_PROGRAMA_SERVICE');
  }

  get(endpoint: string) {
    this.requestManager.setPath('DOCUMENTO_PROGRAMA_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint: any, element: any) {
    this.requestManager.setPath('DOCUMENTO_PROGRAMA_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint: any, element: any) {
    this.requestManager.setPath('DOCUMENTO_PROGRAMA_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint: any, element: any) {
    this.requestManager.setPath('DOCUMENTO_PROGRAMA_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
