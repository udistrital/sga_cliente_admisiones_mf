import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProyectosAspirantesComponent } from './ListaProyectosAspirantesComponent';

describe('ListaProyectosAspirantesComponent', () => {
  let component: ListaProyectosAspirantesComponent;
  let fixture: ComponentFixture<ListaProyectosAspirantesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaProyectosAspirantesComponent]
    });
    fixture = TestBed.createComponent(ListaProyectosAspirantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
