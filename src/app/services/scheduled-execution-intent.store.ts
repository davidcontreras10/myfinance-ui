import { Injectable } from '@angular/core';
import { ScheduledExecutionInput } from './auto-tasks-api.service';

export type ScheduledExecutionAction = 'occurrence' | 'extra';

export interface PendingScheduledExecutionIntent {
  taskId: string;
  action: ScheduledExecutionAction;
  displayDate: string;
  input: ScheduledExecutionInput;
}

@Injectable({ providedIn: 'root' })
export class ScheduledExecutionIntentStore {
  private readonly keyPrefix = 'myfinance.scheduled-execution.pending.v1:';

  get(taskId: string): PendingScheduledExecutionIntent | null {
    let stored: string | null;
    try {
      stored = localStorage.getItem(this.key(taskId));
    } catch {
      throw new Error('Could not access saved execution requests in this browser.');
    }
    if (!stored) return null;

    try {
      const intent = JSON.parse(stored) as PendingScheduledExecutionIntent;
      if (!this.isValid(intent, taskId)) throw new Error();
      return intent;
    } catch {
      throw new Error('A saved execution request could not be read. Retry is paused to avoid a duplicate transaction.');
    }
  }

  save(intent: PendingScheduledExecutionIntent): void {
    try {
      localStorage.setItem(this.key(intent.taskId), JSON.stringify(intent));
    } catch {
      throw new Error('Could not save this run for safe retry. No request was sent.');
    }
  }

  clear(taskId: string): void {
    try {
      localStorage.removeItem(this.key(taskId));
    } catch {
      // Reusing the completed identity is safe; the API returns its original result.
    }
  }

  private key(taskId: string): string {
    return `${this.keyPrefix}${taskId}`;
  }

  private isValid(intent: PendingScheduledExecutionIntent, taskId: string): boolean {
    if (!intent || intent.taskId !== taskId || !intent.displayDate) return false;
    if (intent.action === 'occurrence') return !!intent.input?.occurrenceId &&
      !intent.input.manualRequestId && !intent.input.postingDate;
    if (intent.action === 'extra') return !!intent.input?.manualRequestId &&
      !!intent.input.postingDate && !intent.input.occurrenceId;
    return false;
  }
}
