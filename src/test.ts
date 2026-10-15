// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Angular 21 runs TestBed zoneless by default; the app still uses zone.js (see main.ts), so test the same way.
beforeEach(() => TestBed.configureTestingModule({ providers: [provideZoneChangeDetection()] }));
