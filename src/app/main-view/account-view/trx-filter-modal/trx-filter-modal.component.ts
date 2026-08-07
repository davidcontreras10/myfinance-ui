import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicTrxFilters, DialogResultModel, SelectableItem, TrxFilters } from 'src/app/services/models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { Utils } from 'src/app/utils';
import { AccountPeriod } from '../../models';

export type DateFilterMode = 'currentPeriod' | 'custom';

export interface TrxFiltersDialogResult extends DialogResultModel<TrxFilters> {
  dateFilterMode: DateFilterMode;
}

@Component({
  selector: 'app-trx-filter-modal',
  templateUrl: './trx-filter-modal.component.html',
  styleUrls: ['./trx-filter-modal.component.css']
})
export class TrxFilterModalComponent implements OnInit {

  @Input() accountPeriod?: AccountPeriod;

  descriptionEnabled: boolean = false;
  pendingTrxEnabled: boolean = false;
  trxTypeEnabled: boolean = false;
  dateFilterMode: DateFilterMode = 'currentPeriod';
  startDateEnabled: boolean = false;
  endDateEnabled: boolean = false;

  startDate: Date | null = null;
  endDate: Date | null = null;
  trxTypeViewModels: SelectableItem[] = [];
  selectedTrxTypeId?: number;

  constructor(public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef, private mainViewApiService: MainViewApiService) { }

  ngOnInit(): void {
    this.loadTrxTypes();
    if (!this.accountPeriod) {
      this.dateFilterMode = 'custom';
    }
  }

  private loadTrxTypes() {
    this.mainViewApiService.getSpendTypes(false).subscribe(trxTypes => {
      this.trxTypeViewModels = Utils.sortByName(trxTypes);
    });
  }

  onTrxTypeEnabledChanged(enabled: boolean) {
    if (!enabled) {
      this.selectedTrxTypeId = undefined;
    }
  }

  submit(_t5: NgForm) {
    if (!this.validModel(_t5)) {
      return;
    }
    const model = this.getTrxFiltersModel(_t5);
    const result: TrxFiltersDialogResult = {
      value: model,
      success: true,
      dateFilterMode: this.dateFilterMode
    };
    this.activeModal.close(result);
  }

  private validModel(form: NgForm) {
    const hasDateFilter = this.dateFilterMode === 'currentPeriod' ? !!this.accountPeriod : (this.startDateEnabled || this.endDateEnabled);
    if (!this.descriptionEnabled && !this.pendingTrxEnabled && !this.trxTypeEnabled && !hasDateFilter) {
      return false;
    }

    return form.valid;
  }

  private getTrxFiltersModel(form: NgForm): TrxFilters {
    var model = new BasicTrxFilters();
    if (this.descriptionEnabled) {
      model.descriptionTrxFilter = {
        searchText: form.value.descriptionFilter
      }
    }
    if (this.pendingTrxEnabled) {
      model.pendingTrxFilter = {
        value: true
      }
    }
    if (this.dateFilterMode === 'currentPeriod' && this.accountPeriod) {
      model.startDate = new Date(this.accountPeriod.initialDate);
      model.endDate = new Date(this.accountPeriod.endDate);
    } else {
      if (this.startDateEnabled) {
        model.startDate = this.startDate;
      }
      if (this.endDateEnabled) {
        model.endDate = this.endDate;
      }
    }
    if (this.trxTypeEnabled && this.selectedTrxTypeId) {
      model.trxTypeFilter = {
        trxTypeId: this.selectedTrxTypeId
      }
    }
    return model;
  }
}
