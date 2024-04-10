import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InscripcionGeneralComponent } from './inscripcion_general.component';

describe('InscripcionGeneralComponent', () => {
  let component: InscripcionGeneralComponent;
  let fixture: ComponentFixture<InscripcionGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InscripcionGeneralComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InscripcionGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
