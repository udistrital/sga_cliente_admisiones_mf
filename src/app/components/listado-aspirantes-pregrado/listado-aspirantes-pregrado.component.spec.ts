import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoAspirantesPregradoComponent } from './listado-aspirantes-pregrado.component';

describe('ListadoAspirantesPregradoComponent', () => {
  let component: ListadoAspirantesPregradoComponent;
  let fixture: ComponentFixture<ListadoAspirantesPregradoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListadoAspirantesPregradoComponent]
    });
    fixture = TestBed.createComponent(ListadoAspirantesPregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
