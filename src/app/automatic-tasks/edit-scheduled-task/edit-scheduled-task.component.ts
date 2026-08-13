import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AutoTasksApiService } from 'src/app/services/auto-tasks-api.service';
import { TrxTypeServiceService } from 'src/app/services/trx-type-service.service';
import { SelectableItem } from 'src/app/services/models';
import { BasicOption, DAYS_OF_WEEK, FrequencyType, IAutomaticTask } from '../automatic-tasks.model';
import { Utils } from 'src/app/utils';

// Mirrors ViewTrxComponent's PATCH_MAPS pattern - only the fields the user
// actually touched get sent, matched against the backend's
// ClientEditScheduledTask.ScheduledTaskField enum (Invalid=0, Amount=1,
// SpendTypeId=2, IsPending=3, Description=4). Account isn't editable through
// this endpoint at all, so it's not offered here. FrequencyType (5) and
// Days (6) can't use this simple 1:1 mapping - see submit()'s combined
// handling below, since the backend requires them sent together whenever
// either changes.
const PATCH_MAPS = [
  { name: 'description', propName: 'description', propValue: 4 },
  { name: 'amount', propName: 'amount', propValue: 1 },
  { name: 'spendType', propName: 'spendTypeId', propValue: 2 },
  { name: 'isPending', propName: 'isPending', propValue: 3 }
];

const SCHEDULED_TASK_FIELD_FREQUENCY_TYPE = 5;
const SCHEDULED_TASK_FIELD_DAYS = 6;

const MIN_MONTH_DAY = 1;
// Capped below 31 so a monthly task always fires regardless of the month's
// actual length - same cap new-scheduled-task uses when creating one.
const MAX_MONTH_DAY = 27;

@Component({
  selector: 'app-edit-scheduled-task',
  templateUrl: './edit-scheduled-task.component.html',
  styleUrls: ['./edit-scheduled-task.component.css']
})
export class EditScheduledTaskComponent implements OnInit {

  @Input() task!: IAutomaticTask;

  public spendTypes: SelectableItem[] = [];
  public selectedSpendTypeId!: number;

  public daysOfWeek: BasicOption[] = DAYS_OF_WEEK;
  public minMonthDay = MIN_MONTH_DAY;
  public maxMonthDay = MAX_MONTH_DAY;
  public monthDayPlaceholder = `Value between ${MIN_MONTH_DAY} and ${MAX_MONTH_DAY}`;
  public selectedFreqType!: FrequencyType;
  public selectedDayOfMonth!: number;
  public selectedDayOfWeek!: number;

  constructor(
    public activeModal: NgbActiveModal,
    private service: AutoTasksApiService,
    private trxTypeService: TrxTypeServiceService
  ) { }

  ngOnInit(): void {
    this.selectedSpendTypeId = this.task?.spendTypeId;
    this.selectedFreqType = this.task?.frequencyType;
    this._prefillDay();
    // includeAll=true - editing should offer every one of the user's types,
    // not just the ones currently marked as default-selected.
    this.trxTypeService.getUserTransactionTypes(true).subscribe(types => {
      this.spendTypes = Utils.sortByName(types);
    });
  }

  public submit(f: NgForm): void {
    if (!this.task) {
      return;
    }

    const modifieds = Object.entries(f.controls).filter(([, control]) => !control.pristine);
    if (modifieds.length === 0) {
      this.activeModal.dismiss('No changes');
      return;
    }

    const dirtyNames = new Set(modifieds.map(([name]) => name));
    const patch: { [key: string]: any } = { modifyList: [] as number[] };
    modifieds.forEach(([name, control]) => {
      const patchMap = PATCH_MAPS.find(p => p.name === name);
      if (patchMap) {
        patch[patchMap.propName] = control.value;
        patch['modifyList'].push(patchMap.propValue);
      }
    });

    // The backend requires frequencyType and days to travel together when
    // switching to Monthly/Weekly - but NOT for Manual, which doesn't run on
    // a schedule and has no day value to send in the first place (the UI
    // doesn't collect one for it). So these two aren't simple 1:1
    // PATCH_MAPS entries.
    if (dirtyNames.has('frqType') || dirtyNames.has('dayOfMonth') || dirtyNames.has('dayOfWeek')) {
      patch['frequencyType'] = this.selectedFreqType;
      patch['modifyList'].push(SCHEDULED_TASK_FIELD_FREQUENCY_TYPE);
      if (this.selectedFreqType !== FrequencyType.Manual) {
        patch['days'] = this._readDays();
        patch['modifyList'].push(SCHEDULED_TASK_FIELD_DAYS);
      }
    }

    this.service.editScheduledTask(this.task.id, patch).subscribe(() => {
      this.activeModal.close('Saved');
    });
  }

  private _prefillDay(): void {
    const day = this.task?.days?.length > 0 ? this.task.days[0] : null;
    if (this.selectedFreqType === FrequencyType.Monthly && day) {
      this.selectedDayOfMonth = day;
    } else if (this.selectedFreqType === FrequencyType.Weekly && day !== null) {
      this.selectedDayOfWeek = day;
    }
  }

  // Only called for Monthly/Weekly - Manual never reaches here (see submit()).
  private _readDays(): number[] {
    if (this.selectedFreqType === FrequencyType.Monthly) {
      return [this.selectedDayOfMonth];
    }
    return [this.selectedDayOfWeek];
  }
}
