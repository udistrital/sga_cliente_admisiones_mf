import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AsignarDocumentosDescuentosComponent } from "./asignar_documentos_descuentos.component";

describe("AsignarDocumentosDescuentosComponent", () => {
  let component: AsignarDocumentosDescuentosComponent;
  let fixture: ComponentFixture<AsignarDocumentosDescuentosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AsignarDocumentosDescuentosComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarDocumentosDescuentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
