import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable()
export class NotificacionesMidService {
    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('NOTIFICACION_MID');
      }
      get(endpoint:string) {
        this.requestManager.setPath('NOTIFICACION_MID');
        return this.requestManager.get(endpoint);
      }
      post(endpoint:string, element:any) {
        this.requestManager.setPath('NOTIFICACION_MID');
        return this.requestManager.post(endpoint, element);
      }
      put(endpoint:string, element:any) {
        this.requestManager.setPath('NOTIFICACION_MID');
        return this.requestManager.put(endpoint, element);
      }
      delete(endpoint:string, element:any) {
        this.requestManager.setPath('NOTIFICACION_MID');
        return this.requestManager.delete(endpoint, element.Id);
      }
    }