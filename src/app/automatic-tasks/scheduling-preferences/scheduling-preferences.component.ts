import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SchedulingPreferencesApiService } from 'src/app/services/scheduling-preferences-api.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  standalone: false,
  selector: 'app-scheduling-preferences',
  templateUrl: './scheduling-preferences.component.html',
  styleUrls: ['./scheduling-preferences.component.css'],
})
export class SchedulingPreferencesComponent implements OnDestroy {
  private static readonly fallbackTimeZones = [
    'America/Costa_Rica', 'America/Guatemala', 'America/New_York',
    'America/Los_Angeles', 'Europe/London', 'Europe/Madrid', 'Asia/Kathmandu', 'UTC',
  ];
  private readonly destroyed = new Subject<void>();

  expanded = false;
  loading = false;
  loaded = false;
  saving = false;
  confirming = false;
  savedTimeZone = '';
  selectedTimeZone = '';
  deviceTimeZone = '';
  timeZones: string[] = [];
  errorMessage: string | null = null;

  constructor(private api: SchedulingPreferencesApiService, private toaster: ToasterService) { }

  toggle(): void {
    if (this.saving) return;
    this.expanded = !this.expanded;
    this.confirming = false;
    if (this.expanded && !this.loaded && !this.loading) this.load();
  }

  load(): void {
    if (this.loading || this.saving) return;
    this.loading = true;
    this.loaded = false;
    this.confirming = false;
    this.errorMessage = null;
    this.api.get().pipe(takeUntil(this.destroyed)).subscribe({
      next: preferences => {
        this.savedTimeZone = preferences.timeZoneId;
        this.selectedTimeZone = preferences.timeZoneId;
        this.setTimeZones();
        this.loading = false;
        this.loaded = true;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.messageFor(
          error,
          'Could not load your scheduling timezone.',
          'You do not have permission to view scheduling preferences.',
        );
      },
    });
  }

  get canSave(): boolean {
    return this.loaded && !this.loading && !this.saving &&
      this.timeZones.includes(this.selectedTimeZone) && this.selectedTimeZone !== this.savedTimeZone;
  }

  get canSuggestDevice(): boolean {
    return this.loaded && !this.saving && !!this.deviceTimeZone && this.deviceTimeZone !== this.selectedTimeZone;
  }

  chooseDevice(): void {
    if (!this.canSuggestDevice) return;
    this.selectedTimeZone = this.deviceTimeZone;
    this.selectionChanged();
  }

  selectionChanged(): void {
    this.confirming = false;
    this.errorMessage = null;
  }

  requestSave(): void {
    if (this.canSave) this.confirming = true;
  }

  confirmSave(): void {
    if (!this.confirming || !this.canSave) return;
    this.saving = true;
    this.errorMessage = null;
    this.api.update(this.selectedTimeZone).pipe(takeUntil(this.destroyed)).subscribe({
      next: preferences => {
        this.savedTimeZone = preferences.timeZoneId;
        this.selectedTimeZone = preferences.timeZoneId;
        this.setTimeZones();
        this.saving = false;
        this.confirming = false;
        this.toaster.success('Scheduling timezone saved');
      },
      error: error => {
        this.saving = false;
        this.errorMessage = this.messageFor(error, 'Could not save your scheduling timezone.');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setTimeZones(): void {
    let available: string[] = [];
    try {
      const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
      available = intl.supportedValuesOf?.('timeZone') ?? [];
      this.deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      this.deviceTimeZone = '';
    }
    this.timeZones = [...new Set([
      ...SchedulingPreferencesComponent.fallbackTimeZones, ...available,
      this.savedTimeZone, this.deviceTimeZone,
    ].filter(Boolean))].sort();
  }

  private messageFor(
    error: HttpErrorResponse,
    fallback: string,
    forbiddenMessage = 'You do not have permission to change scheduling preferences.',
  ): string {
    if (error.status === 503) return 'Scheduling timezone changes are not available yet.';
    if (error.status === 404) return 'Scheduling preferences are unavailable on this server.';
    if (error.status === 401) return 'Please sign in again.';
    if (error.status === 403) return forbiddenMessage;
    if (error.status === 400) return 'This timezone was not accepted. Choose another timezone.';
    return fallback;
  }
}
