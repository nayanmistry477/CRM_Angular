import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';   
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { EmployeeComponent } from './employee.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { InlineSVGModule } from 'ng-inline-svg';
import { ToastrModule } from 'ngx-toastr';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';

@NgModule({
  declarations: [ EmployeeComponent],
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
    NgbTooltipModule,
    InlineSVGModule,
    ToastrModule,
    CRUDTableModule,
    RouterModule.forChild([
      {
        path: '',
        component: EmployeeComponent  ,
      },
    ]),
  ],
})
export class EmployeeModule {}
