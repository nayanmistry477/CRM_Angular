import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs'; 
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {  MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InlineSVGModule } from 'ng-inline-svg'; 
import { JobStatusComponent } from './job-status.component';
import { NgxMatColorPickerModule } from '@angular-material-components/color-picker';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';

@NgModule({
  declarations: [ JobStatusComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatTabsModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    MatToolbarModule,
    MatCardModule,
    HighlightModule,
    NgbNavModule,
    NgxMatColorPickerModule,
    NgbTooltipModule,
    InlineSVGModule,
    CRUDTableModule,
    RouterModule.forChild([
      {
        path: '',
        component: JobStatusComponent ,
      },
    ]),
  ],
})
export class JobStatusModule {}
