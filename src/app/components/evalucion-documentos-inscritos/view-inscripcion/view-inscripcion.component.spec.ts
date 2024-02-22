import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInscripcionComponent } from './view-inscripcion.component';

describe('ViewInscripcionComponent', () => {
  let component: ViewInscripcionComponent;
  let fixture: ComponentFixture<ViewInscripcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewInscripcionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
