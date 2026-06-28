import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  imports: [],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss'
})
export class SummaryCard {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() icon = 'payments';
  @Input() color: 'green' | 'blue' | 'purple' | 'orange' = 'green';
}
