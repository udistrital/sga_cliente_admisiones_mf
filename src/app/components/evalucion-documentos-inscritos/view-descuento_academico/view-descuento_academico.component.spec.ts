/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ViewDescuentoAcademicoComponent } from './view-descuento_academico.component';

describe('ViewDescuentoAcademicoComponent', () => {
  let component: ViewDescuentoAcademicoComponent;
  let fixture: ComponentFixture<ViewDescuentoAcademicoComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [ViewDescuentoAcademicoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDescuentoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
