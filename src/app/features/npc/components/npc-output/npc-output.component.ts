import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideDownload, lucideUpload } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmSwitchImports } from '@spartan-ng/ui-switch-helm';
import { Highlight, HighlightAuto, HighlightModule } from 'ngx-highlightjs';
import { ToastrService } from 'ngx-toastr';
import { SubSink } from 'subsink';
import { ExportOptions } from '../../../../types/exportOptions.type';
import { NPCForm } from '../../../../types/npcForm.type';
import { NpcCode } from '../../classes/npc-code';
import { NpcService } from '../../services/npc.service';

@Component({
  selector: 'app-npc-output',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmButtonDirective,
    HlmIconComponent,
    HighlightModule,
    HlmSwitchImports,
    Highlight,
    HighlightAuto,
    ReactiveFormsModule,
  ],
  providers: [provideIcons({ lucideCopy, lucideUpload, lucideDownload })],
  templateUrl: './npc-output.component.html',
  styleUrl: './npc-output.component.scss',
})
export class NpcOutputComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  private npcService = inject(NpcService);
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  outputOptions: ExportOptions = {
    includeSTDImport: false,
    includeExport: false,
  };

  @ViewChild('fileInput') fileInput!: ElementRef;

  downloadJSONhref!: SafeUrl;
  code = '';
  form!: FormGroup;

  ngOnInit(): void {
    this.subs.sink = this.npcService.getNPCValues().subscribe((value) => {
      this.code = new NpcCode(value, this.outputOptions).constructCode();
    });

    this.form = this.fb.group({
      includeSTDImport: [false],
      includeExport: [false],
    });

    this.subs.sink = this.form.valueChanges.subscribe(
      (value: ExportOptions) => {
        this.outputOptions = value;
        this.code = new NpcCode(
          this.npcService.npcValues.value,
          this.outputOptions
        ).constructCode();
      }
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openFileDialog() {
    this.fileInput.nativeElement.click();
  }

  async uploadQuest(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target?.files;
    if (!files) return;

    const parsedJSON: NPCForm = JSON.parse(await files[0].text());
    console.log(parsedJSON);
    this.npcService.setImportedNPC(parsedJSON);
  }

  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.code);
      this.toastr.success('Copied to clipboard');
    } catch (error) {
      console.log(error);
      this.toastr.error('Something went wrong, check your console');
    }
  }

  export() {
    let npcJSON = JSON.stringify(this.npcService.npcValues.value);
    let uri = this.sanitizer.bypassSecurityTrustUrl(
      'data:text/json;charset=UTF-8,' + encodeURIComponent(npcJSON)
    );
    this.downloadJSONhref = uri;
  }
}
