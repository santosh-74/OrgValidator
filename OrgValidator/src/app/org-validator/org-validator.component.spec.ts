import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgValidatorComponent } from './org-validator.component';

describe('OrgValidatorComponent', () => {
  let component: OrgValidatorComponent;
  let fixture: ComponentFixture<OrgValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgValidatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
