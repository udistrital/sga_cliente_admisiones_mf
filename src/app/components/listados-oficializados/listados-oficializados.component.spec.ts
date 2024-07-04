import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadosOficializadosComponent } from './listados-oficializados.component';

describe('ListadosOficializadosComponent', () => {
  let component: ListadosOficializadosComponent;
  let fixture: ComponentFixture<ListadosOficializadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListadosOficializadosComponent]
    });
    fixture = TestBed.createComponent(ListadosOficializadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
