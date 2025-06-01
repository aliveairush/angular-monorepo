import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgTreeComponent } from './svg-tree.component';

describe('SvgTreeComponent', () => {
  let component: SvgTreeComponent;
  let fixture: ComponentFixture<SvgTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
