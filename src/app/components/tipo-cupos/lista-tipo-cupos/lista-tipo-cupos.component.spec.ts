import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTipoCuposComponent } from './lista-tipo-cupos.component';

describe('ListaTipoCuposComponent', () => {
  let component: ListaTipoCuposComponent;
  let fixture: ComponentFixture<ListaTipoCuposComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaTipoCuposComponent]
    });
    fixture = TestBed.createComponent(ListaTipoCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
