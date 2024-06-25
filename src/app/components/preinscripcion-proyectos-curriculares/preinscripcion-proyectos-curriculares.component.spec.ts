import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreinscripcionProyectosCurricularesComponent } from './preinscripcion-proyectos-curriculares.component';

describe('PreinscripcionProyectosCurricularesComponent', () => {
  let component: PreinscripcionProyectosCurricularesComponent;
  let fixture: ComponentFixture<PreinscripcionProyectosCurricularesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreinscripcionProyectosCurricularesComponent]
    });
    fixture = TestBed.createComponent(PreinscripcionProyectosCurricularesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
