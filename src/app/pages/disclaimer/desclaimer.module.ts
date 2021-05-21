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
import { DesclaimerComponent } from './desclaimer.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  declarations: [ DesclaimerComponent],
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
    AngularEditorModule,
    RouterModule.forChild([
      {
        path: '',
        component:  DesclaimerComponent,
      },
    ]),
  ],
})
export class DesclaimerModule {}
