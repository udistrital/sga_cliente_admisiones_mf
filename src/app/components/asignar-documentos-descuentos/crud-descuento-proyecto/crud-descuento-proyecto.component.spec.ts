import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDescuentoProyectoComponent } from './crud-descuento-proyecto.component';

describe('CrudDescuentoProyectoComponent', () => {
  let component: CrudDescuentoProyectoComponent;
  let fixture: ComponentFixture<CrudDescuentoProyectoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudDescuentoProyectoComponent]
    });
    fixture = TestBed.createComponent(CrudDescuentoProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
