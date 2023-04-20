import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: Configs | undefined;
  constructor(private httpClient: HttpClient) {
    this.initConfig();
  }

  private initConfig() {
    this.getJSON().subscribe(data => {
      this.config = data;
    });
  }

  public getJSON(): Observable<any> {
    return this.httpClient.get('assets/configs.json');
  }
}


export interface Configs {
  environment: string;
}