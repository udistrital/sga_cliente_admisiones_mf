import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepotesInscripcionesComponent } from './repotes-inscripciones.component';

describe('RepotesInscripcionesComponent', () => {
  let component: RepotesInscripcionesComponent;
  let fixture: ComponentFixture<RepotesInscripcionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepotesInscripcionesComponent]
    });
    fixture = TestBed.createComponent(RepotesInscripcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
