import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeButtonComponent } from './customize-button.component';

describe('CustomizeButtonComponent', () => {
  let component: CustomizeButtonComponent;
  let fixture: ComponentFixture<CustomizeButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizeButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
