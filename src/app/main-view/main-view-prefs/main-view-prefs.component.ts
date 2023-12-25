import { Component, Input, OnInit } from '@angular/core';
import { MainViewModel } from '../main-view-model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main-view-prefs',
  templateUrl: './main-view-prefs.component.html',
  styleUrls: ['./main-view-prefs.component.css']
})
export class MainViewPrefsComponent implements OnInit {

  periodsLimit: number;
  constructor(public activeModal: NgbActiveModal, public mainViewModel: MainViewModel) { }

  ngOnInit(): void {
    this.periodsLimit = this.mainViewModel.mainViewPrefs.periodsLimit;
  }

  periodsLimitLeft(){
    if(this.periodsLimit != this.mainViewModel.mainViewPrefs.periodsLimit){
      console.log('Should save new value', this.periodsLimit);
      this.mainViewModel.mainViewPrefs.periodsLimit = this.periodsLimit;
    }
  }
}
