import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionDocumentosInscritosComponent } from './evaluacion-documentos-inscritos.component';

describe('EvaluacionDocumentosInscritosComponent', () => {
  let component: EvaluacionDocumentosInscritosComponent;
  let fixture: ComponentFixture<EvaluacionDocumentosInscritosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionDocumentosInscritosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionDocumentosInscritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
