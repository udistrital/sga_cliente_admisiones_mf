import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionRecibosComponent } from './liquidacion-recibos.component';

describe('LiquidacionRecibosComponent', () => {
  let component: LiquidacionRecibosComponent;
  let fixture: ComponentFixture<LiquidacionRecibosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiquidacionRecibosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiquidacionRecibosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
