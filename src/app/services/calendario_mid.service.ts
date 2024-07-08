import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable({
  providedIn: 'root',
})

export class CalendarioMidService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SGA_CALENDARIO_MID');
  }
  get(endpoint:string) {
    this.requestManager.setPath('SGA_CALENDARIO_MID');
    return this.requestManager.get(endpoint);
  }
  post(endpoint:string, element:any) {
    this.requestManager.setPath('SGA_CALENDARIO_MID');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint:string, element:any) {
    this.requestManager.setPath('SGA_CALENDARIO_MID');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint:string, element:any) {
    this.requestManager.setPath('SGA_CALENDARIO_MID');
    return this.requestManager.delete(endpoint, element.Id);
  }
}

