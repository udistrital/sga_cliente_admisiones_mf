import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVisualizerComponent } from './reporte-visualizer.component';

describe('ReporteVisualizerComponent', () => {
  let component: ReporteVisualizerComponent;
  let fixture: ComponentFixture<ReporteVisualizerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteVisualizerComponent]
    });
    fixture = TestBed.createComponent(ReporteVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
