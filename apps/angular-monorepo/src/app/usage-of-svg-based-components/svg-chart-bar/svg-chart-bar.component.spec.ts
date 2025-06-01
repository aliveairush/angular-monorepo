import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgChartBarComponent } from './svg-chart-bar.component';

describe('SvgChartBarComponent', () => {
  let component: SvgChartBarComponent;
  let fixture: ComponentFixture<SvgChartBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgChartBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgChartBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
