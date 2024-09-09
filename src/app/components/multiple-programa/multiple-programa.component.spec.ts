import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleProgramaComponent } from './multiple-programa.component';

describe('MultipleProgramaComponent', () => {
  let component: MultipleProgramaComponent;
  let fixture: ComponentFixture<MultipleProgramaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultipleProgramaComponent]
    });
    fixture = TestBed.createComponent(MultipleProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
