import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TaskSummary } from '@kanban-board/shared';

@Component({
  selector: 'app-summary-card',
  imports: [CommonModule, MatCardModule],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  data = input<TaskSummary | null>(null);
}
