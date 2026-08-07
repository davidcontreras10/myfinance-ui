import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicTrxFilters, SelectableItem, TrxFilters } from 'src/app/services/models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-trx-filter-modal',
  templateUrl: './trx-filter-modal.component.html',
  styleUrls: ['./trx-filter-modal.component.css']
})
export class TrxFilterModalComponent implements OnInit {

  descriptionEnabled: boolean = false;
  pendingTrxEnabled: boolean = false;
  startDateEnabled: boolean = false;
  endDateEnabled: boolean = false;
  trxTypeEnabled: boolean = false;

  startDate: Date | null = null;
  endDate: Date | null = null;
  trxTypeViewModels: SelectableItem[] = [];
  selectedTrxTypeId?: number;

  constructor(public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef, private mainViewApiService: MainViewApiService) { }

  ngOnInit(): void {
    this.loadTrxTypes();
  }

  private loadTrxTypes() {
    this.mainViewApiService.getSpendTypes(false).subscribe(trxTypes => {
      this.trxTypeViewModels = Utils.sortByName(trxTypes);
      this.selectedTrxTypeId = this.trxTypeViewModels.find(t => t.isSelected)?.id ?? this.trxTypeViewModels[0]?.id;
    });
  }

  submit(_t5: NgForm) {
    if (!this.validModel(_t5)) {
      return;
    }
    const model = this.getTrxFiltersModel(_t5);
    this.activeModal.close({
      value: model,
      success: true
    })
  }

  private validModel(form: NgForm) {
    if (!this.descriptionEnabled && !this.pendingTrxEnabled && !this.startDateEnabled && !this.endDateEnabled && !this.trxTypeEnabled) {
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
    if (this.startDateEnabled) {
      model.startDate = this.startDate;
    }
    if (this.endDateEnabled) {
      model.endDate = this.endDate;
    }
    if (this.trxTypeEnabled && this.selectedTrxTypeId) {
      model.trxTypeFilter = {
        trxTypeId: this.selectedTrxTypeId
      }
    }
    return model;
  }
}
