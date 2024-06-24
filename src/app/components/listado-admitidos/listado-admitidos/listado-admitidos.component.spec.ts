import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoAdmitidosComponent } from './listado-admitidos.component';

describe('ListadoAdmitidosComponent', () => {
  let component: ListadoAdmitidosComponent;
  let fixture: ComponentFixture<ListadoAdmitidosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListadoAdmitidosComponent]
    });
    fixture = TestBed.createComponent(ListadoAdmitidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
