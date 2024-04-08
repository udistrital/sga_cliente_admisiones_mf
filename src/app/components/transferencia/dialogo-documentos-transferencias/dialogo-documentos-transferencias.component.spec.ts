import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDocumentosTransferenciasComponent } from './dialogo-documentos-transferencias.component';

describe('DialogoDocumentosTransferenciasComponent', () => {
  let component: DialogoDocumentosTransferenciasComponent;
  let fixture: ComponentFixture<DialogoDocumentosTransferenciasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoDocumentosTransferenciasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDocumentosTransferenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
