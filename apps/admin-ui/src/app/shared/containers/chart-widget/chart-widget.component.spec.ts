import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartWidgetComponent } from './chart-widget.component';

describe('ChartWidgetComponent', () => {
  let component: ChartWidgetComponent;
  let fixture: ComponentFixture<ChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartWidgetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
