import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MainViewModel } from '../main-view-model';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { AccountGroupAccount } from '../models';

@Component({
  selector: 'app-account-notes',
  templateUrl: './account-notes.component.html',
  styleUrls: ['./account-notes.component.css']
})
export class AccountNotesComponent implements OnInit {


  @Input()
  account: AccountGroupAccount;

  @ViewChild('f') form: any;

  accountName: string;
  noteTitle: string;
  noteContent: string;

  constructor(public activeModal: NgbActiveModal, private mainViewModel: MainViewModel, private mainViewApiService: MainViewApiService) { }

  ngOnInit(): void {
    this.noteTitle = this.account.noteTitle;
    this.noteContent = this.account.noteBody;
  }

  public submit(submitValue: any) {
    if (submitValue.form.valid) {
      const notes = {
        noteTitle: this.noteTitle,
        noteContent: this.noteContent
      }
      this.mainViewApiService.updateNotes(this.account.accountId, notes).subscribe({
        next: res => {
          this.account.noteTitle = res.noteTitle;
          this.account.noteBody = res.noteContent;
          this.activeModal.close('Submit');
        },
        error: err => {
          this.mainViewModel.errorNotification$.next(err);
        }
      })
    }
  }

}
