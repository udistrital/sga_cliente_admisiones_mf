/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudAsignacionCupoComponent } from './crud-asignacion_cupo.component';

describe('CrudAsignacionCupoComponent', () => {
  let component: CrudAsignacionCupoComponent;
  let fixture: ComponentFixture<CrudAsignacionCupoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudAsignacionCupoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudAsignacionCupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
