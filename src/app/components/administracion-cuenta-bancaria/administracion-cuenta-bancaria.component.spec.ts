import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionCuentaBancariaComponent } from './administracion-cuenta-bancaria.component';

describe('AdministracionCuentaBancariaComponent', () => {
  let component: AdministracionCuentaBancariaComponent;
  let fixture: ComponentFixture<AdministracionCuentaBancariaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministracionCuentaBancariaComponent]
    });
    fixture = TestBed.createComponent(AdministracionCuentaBancariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
