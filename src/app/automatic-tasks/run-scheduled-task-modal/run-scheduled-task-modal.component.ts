import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAutomaticTask } from '../automatic-tasks.model';
import { ScheduledTaskExecutionContext } from 'src/app/services/auto-tasks-api.service';
import { PendingScheduledExecutionIntent, ScheduledExecutionAction } from 'src/app/services/scheduled-execution-intent.store';

export interface RunScheduledTaskChoice {
  action: ScheduledExecutionAction;
  retry: boolean;
}

@Component({
  standalone: false,
  selector: 'app-run-scheduled-task-modal',
  templateUrl: './run-scheduled-task-modal.component.html',
  styleUrls: ['./run-scheduled-task-modal.component.css'],
})
export class RunScheduledTaskModalComponent {
  @Input() task!: IAutomaticTask;
  @Input() context: ScheduledTaskExecutionContext | null = null;
  @Input() pendingIntent: PendingScheduledExecutionIntent | null = null;

  action: ScheduledExecutionAction = 'extra';

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if (this.context?.defaultAction === 1 && this.context.today?.status === 1)
      this.action = 'occurrence';
  }

  get canRun(): boolean {
    return !!this.pendingIntent || (!!this.context?.executionEnabled && !this.context.retiredAtUtc);
  }

  get canChooseOccurrence(): boolean {
    return !this.pendingIntent && this.context?.defaultAction === 1 && this.context.today?.status === 1;
  }

  get showExtraWarning(): boolean {
    return !this.pendingIntent && this.action === 'extra' &&
      !!this.context?.warnExtraExecution && !this.context.retiredAtUtc;
  }

  get extraWarning(): string {
    if (this.context?.today?.status === 2)
      return "Today's scheduled occurrence is already complete. This creates another transaction.";
    if (this.context?.discoveryIncomplete)
      return 'The system is still checking missed scheduled runs. This extra run will not satisfy any automatic occurrence.';
    if (this.context?.earliestPending && this.context.earliestPending.scheduledLocalDate < this.context.localDate)
      return 'An earlier automatic occurrence is still pending. This extra run will not satisfy it.';
    return "This is an independent extra run. It will not satisfy today's automatic occurrence.";
  }

  get displayDate(): string {
    return this.pendingIntent?.displayDate ??
      (this.action === 'occurrence' ? this.context?.today?.scheduledLocalDate : this.context?.localDate) ?? '';
  }

  confirm(): void {
    if (!this.canRun) return;
    this.activeModal.close({
      action: this.pendingIntent?.action ?? this.action,
      retry: !!this.pendingIntent,
    } satisfies RunScheduledTaskChoice);
  }
}
