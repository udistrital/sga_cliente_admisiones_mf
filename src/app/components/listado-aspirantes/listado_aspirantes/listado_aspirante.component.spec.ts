import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoAspiranteComponent } from './listado_aspirante.component';

describe('ListadoAspiranteComponent', () => {
  let component: ListadoAspiranteComponent;
  let fixture: ComponentFixture<ListadoAspiranteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListadoAspiranteComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoAspiranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
