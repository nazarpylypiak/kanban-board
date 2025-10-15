import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskPerUserComponent } from './task-per-user.component';

describe('TaskPerUserComponent', () => {
  let component: TaskPerUserComponent;
  let fixture: ComponentFixture<TaskPerUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPerUserComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskPerUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
