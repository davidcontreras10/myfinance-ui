import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicTrxFilters, TrxFilters } from 'src/app/services/models';

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

  startDate: Date | null = null;
  endDate: Date | null = null;
  constructor(public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
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
    if (!this.descriptionEnabled && !this.pendingTrxEnabled && !this.startDateEnabled && !this.endDateEnabled) {
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
    return model;
  }
}
