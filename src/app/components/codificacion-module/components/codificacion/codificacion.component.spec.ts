import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodificacionComponent } from './codificacion.component';

describe('CodificacionComponent', () => {
  let component: CodificacionComponent;
  let fixture: ComponentFixture<CodificacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodificacionComponent]
    });
    fixture = TestBed.createComponent(CodificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
