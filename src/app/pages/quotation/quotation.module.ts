import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';   
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { InlineSVGModule } from 'ng-inline-svg'; 
import { NgxPaginationModule } from 'ngx-pagination';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { TooltipModule } from 'ng2-tooltip-directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { QuotationComponent } from './quotation.component';

@NgModule({
  declarations: [ QuotationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatTabsModule, 
    NgxPaginationModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    MatToolbarModule,
    MatCardModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule, 
    CRUDTableModule, 
    TooltipModule,
    InlineSVGModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component:  QuotationComponent,
      },
    ]),
  ],
})
export class QuotationModule {}
