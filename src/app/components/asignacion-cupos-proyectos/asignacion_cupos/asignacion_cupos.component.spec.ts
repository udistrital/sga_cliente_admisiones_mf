import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignacionCuposComponent } from './asignacion_cupos.component';

describe('AsignacionCuposComponent', () => {
  let component: AsignacionCuposComponent;
  let fixture: ComponentFixture<AsignacionCuposComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [AsignacionCuposComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
