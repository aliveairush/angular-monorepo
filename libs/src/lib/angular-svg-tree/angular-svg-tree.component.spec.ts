import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularSvgTreeComponent } from './angular-svg-tree.component';

describe('AngularSvgTreeComponent', () => {
  let component: AngularSvgTreeComponent;
  let fixture: ComponentFixture<AngularSvgTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularSvgTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularSvgTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
