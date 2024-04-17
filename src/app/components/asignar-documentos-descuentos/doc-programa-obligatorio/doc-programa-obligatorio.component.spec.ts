import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocProgramaObligatorioComponent } from './doc-programa-obligatorio.component';

describe('DocProgramaObligatorioComponent', () => {
  let component: DocProgramaObligatorioComponent;
  let fixture: ComponentFixture<DocProgramaObligatorioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocProgramaObligatorioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocProgramaObligatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
