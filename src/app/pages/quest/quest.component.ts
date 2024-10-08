import { Component, inject } from '@angular/core';
import {
  HlmCardContentDirective,
  HlmCardDescriptionDirective,
  HlmCardDirective,
  HlmCardFooterDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { QuestService } from '../../features/quest/services/quest.service';
import { Highlight, HighlightAuto, HighlightModule } from 'ngx-highlightjs';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { ToastrService } from 'ngx-toastr';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy } from '@ng-icons/lucide';
import { QuestFormComponent } from '../../features/quest/components/quest-form/quest-form.component';
import { QuestOutputComponent } from '../../features/quest/components/quest-output/quest-output.component';
import { QuestDocsComponent } from '../../features/quest/components/quest-docs/quest-docs.component';
import { AngularSplitModule } from 'angular-split';
@Component({
  selector: 'app-quest',
  standalone: true,
  imports: [
    HlmCardDirective,
    HlmCardContentDirective,
    HlmCardDescriptionDirective,
    HlmCardTitleDirective,
    HlmCardHeaderDirective,
    HlmCardFooterDirective,
    Highlight,
    HighlightAuto,
    HlmButtonDirective,
    HlmIconComponent,
    HlmIconComponent,
    QuestFormComponent,
    QuestOutputComponent,
    QuestDocsComponent,
    AngularSplitModule
  ],
  providers: [provideIcons({ lucideCopy })],
  templateUrl: './quest.component.html',
  styleUrl: './quest.component.scss',
})
export class QuestComponent {}
