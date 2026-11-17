import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CheckboxAssistanceComponent } from "./checkbox-assistance.component";

describe("CheckboxAssistanceComponent", () => {
  let component: CheckboxAssistanceComponent;
  let fixture: ComponentFixture<CheckboxAssistanceComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [CheckboxAssistanceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
