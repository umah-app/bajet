import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyPipe, MatFabButton, MatIconModule, MatTableModule, MatTooltipModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  displayedColumns: string[] = ['name', 'amount'];
  entries = computed(() => [{ name: 'Hello', amount: '100.00' }]);
  title = 'bajet';
}
