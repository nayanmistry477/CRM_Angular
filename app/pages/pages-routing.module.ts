import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'builder',
        loadChildren: () =>
          import('./builder/builder.module').then((m) => m.BuilderModule),
      },
      {
        path: 'open-job',
        loadChildren: () =>
          import('./open-job/open-job.module').then((m) => m.OpenJobModule),
      },
      {
        path: 'closed-job',
        loadChildren: () =>
          import('./closed-job/closed-job.module').then((m) => m.ClosedJobModule),
      },
      {
        path: 'create-job',
        loadChildren: () =>
          import('./create/create.module').then((m) => m.CreateModule),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('./products/products.module').then((m) => m.ProductsModule),
      },
      {
        path: 'product-purchase',
        loadChildren: () =>
          import('./product-purchase/product-purchase.module').then((m) => m.ProductPurchaseModule),
      },
      {
        path: 'service',
        loadChildren: () =>
          import('./job-list/job-list.module').then((m) => m.JobListModule),
      },
      {
        path: 'supplier',
        loadChildren: () =>
          import('./supplier/supplier.module').then((m) => m.SupplierModule),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.module').then((m) => m.UserModule),
      },
     
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'repair-types',
        loadChildren: () =>
          import('./repair-types/repair-types.module').then((m) => m.RepairTypesModule),
      },
      {
        path: 'brands',
        loadChildren: () =>
          import('./brands/brands.module').then((m) => m.BrandsModule),
      },
      {
        path: 'accompanying-items',
        loadChildren: () =>
          import('./accompanying-items/accompanying-items.module').then((m) => m.AccompanyingItemsModule),
      },
      {
        path: 'item-types',
        loadChildren: () =>
          import('./item-types/item-types.module').then((m) => m.ItemTypesModule),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./customers/customers.module').then((m) => m.CustomersModule),
      },
      {
        path: 'technicians',
        loadChildren: () =>
          import('./technicians/technicians.module').then((m) => m. TechniciansModule),
      },
      {
        path: 'storage-locations',
        loadChildren: () =>
          import('./storage-location/storage-location.module').then((m) => m.StorageLocationModule),
      },
      {
        path: 'category',
        loadChildren: () =>
          import('./category/category.module').then((m) => m.CategoryModule),
      },
      {
        path: 'user-roles',
        loadChildren: () =>
          import('./user-roles/user-roles.module').then((m) => m.UserRolesModule),
      },
      {
        path: 'customer-referral',
        loadChildren: () =>
          import('./referrals/referrals.module').then((m) => m.ReferralsModule),
      },
      {
        path: 'email-settings',
        loadChildren: () =>
          import('./email-settings/email-settings.module').then((m) => m.EmailSettingsModule),
      },
      {
        path: 'job-status',
        loadChildren: () =>
          import('./job-status/job-status.module').then((m) => m.JobStatusModule),
      },
      {
        path: 'disclaimer',
        loadChildren: () =>
          import('./disclaimer/disclaimer.module').then((m) => m.DisclaimerModule),
      },
      {
        path: 'invoice-payment-methods',
        loadChildren: () =>
          import('./payment-methods/payment-methods.module').then((m) => m.PaymentMethodsModule),
      },
      {
        path: 'invoice',
        loadChildren: () =>
          import('./invoice/invoice.module').then((m) => m.InvoiceModule),
      },
      {
        path: 'quotation',
        loadChildren: () =>
          import('./quotation/quotation.module').then((m) => m.QuotationModule),
      },
      {
        path: 'ecommerce',
        loadChildren: () =>
          import('../modules/e-commerce/e-commerce.module').then(
            (m) => m.ECommerceModule
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('../modules/user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
      },
      {
        path: 'user-profile',
        loadChildren: () =>
          import('../modules/user-profile/user-profile.module').then(
            (m) => m.UserProfileModule
          ),
      },
      {
        path: 'ngbootstrap',
        loadChildren: () =>
          import('../modules/ngbootstrap/ngbootstrap.module').then(
            (m) => m.NgbootstrapModule
          ),
      },
      {
        path: 'wizards',
        loadChildren: () =>
          import('../modules/wizards/wizards.module').then(
            (m) => m.WizardsModule
          ),
      },
      {
        path: 'material',
        loadChildren: () =>
          import('../modules/material/material.module').then(
            (m) => m.MaterialModule
          ),
      },
      {
        path: '',
        redirectTo: 'create-job',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
