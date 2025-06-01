import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageOfSvgBasedComponentsComponent } from './usage-of-svg-based-components.component';

describe('UsageOfSvgBasedComponentsComponent', () => {
  let component: UsageOfSvgBasedComponentsComponent;
  let fixture: ComponentFixture<UsageOfSvgBasedComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageOfSvgBasedComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageOfSvgBasedComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
