import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComentariosCuposComponent } from './comentarios-cupos.component';

describe('ComentariosCuposComponent', () => {
  let component: ComentariosCuposComponent;
  let fixture: ComponentFixture<ComentariosCuposComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComentariosCuposComponent]
    });
    fixture = TestBed.createComponent(ComentariosCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
