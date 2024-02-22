/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ViewPropuestaGradoComponent } from './view-propuesta_grado.component';

describe('ViewPropuestaGradoComponent', () => {
  let component: ViewPropuestaGradoComponent;
  let fixture: ComponentFixture<ViewPropuestaGradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewPropuestaGradoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPropuestaGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
