import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountViewApiService } from 'src/app/services/account-view-api.service';
import { AI_CLASSIFICATION_HINT_MAX_LENGTH } from 'src/app/services/models';
import { ToasterService } from 'src/app/services/toaster.service';

/** What the modal tells the screen that opened it, so it can update the account without reloading. */
export interface AccountAiHintResult {
  accountId: number;
  hasHint: boolean;
}

/**
 * Sets or clears the AI classification hint of one account. The hint is free text that tells the AI what
 * belongs in the account when bank transactions are classified; an account without one isn't offered to the AI.
 * It is separate from the account form: the hint has its own endpoints.
 */
@Component({
  selector: 'app-account-ai-hint-modal',
  templateUrl: './account-ai-hint-modal.component.html',
  styleUrls: ['./account-ai-hint-modal.component.css'],
})
export class AccountAiHintModalComponent implements OnInit {
  @Input() accountId!: number;
  @Input() accountName = '';

  readonly maxLength = AI_CLASSIFICATION_HINT_MAX_LENGTH;
  readonly example =
    'AI subscriptions such as OpenAI, ChatGPT and Claude. Include the associated digital-service IVA.';

  text = '';
  savedHint = '';
  loading = true;
  saving = false;
  loadFailed = false;
  errorMessage: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: AccountViewApiService,
    private toaster: ToasterService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadFailed = false;
    this.errorMessage = null;
    this.apiService.getAiClassificationHint(this.accountId).subscribe({
      next: (res) => {
        this.savedHint = res.aiClassificationHint ?? '';
        this.text = this.savedHint;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.loadFailed = true;
        this.errorMessage = this.messageFor(err, 'Could not load the hint.');
      },
    });
  }

  get busy(): boolean {
    return this.loading || this.saving;
  }

  get hasSavedHint(): boolean {
    return this.savedHint.trim().length > 0;
  }

  /** The text differs from what is saved (the API trims, so whitespace alone isn't a change). */
  get dirty(): boolean {
    return this.text.trim() !== this.savedHint.trim();
  }

  get canSave(): boolean {
    return this.dirty && !this.busy && !this.loadFailed;
  }

  save() {
    if (!this.canSave) {
      return;
    }

    const trimmed = this.text.trim();
    this.send(trimmed === '' ? null : trimmed);
  }

  clear() {
    if (!this.hasSavedHint || this.busy) {
      return;
    }

    if (confirm('Clear this hint? The account will no longer be offered to AI classification.')) {
      this.send(null);
    }
  }

  private send(hint: string | null) {
    this.saving = true;
    this.errorMessage = null;
    this.apiService.updateAiClassificationHint(this.accountId, hint).subscribe({
      next: (res) => {
        this.saving = false;
        const hasHint = !!res.aiClassificationHint?.trim();
        this.toaster.success(hasHint ? 'AI hint saved' : 'AI hint cleared');
        const result: AccountAiHintResult = { accountId: this.accountId, hasHint };
        this.activeModal.close(result);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.messageFor(err, 'Could not save the hint.');
      },
    });
  }

  private messageFor(err: any, fallback: string): string {
    if (err?.status === 404) {
      return 'This account was not found.';
    }

    return err?.error?.message ?? fallback;
  }
}
