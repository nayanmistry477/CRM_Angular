import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';   
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { InlineSVGModule } from 'ng-inline-svg'; ;
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { TooltipModule } from 'ng2-tooltip-directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportsComponent } from './reports.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [ReportsComponent ],
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
    MatDatepickerModule,
    DataTablesModule,
    HighlightModule,
    NgbNavModule,
    InlineSVGModule,
    NgbTooltipModule,
    CRUDTableModule,  
    TooltipModule, 
    RouterModule.forChild([
      {
        path: '',
        component:   ReportsComponent ,
      },
    ]),
  ],
})
export class ReportsModule {}
