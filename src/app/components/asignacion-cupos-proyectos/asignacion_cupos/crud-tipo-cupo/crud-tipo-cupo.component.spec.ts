import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTipoCupoComponent } from './crud-tipo-cupo.component';

describe('CrudTipoCupoComponent', () => {
  let component: CrudTipoCupoComponent;
  let fixture: ComponentFixture<CrudTipoCupoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudTipoCupoComponent]
    });
    fixture = TestBed.createComponent(CrudTipoCupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
