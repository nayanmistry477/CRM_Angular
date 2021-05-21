import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';  
import { SettingsComponent } from './settings.component';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    GeneralModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsComponent,
      },
    ]),
  ],
})
export class SettingsModule {}
