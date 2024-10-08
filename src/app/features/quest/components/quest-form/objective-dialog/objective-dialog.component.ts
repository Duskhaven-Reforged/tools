import { Component, EventEmitter, Output } from '@angular/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  BrnDialogContentDirective,
  BrnDialogTriggerDirective,
} from '@spartan-ng/ui-dialog-brain';
import {
  HlmDialogComponent,
  HlmDialogContentComponent,
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-objective-dialog',
  standalone: true,
  imports: [
    HlmButtonDirective,
    BrnDialogTriggerDirective,
    BrnDialogContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './objective-dialog.component.html',
  styleUrl: './objective-dialog.component.scss',
})
export class ObjectiveDialogComponent {
  @Output() addObjectiveEvent = new EventEmitter<'Item Drop' | 'NPC Target'>();

  addItemDrop(ctx: any) {
    this.addObjectiveEvent.emit('Item Drop');
    ctx.close();
  }

  addNPC(ctx: any) {
    this.addObjectiveEvent.emit('NPC Target');
    ctx.close();
  }
}
