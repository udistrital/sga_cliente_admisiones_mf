import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionTipoCuposComponent } from './creacion-tipo-cupos.component';

describe('CreacionTipoCuposComponent', () => {
  let component: CreacionTipoCuposComponent;
  let fixture: ComponentFixture<CreacionTipoCuposComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreacionTipoCuposComponent]
    });
    fixture = TestBed.createComponent(CreacionTipoCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
