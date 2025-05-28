import { TuiLabel, TuiRoot, TuiTextfieldComponent } from '@taiga-ui/core';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiInputNumberDirective } from '@taiga-ui/kit';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [
    RouterModule,
    TuiRoot,
    TuiTextfieldComponent,
    TuiInputNumberDirective,
    ReactiveFormsModule,
    TuiLabel,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'taiga-ui-kit-usage';

  protected readonly control = new FormControl<number | null>(
    null,
    Validators.required
  );
}
