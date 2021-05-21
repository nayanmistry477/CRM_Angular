import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/_services/auth.service';
import { FakeAPIService } from './_fake/fake-api.service';
import { environment } from 'src/environments/environment';
// Highlight JS
import { NgHttpLoaderModule } from 'ng-http-loader';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { SplashScreenModule } from './_metronic/partials/layout/splash-screen/splash-screen.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_COLOR_FORMATS, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker'; 
import { ToastrModule } from 'ngx-toastr';
import { CustomersService } from './modules/auth/_services/customer.service';
import { ProductService } from './modules/auth/_services/product.service';
import { ProductPurchaseService } from './modules/auth/_services/product-purchase.service';
import { SupplierService } from './modules/auth/_services/supplier.service';
import { CategoryService } from './modules/auth/_services/category.service';
import { StorageService } from './modules/auth/_services/storage.service';
import { BrandService } from './modules/auth/_services/brand.service';
import { ItemTypeService } from './modules/auth/_services/itemType.service';
import { EmployeeService } from './modules/auth/_services/employee.service';
import { UserRolesService } from './modules/auth/_services/userRoles.service';
import { ReferredByService } from './modules/auth/_services/referredBy.service';
import { JobStatusService } from './modules/auth/_services/jobStatus.service';
import { EmailSettingsService } from './modules/auth/_services/emailSettings.service';
import { FileUploadModule } from 'ng2-file-upload';
import { JobService } from './modules/auth/_services/job.service';
import { InvoiceService } from './modules/auth/_services/invoice.service';
import { DesclaimerService } from './modules/auth/_services/desclaimer.service';
import { AssignedService } from './modules/auth/_services/assigned.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MomentUtcDateAdapter } from 'src/assets/moment-utc-date-adapter';
import { TechnicianService } from './modules/auth/_services/technicians.service';
import { ReportService } from './modules/auth/_services/reports.service';
import { PaymentService } from './modules/auth/_services/payment.service';
import { QuotationService } from './modules/auth/_services/quotation.service';

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SplashScreenModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    HighlightModule,
    ClipboardModule,
    FileUploadModule,
    NgHttpLoaderModule.forRoot(),
    ToastrModule.forRoot(), // ToastrModule added
    // environment.isMockEnabled
    //   ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
    //     passThruUnknownUrl: true,
    //     dataEncapsulation: false,
    //   })
    //   : [],
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
  ],
  providers: [
    {
      
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService,
        CustomersService,
        ProductService,
        ProductPurchaseService,
        CategoryService,
        StorageService,
        BrandService,
        ItemTypeService,
        EmployeeService,
        UserRolesService,
        ReferredByService,
        JobStatusService,
        JobService,
        EmailSettingsService,
        InvoiceService,
        DesclaimerService,
        AssignedService,
        TechnicianService,
        ReportService,
        PaymentService,
        QuotationService,
        SupplierService], 
      
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentUtcDateAdapter },
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS },

    {
      provide: HIGHLIGHT_OPTIONS,
      
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
          json: () => import('highlight.js/lib/languages/json')
        },
      },
      
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
