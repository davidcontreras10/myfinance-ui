import { Component } from '@angular/core';
import { ToasterService } from '../services/toaster.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  constructor(public toasterService: ToasterService) { }
}
