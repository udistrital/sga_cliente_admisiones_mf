/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudDocumentoProyectoComponent } from './crud-documento-proyecto.component';

describe('CrudDocumentComponent', () => {
  let component: CrudDocumentoProyectoComponent;
  let fixture: ComponentFixture<CrudDocumentoProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudDocumentoProyectoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudDocumentoProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
