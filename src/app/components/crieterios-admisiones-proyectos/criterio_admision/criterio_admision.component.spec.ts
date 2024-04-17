import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CriterioAdmisionComponent } from './criterio_admision.component';

describe('CriterioAdmisionComponent', () => {
  let component: CriterioAdmisionComponent;
  let fixture: ComponentFixture<CriterioAdmisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CriterioAdmisionComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriterioAdmisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
