import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';   
import { MatCheckboxModule } from '@angular/material/checkbox';
import { JobListComponent } from './job-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InlineSVGModule } from 'ng-inline-svg';
import { TooltipModule } from 'ng2-tooltip-directive';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';

@NgModule({
  declarations: [ JobListComponent ],
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
    InlineSVGModule,
    NgbTooltipModule,
    TooltipModule,
    CRUDTableModule, 
    RouterModule.forChild([
      {
        path: '',
        component:  JobListComponent ,
      },
    ]),
  ],
})
export class JobListModule {}
