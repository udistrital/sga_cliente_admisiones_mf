import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreoInstitucionalComponent } from './correo-institucional.component';

describe('CorreoInstitucionalComponent', () => {
  let component: CorreoInstitucionalComponent;
  let fixture: ComponentFixture<CorreoInstitucionalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorreoInstitucionalComponent]
    });
    fixture = TestBed.createComponent(CorreoInstitucionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
