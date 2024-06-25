import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaListadoAspirantesComponent } from './tabla-listado-aspirantes.component';

describe('TablaListadoAspirantesComponent', () => {
  let component: TablaListadoAspirantesComponent;
  let fixture: ComponentFixture<TablaListadoAspirantesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaListadoAspirantesComponent]
    });
    fixture = TestBed.createComponent(TablaListadoAspirantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
