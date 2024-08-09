import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteCupoInscripcionComponent } from './soporte-cupo-inscripcion.component';

describe('SoporteCupoInscripcionComponent', () => {
  let component: SoporteCupoInscripcionComponent;
  let fixture: ComponentFixture<SoporteCupoInscripcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SoporteCupoInscripcionComponent]
    });
    fixture = TestBed.createComponent(SoporteCupoInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
