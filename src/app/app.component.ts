import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, Observable, scan, startWith, switchMap, tap } from 'rxjs';

interface Entry {
  title: string,
  amount: string,
}

export interface AddNewEntryDialogData {
  title: string,
  amount: string,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatFabButton,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    RouterOutlet,
  ],
})
export class AppComponent {
  readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['title', 'amount'];
  readonly addingNewEntry = signal(false);
  readonly newEntry$: Observable<Entry> = toObservable(this.addingNewEntry).pipe(
    distinctUntilChanged(),
    filter(addingNewEntry => addingNewEntry === true),
    switchMap((_addingNewEntry) => {
      const dialogRef = this.dialog.open(AddNewEntryDialogComponent,
        {
          data: { title: '', amount: '' },
          // height: '400px',
          // width: '400px',
        });

      return dialogRef.afterClosed().pipe(
        tap((entry) => {
          console.log("add entry:", entry);
          this.addingNewEntry.set(false);
        }),
        filter(entry => entry !== undefined && entry !== null),
      )
    }),
  );
  readonly entries$: Observable<Entry[]> = this.newEntry$.pipe(
    startWith({ title: 'Hello', amount: '100.00' }),
    scan((entries: Entry[], newEntry) => [...entries, newEntry], []),
  );
  readonly entries = toSignal(this.entries$, { initialValue: [] });

  onAddButtonClick(_event: Event) {
    this.addingNewEntry.set(true)
  }
}

@Component({
  selector: 'app-add-new-entry-dialog',
  templateUrl: './app.add-new-entry-dialog.html',
  styleUrl: './app.add-new-entry-dialog.css',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNewEntryDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddNewEntryDialogComponent>);
  readonly data = inject<AddNewEntryDialogData>(MAT_DIALOG_DATA);
  readonly title = model(this.data.title);
  readonly amount = model(this.data.amount);

  entry(): Entry {
    return {
      title: this.title(),
      amount: this.amount(),
    }
  }
}
