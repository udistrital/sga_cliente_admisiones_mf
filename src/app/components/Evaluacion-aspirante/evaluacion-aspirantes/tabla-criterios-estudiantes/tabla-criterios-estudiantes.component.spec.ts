import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaCriteriosEstudiantesComponent } from './tabla-criterios-estudiantes.component';

describe('TablaCriteriosEstudiantesComponent', () => {
  let component: TablaCriteriosEstudiantesComponent;
  let fixture: ComponentFixture<TablaCriteriosEstudiantesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaCriteriosEstudiantesComponent]
    });
    fixture = TestBed.createComponent(TablaCriteriosEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
