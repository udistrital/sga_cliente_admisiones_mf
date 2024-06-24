import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoOficializadosComponent } from './listado-oficializados.component';

describe('ListadoOficializadosComponent', () => {
  let component: ListadoOficializadosComponent;
  let fixture: ComponentFixture<ListadoOficializadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListadoOficializadosComponent]
    });
    fixture = TestBed.createComponent(ListadoOficializadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
