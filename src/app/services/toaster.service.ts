import { Injectable } from '@angular/core';

export interface ToastMessage {
  message: string;
  header?: string;
  classname?: string;
  delay?: number;
  autohide?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  public toasts: ToastMessage[] = [];
  private defaultDelay = 5000;

  show(message: string, options: Omit<ToastMessage, 'message'> = {}) {
    const toast: ToastMessage = {
      message,
      autohide: options.autohide ?? true,
      delay: options.delay ?? this.defaultDelay,
      header: options.header,
      classname: options.classname,
    };
    this.toasts = [...this.toasts, toast];
  }

  remove(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  success(message: string, delay?: number) {
    this.show(message, {
      header: 'Success',
      classname: 'bg-success text-light',
      delay,
    });
  }

  failure(message: string, delay?: number) {
    this.show(message, {
      header: 'Error',
      classname: 'bg-danger text-light',
      delay,
    });
  }

  standard(message: string, delay?: number) {
    this.show(message, {
      classname: 'bg-light text-dark',
      delay,
    });
  }
}
