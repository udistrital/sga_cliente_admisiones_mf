import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcriteriosDialogComponent } from './subcriterios-dialog.component';

describe('SubcriteriosDialogComponent', () => {
  let component: SubcriteriosDialogComponent;
  let fixture: ComponentFixture<SubcriteriosDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubcriteriosDialogComponent]
    });
    fixture = TestBed.createComponent(SubcriteriosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
