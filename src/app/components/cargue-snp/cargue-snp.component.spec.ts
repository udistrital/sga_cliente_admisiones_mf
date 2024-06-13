import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargueSnpComponent } from './cargue-snp.component';

describe('CargueSnpComponent', () => {
  let component: CargueSnpComponent;
  let fixture: ComponentFixture<CargueSnpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CargueSnpComponent]
    });
    fixture = TestBed.createComponent(CargueSnpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
