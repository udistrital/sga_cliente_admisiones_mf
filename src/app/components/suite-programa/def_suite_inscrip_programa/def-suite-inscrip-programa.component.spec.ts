import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefSuiteInscripProgramaComponent } from './def-suite-inscrip-programa.component';

describe('DefSuiteInscripProgramaComponent', () => {
  let component: DefSuiteInscripProgramaComponent;
  let fixture: ComponentFixture<DefSuiteInscripProgramaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefSuiteInscripProgramaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefSuiteInscripProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
