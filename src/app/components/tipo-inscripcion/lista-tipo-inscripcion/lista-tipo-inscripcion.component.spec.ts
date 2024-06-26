import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTipoInscripcionComponent } from './lista-tipo-inscripcion.component';

describe('ListaTipoInscripcionComponent', () => {
  let component: ListaTipoInscripcionComponent;
  let fixture: ComponentFixture<ListaTipoInscripcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaTipoInscripcionComponent]
    });
    fixture = TestBed.createComponent(ListaTipoInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
