import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private configService: ConfigService) { }

  configLoaded: any = false;
  serverConnected: any = false;

  isLoaded() {
    return this.configLoaded;
  }

  isConnected() {
    return this.isLoaded() && this.serverConnected;
  }

  loadConfiguration(successFn: () => void, failureFn: () => void) {
    this.configService.loadConfiguration$().subscribe({
      next: (success: boolean) => {
        this.configLoaded = success;
        successFn();
      },
      error: (error) => {
        this.configLoaded = error;
        failureFn();
      }
    });
  };

  varifyConnection(successFn: () => void, failureFn: () => void) {
    this.configService.pingServer$().subscribe({
      next: (success: boolean) => {
        this.serverConnected = success;
        successFn();
      },
      error: (error) => {
        this.serverConnected = error;
        failureFn();
      }
    });
  };
}