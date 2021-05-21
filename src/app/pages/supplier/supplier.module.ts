import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';   
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SupplierComponent } from './supplier.component';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { InlineSVGModule } from 'ng-inline-svg';

@NgModule({
  declarations: [SupplierComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatCheckboxModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule,
    CRUDTableModule,
    InlineSVGModule,

    RouterModule.forChild([
      {
        path: '',
        component:  SupplierComponent ,
      },
    ]),
  ],
})
export class SupplierModule {}
