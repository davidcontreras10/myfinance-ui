import { TaskDetailComponent } from './task-detail.component';
import { AutomaticTaskType, FrequencyType, IAutomaticTask, TaskStatus } from '../automatic-tasks.model';

describe('TaskDetailComponent frequency descriptions', () => {
  let component: TaskDetailComponent;

  function task(taskType: AutomaticTaskType, frequencyType: FrequencyType, days: number[]): IAutomaticTask {
    return {
      id: 'frequency-test', description: 'Frequency test', accountId: 1, accountName: 'Source',
      amount: 1, currencySymbol: '$', spendTypeId: 1, lastExecutedStatus: TaskStatus.Created,
      isPending: false, isSpend: true, toAccountName: 'Destination', taskType, frequencyType, days,
    } as IAutomaticTask;
  }

  beforeEach(() => {
    component = new TaskDetailComponent(null as any, null as any, null as any, null as any);
  });

  for (const taskType of [AutomaticTaskType.SpIn, AutomaticTaskType.Trasnfer]) {
    const kind = taskType === AutomaticTaskType.SpIn ? 'spend' : 'transfer';
    for (const [day, name] of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].entries()) {
      it(`describes ${kind} scheduled on ${name} (${day})`, () => {
        const description = component.getDesc(task(taskType, FrequencyType.Weekly, [day]));

        expect(description).toBe(taskType === AutomaticTaskType.SpIn
          ? `$1 Spend every ${name}` : `$1 to Destination every ${name}`);
      });
    }

    it(`preserves manual-only ${kind} descriptions without schedule days`, () => {
      expect(component.getDesc(task(taskType, FrequencyType.Manual, [])))
        .toContain('on manual execution');
    });
  }

  for (const [day, ordinal] of [[1, '1st'], [2, '2nd'], [3, '3rd'], [11, '11th'], [28, '28th']] as const) {
    it(`preserves monthly day ${day}`, () => {
      expect(component.getDesc(task(AutomaticTaskType.SpIn, FrequencyType.Monthly, [day])))
        .toBe(`$1 Spend every ${ordinal} of the month`);
    });
  }

  it('does not treat monthly zero as a valid schedule', () => {
    expect(component.getDesc(task(AutomaticTaskType.SpIn, FrequencyType.Monthly, [0])))
      .toContain('Frequency not set');
  });

  for (const days of [[], [-1], [7], undefined, null]) {
    it(`keeps the fallback for missing or out-of-range weekly days: ${JSON.stringify(days)}`, () => {
      expect(component.getDesc(task(AutomaticTaskType.SpIn, FrequencyType.Weekly, days as any)))
        .toContain('Frequency not set');
    });
  }
});
