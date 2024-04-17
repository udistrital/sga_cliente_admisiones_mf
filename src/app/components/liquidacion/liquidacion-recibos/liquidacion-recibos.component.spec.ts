import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionRecibosComponent } from './liquidacion-recibos.component';

describe('LiquidacionRecibosComponent', () => {
  let component: LiquidacionRecibosComponent;
  let fixture: ComponentFixture<LiquidacionRecibosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiquidacionRecibosComponent]
    });
    fixture = TestBed.createComponent(LiquidacionRecibosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
