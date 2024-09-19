import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionPosgradoTableComponent } from './liquidacion-posgrado-table.component';

describe('LiquidacionPosgradoTableComponent', () => {
  let component: LiquidacionPosgradoTableComponent;
  let fixture: ComponentFixture<LiquidacionPosgradoTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiquidacionPosgradoTableComponent]
    });
    fixture = TestBed.createComponent(LiquidacionPosgradoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
