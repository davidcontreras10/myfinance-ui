import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { SchedulingPreferences, SchedulingPreferencesApiService } from 'src/app/services/scheduling-preferences-api.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { SchedulingPreferencesComponent } from './scheduling-preferences.component';

describe('SchedulingPreferencesComponent logic', () => {
  let api: jasmine.SpyObj<SchedulingPreferencesApiService>;
  let toaster: jasmine.SpyObj<ToasterService>;
  let component: SchedulingPreferencesComponent;
  const originalZone = 'America/Costa_Rica';

  beforeEach(() => {
    api = jasmine.createSpyObj('SchedulingPreferencesApiService', ['get', 'update']);
    toaster = jasmine.createSpyObj('ToasterService', ['success']);
    api.get.and.returnValue(of({ timeZoneId: originalZone }));
    component = new SchedulingPreferencesComponent(api, toaster);
  });
  afterEach(() => component.ngOnDestroy());

  const load = () => component.toggle();
  const select = (zone = 'UTC') => { component.selectedTimeZone = zone; component.selectionChanged(); };

  it('does not access preferences or write anything until opened', () => {
    expect(api.get).not.toHaveBeenCalled();
    expect(api.update).not.toHaveBeenCalled();
    expect(component.canSave).toBeFalse();
  });

  it('loads the saved timezone, not the device suggestion', () => {
    load();
    expect(component.savedTimeZone).toBe(originalZone);
    expect(component.selectedTimeZone).toBe(originalZone);
    expect(component.canSave).toBeFalse();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('reopening retains the choice without extra requests or automatic saves', () => {
    load(); select(); component.toggle(); component.toggle();
    expect(component.selectedTimeZone).toBe('UTC');
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.update).not.toHaveBeenCalled();
  });

  it('offers the device timezone only as an explicit unsaved choice', () => {
    load(); component.deviceTimeZone = 'Asia/Kathmandu'; component.chooseDevice();
    expect(component.selectedTimeZone).toBe('Asia/Kathmandu');
    expect(component.savedTimeZone).toBe(originalZone);
    expect(api.update).not.toHaveBeenCalled();
  });

  it('does not change a previously saved timezone when device detection changes', () => {
    load(); component.deviceTimeZone = 'Europe/Madrid';
    expect(component.selectedTimeZone).toBe(originalZone);
    expect(api.update).not.toHaveBeenCalled();
  });

  it('requires confirmation before saving', () => {
    load(); select(); component.confirmSave();
    expect(api.update).not.toHaveBeenCalled();
    component.requestSave();
    expect(component.confirming).toBeTrue();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('invalidates confirmation when the selection changes', () => {
    load(); select(); component.requestSave(); select(originalZone); component.confirmSave();
    expect(component.confirming).toBeFalse();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('keeps the saved and UTC choices even if the browser list omits them', () => {
    api.get.and.returnValue(of({ timeZoneId: 'Etc/UTC' })); load();
    expect(component.timeZones).toContain(originalZone);
    expect(component.timeZones).toContain('UTC');
    expect(component.timeZones).toContain('Etc/UTC');
    expect(new Set(component.timeZones).size).toBe(component.timeZones.length);
  });

  it('blocks arbitrary values not in the timezone picker', () => {
    load(); select('not/a-zone'); component.requestSave(); component.confirmSave();
    expect(component.canSave).toBeFalse();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('preserves the saved choice when browser timezone enumeration fails', () => {
    spyOn(Intl as any, 'supportedValuesOf').and.throwError('Unsupported timezone enumeration');
    api.get.and.returnValue(of({ timeZoneId: 'Pacific/Chatham' })); load();
    expect(component.selectedTimeZone).toBe('Pacific/Chatham');
    expect(component.timeZones).toContain('Pacific/Chatham');
    expect(component.timeZones).toContain('America/Costa_Rica');
    expect(component.timeZones).toContain('UTC');
    expect(component.canSave).toBeFalse();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('blocks changes until loading completes', () => {
    const response = new Subject<SchedulingPreferences>(); api.get.and.returnValue(response); load();
    expect(component.loading).toBeTrue();
    expect(component.canSave).toBeFalse();
    component.load(); expect(api.get).toHaveBeenCalledTimes(1);
    response.next({ timeZoneId: originalZone }); response.complete();
    expect(component.loaded).toBeTrue();
  });

  it('blocks double submission and dismissal while saving', () => {
    load(); select(); component.requestSave();
    const response = new Subject<SchedulingPreferences>(); api.update.and.returnValue(response);
    component.confirmSave(); component.confirmSave(); component.toggle();
    expect(api.update).toHaveBeenCalledOnceWith('UTC');
    expect(component.saving).toBeTrue();
    expect(component.expanded).toBeTrue();
    expect(component.canSave).toBeFalse();
    response.next({ timeZoneId: 'UTC' }); response.complete();
    expect(component.savedTimeZone).toBe('UTC');
    expect(component.confirming).toBeFalse();
    expect(toaster.success).toHaveBeenCalledTimes(1);
  });

  it('uses the server response rather than assuming the selected value was saved', () => {
    load(); select(); component.requestSave();
    api.update.and.returnValue(of({ timeZoneId: 'Etc/UTC' })); component.confirmSave();
    expect(component.savedTimeZone).toBe('Etc/UTC');
    expect(component.selectedTimeZone).toBe('Etc/UTC');
    expect(component.timeZones).toContain('Etc/UTC');
  });

  it('retains the unsaved choice and original preference on a failed write, allowing retry', () => {
    load(); select(); component.requestSave();
    api.update.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.confirmSave();
    expect(component.savedTimeZone).toBe(originalZone);
    expect(component.selectedTimeZone).toBe('UTC');
    expect(component.canSave).toBeTrue();
    expect(toaster.success).not.toHaveBeenCalled();
    api.update.and.returnValue(of({ timeZoneId: 'UTC' })); component.confirmSave();
    expect(component.savedTimeZone).toBe('UTC');
  });

  [400, 401, 403, 404, 503].forEach(status => {
    it(`handles HTTP ${status} without treating a default as persisted`, () => {
      api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status })));
      load(); expect(component.errorMessage).toBeTruthy();
      expect(component.loaded).toBeFalse();
      expect(component.canSave).toBeFalse();
      expect(api.update).not.toHaveBeenCalled();
    });
  });

  it('retries a failed load', () => {
    api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); load();
    api.get.and.returnValue(of({ timeZoneId: originalZone })); component.load();
    expect(component.loaded).toBeTrue(); expect(component.errorMessage).toBeNull();
  });

  it('ignores late responses after leaving the page', () => {
    const response = new Subject<SchedulingPreferences>(); api.get.and.returnValue(response); load();
    component.ngOnDestroy(); response.next({ timeZoneId: 'UTC' }); response.complete();
    expect(component.loaded).toBeFalse();
  });
});

describe('SchedulingPreferencesComponent template', () => {
  let fixture: ComponentFixture<SchedulingPreferencesComponent>;
  let api: jasmine.SpyObj<SchedulingPreferencesApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('SchedulingPreferencesApiService', ['get', 'update']);
    api.get.and.returnValue(of({ timeZoneId: 'America/Costa_Rica' }));
    await TestBed.configureTestingModule({
      declarations: [SchedulingPreferencesComponent], imports: [CommonModule, FormsModule],
      providers: [{ provide: SchedulingPreferencesApiService, useValue: api }, ToasterService],
    }).compileComponents();
    fixture = TestBed.createComponent(SchedulingPreferencesComponent); fixture.detectChanges();
  });

  it('opens a labelled picker with the persisted value and no write', async () => {
    fixture.nativeElement.querySelector('button').click(); fixture.detectChanges(); await fixture.whenStable();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.id).toBe('scheduling-timezone');
    expect(select.value).toBe('America/Costa_Rica');
    expect(api.update).not.toHaveBeenCalled();
  });

  it('shows a disabled-feature error with retry instead of an editable picker', () => {
    api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    fixture.nativeElement.querySelector('button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('not available yet');
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
  });
});
