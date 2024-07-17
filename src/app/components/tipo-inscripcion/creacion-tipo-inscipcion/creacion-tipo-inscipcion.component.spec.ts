import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionTipoInscipcionComponent } from './creacion-tipo-inscipcion.component';

describe('CreacionTipoInscipcionComponent', () => {
  let component: CreacionTipoInscipcionComponent;
  let fixture: ComponentFixture<CreacionTipoInscipcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreacionTipoInscipcionComponent]
    });
    fixture = TestBed.createComponent(CreacionTipoInscipcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
