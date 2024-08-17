import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EvaluacionAspirantesComponent } from "./evaluacion-aspirantes.component";

describe("EvaluacionAspirantesComponent", () => {
  let component: EvaluacionAspirantesComponent;
  let fixture: ComponentFixture<EvaluacionAspirantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluacionAspirantesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionAspirantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
