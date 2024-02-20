import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCriteriosComponent } from './dialogo-criterios.component';

describe('DialogoCriteriosComponent', () => {
  let component: DialogoCriteriosComponent;
  let fixture: ComponentFixture<DialogoCriteriosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoCriteriosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoCriteriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
