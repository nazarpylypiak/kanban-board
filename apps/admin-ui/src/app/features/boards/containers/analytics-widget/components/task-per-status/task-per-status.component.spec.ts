import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskPerStatusComponent } from './task-per-status.component';

describe('TaskPerStatusComponent', () => {
  let component: TaskPerStatusComponent;
  let fixture: ComponentFixture<TaskPerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPerStatusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskPerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
