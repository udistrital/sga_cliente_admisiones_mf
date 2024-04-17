import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionHistoricoComponent } from './liquidacion-historico.component';

describe('LiquidacionHistoricoComponent', () => {
  let component: LiquidacionHistoricoComponent;
  let fixture: ComponentFixture<LiquidacionHistoricoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiquidacionHistoricoComponent]
    });
    fixture = TestBed.createComponent(LiquidacionHistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
