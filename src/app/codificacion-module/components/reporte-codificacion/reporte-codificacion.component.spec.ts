import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCodificacionComponent } from './reporte-codificacion.component';

describe('ReporteCodificacionComponent', () => {
  let component: ReporteCodificacionComponent;
  let fixture: ComponentFixture<ReporteCodificacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteCodificacionComponent]
    });
    fixture = TestBed.createComponent(ReporteCodificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
