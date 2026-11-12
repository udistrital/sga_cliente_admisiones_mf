import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  constructor(private requestManager: RequestManager) {}

  get<T = unknown>(endpoint: string): Observable<T> {
    this.requestManager.setPath('CONFIGURACION_SERVICE');
    return this.requestManager.get<T>(endpoint);
  }
}