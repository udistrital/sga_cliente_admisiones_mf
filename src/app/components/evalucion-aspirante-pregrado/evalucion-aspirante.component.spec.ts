import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalucionAspiranteComponent } from './evalucion-aspirante.component';

describe('EvalucionAspiranteComponent', () => {
  let component: EvalucionAspiranteComponent;
  let fixture: ComponentFixture<EvalucionAspiranteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvalucionAspiranteComponent]
    });
    fixture = TestBed.createComponent(EvalucionAspiranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
