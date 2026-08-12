import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AutoTasksApiService } from 'src/app/services/auto-tasks-api.service';
import { TrxTypeServiceService } from 'src/app/services/trx-type-service.service';
import { SelectableItem } from 'src/app/services/models';
import { IAutomaticTask } from '../automatic-tasks.model';
import { Utils } from 'src/app/utils';

// Mirrors ViewTrxComponent's PATCH_MAPS pattern - only the fields the user
// actually touched get sent, matched against the backend's
// ClientEditScheduledTask.ScheduledTaskField enum (Invalid=0, Amount=1,
// SpendTypeId=2, IsPending=3, Description=4). Account, currency, frequency
// and days aren't editable through this endpoint, so they're not offered here.
const PATCH_MAPS = [
  { name: 'description', propName: 'description', propValue: 4 },
  { name: 'amount', propName: 'amount', propValue: 1 },
  { name: 'spendType', propName: 'spendTypeId', propValue: 2 },
  { name: 'isPending', propName: 'isPending', propValue: 3 }
];

@Component({
  selector: 'app-edit-scheduled-task',
  templateUrl: './edit-scheduled-task.component.html',
  styleUrls: ['./edit-scheduled-task.component.css']
})
export class EditScheduledTaskComponent implements OnInit {

  @Input() task!: IAutomaticTask;

  public spendTypes: SelectableItem[] = [];
  public selectedSpendTypeId!: number;

  constructor(
    public activeModal: NgbActiveModal,
    private service: AutoTasksApiService,
    private trxTypeService: TrxTypeServiceService
  ) { }

  ngOnInit(): void {
    this.selectedSpendTypeId = this.task?.spendTypeId;
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

    const patch: { [key: string]: any } = { modifyList: [] as number[] };
    modifieds.forEach(([name, control]) => {
      const patchMap = PATCH_MAPS.find(p => p.name === name);
      if (patchMap) {
        patch[patchMap.propName] = control.value;
        patch['modifyList'].push(patchMap.propValue);
      }
    });

    this.service.editScheduledTask(this.task.id, patch).subscribe(() => {
      this.activeModal.close('Saved');
    });
  }
}
