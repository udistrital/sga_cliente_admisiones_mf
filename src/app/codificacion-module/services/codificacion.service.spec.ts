import { TestBed } from '@angular/core/testing';

import { CodificacionService } from './codificacion.service';

describe('CodificacionService', () => {
  let service: CodificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
