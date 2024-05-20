import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionTableComponent } from './liquidacion-table.component';

describe('LiquidacionTableComponent', () => {
  let component: LiquidacionTableComponent;
  let fixture: ComponentFixture<LiquidacionTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiquidacionTableComponent]
    });
    fixture = TestBed.createComponent(LiquidacionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});