import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposCuposComponent } from './tipos-cupos.component';

describe('TiposCuposComponent', () => {
  let component: TiposCuposComponent;
  let fixture: ComponentFixture<TiposCuposComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TiposCuposComponent]
    });
    fixture = TestBed.createComponent(TiposCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
