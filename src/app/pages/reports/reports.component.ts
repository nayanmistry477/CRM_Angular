import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { ProductPurchaseService } from 'src/app/modules/auth/_services/product-purchase.service';
import { EmailSettingsService } from 'src/app/modules/auth/_services/emailSettings.service';
import { ReplaySubject, Subject } from 'rxjs';
import { TechnicianService } from 'src/app/modules/auth/_services/technicians.service';
import { takeUntil } from 'rxjs/operators';
import { JobService } from 'src/app/modules/auth/_services/job.service';
import { ReportService } from 'src/app/modules/auth/_services/reports.service';
import { ItemTypeService } from 'src/app/modules/auth/_services/itemType.service';
import { DisclaimerService } from 'src/app/modules/auth/_services/disclaimer.service';
import { JobStatusService } from 'src/app/modules/auth/_services/jobStatus.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  public filteredLocationMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public TechnicianMultiFilterCtrl: FormControl = new FormControl();

  public filteredJobStatusMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public JobStatusMultiFilterCtrl: FormControl = new FormControl();

  isLoading$
  public stockList = [];
  public customerList = [];
  public partsList = [];
  public invoiceList = [];
  public statusList = [];
  public jobStatusDetailList = [];
  private jobStatusVal: any[] = [];
  isStock:boolean = false;
  isViewJob:boolean = false;
  isCustomer:boolean = false;
  isSales:boolean = false;
  isInvoice:boolean = false;
  isJobstatus:boolean = false;
  isJobDetailstatus:boolean = false;
  selectedDate:any={}
  dtOptions: any = {};
  dt:any={}
  jobObj:any={};
  public techVal = [];
  public searching: boolean = false;
  protected _onDestroy = new Subject<void>();

  public data = [
    {name: 'test', email: 'test@gmail.com', website:'test.com'},
    {name: 'test', email: 'test@gmail.com', website:'test.com'},
    {name: 'test', email: 'test@gmail.com', website:'test.com'},
    {name: 'test', email: 'test@gmail.com', website:'test.com'},
];
private itemVal: any[] = [];
  constructor(public toastr:ToastrService,    public jobStatusService: JobStatusService,
    private desclaimerService: DisclaimerService,  public itemTypeService: ItemTypeService,public reportService:ReportService,public technicianService: TechnicianService, private elementRef: ElementRef,private emailSettings:EmailSettingsService,public cdr:ChangeDetectorRef,private productPurschase:ProductPurchaseService) {
 
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 4,
      processing: true,
      dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'print'
        ]
    };
   
    this.cdr.markForCheck()
   }

  async ngOnInit() { 
    this.showReport({label:""})
    this.selectedItem('viewStock')
    
    this.selectTechnician("")
    this.showCustomerReport({label:""})
    this.showPartsReport({label:""})
    this.showInvoiceReport({label:""})
    this.showJobStatusReport({label:""})
    this.selectStatus("") 
    this.getAllTechnicians();
    
    this.getAllItemTypes();
    this.getAllJobStatus() 
    this.getDisclaimer(); 
    // var script = document.createElement('script');
    // script.src = './assets/js/components/datatable-net.js';
    // script.type = 'text/javascript'; 
    // this.elementRef.nativeElement.appendChild(script);
    
  }

   //Technicians

   getAllTechnicians() {

    this.technicianService.getAllTechnicians()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.techVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { technician: element.firstname + ' ' + element.lastname };
              list.push(str);
            });
            this.techVal = list;
            this.filteredLocationMulti.next(this.techVal.slice());
            this.TechnicianMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterTechnician()
              },
                error => {
                  // no errors in our simulated example
                  this.searching = false;
                  // handle error...
                });
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
   showDate = false;
   changeDateRange(e){
    if(e == "Custom Date Range"){
      this.showDate = true;
   

    }else{
      console.log(e)
      var data = {
        label:e
      }
      this.showReport(data)
     
      // this.selectedDate = {}
      this.showDate = false;
    }
  }
  changeDate(val1){
  
    console.log(val1)
    if(val1 != null){
      var val = {
        start:this.selectedDate.start._d,
        end:this.selectedDate.end._d
      }
      if(this.selectedDate.end._d != null){
        this.showReport(val) 
      }else{
        return
      }
    }
  
   
  }
  generateReport(){
    if(this.range.value.start != '' && this.range.value.start != null && this.range.value.end != '' && this.range.value.end != null){
      
      var obj = this.range.value;
      var startDate = moment(new Date(this.range.value.start)).format('MMMM/DD/YYYY'); 
      var endDate = moment(new Date(this.range.value.end)).add(1,'day').format('MMMM/DD/YYYY') 
      obj.start = startDate;
      obj.end = endDate; 
      console.log(obj)
      this.reportService.getAllStocksByDate(obj)
      .subscribe(
        data => { 
          if (data.status == 0) { 
 
           } else {  
            // var list= [];
            // var str={}
            data.result.forEach(element => {
              element.pendingQty =Number(element.Inward) - Number(element.Outward)
              
            }); 
            var DateObj = this.range.value;
            DateObj.start=  obj.start
            DateObj.end = moment(new Date(this.range.value.end)).subtract(1,"day").format('MMMM/DD/YYYY')

          console.log(DateObj)
            var str = {data:data.result,dates:obj}
           this.generateStockReport(str)
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    }else{
      this.toastr.error('Please select date')
    }
  }
  isReportSent:boolean = false;
  generateStockReport(obj){
    this.isReportSent = true;
    this.emailSettings.generateStockreport(obj)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isReportSent = false;
            this.cdr.markForCheck();
          } else {

            // this.saleQty = data.result[0].saleQty;
            window.open(data.data, '_blank');
            this.toastr.success(data.message)
            this.isReportSent = false;
            this.range.reset();
            this.cdr.markForCheck(); 
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  showReport(val){
       
      // var obj =val;
      // var startDate = moment(new Date(val.start)).format('MM/DD/YYYY'); 
      // var endDate = moment(new Date(val.end)).add(1,'day').format('MM/DD/YYYY') 
      // obj.start = startDate;
      // obj.end = endDate; 
      this.reportService.getAllStocksByDate(val)
      .subscribe( data => { 
          if (data.status == 0) { 
            this.stockList = data.result;
           } else {   
            data.result.forEach(element => {
              element.pendingQty =Number(element.Inward) - Number(element.Outward)
              
            });  
            this.stockList = data.result; 
            this.range.reset()
            this.cdr.markForCheck()
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
   
  }

  showCustomerReport(val){
        
    this.reportService.getCustomerByDate(val)
    .subscribe(
      data => { 
        if (data.status == 0) { 
          this.customerList = [];
          this.cdr.markForCheck()
         } else {   
         
          console.log(data.result) 
          this.customerList = data.result; 
          this.cdr.markForCheck()
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
 
}
showPartsReport(val){
        
  this.reportService.getPartsByDate(val)
  .subscribe(
    data => { 
      if (data.status == 0) { 
        this.partsList = [];
        this.cdr.markForCheck()
       } else {   
       
        console.log(data.result) 
        this.partsList = data.result; 
        this.cdr.markForCheck()
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
    });

}
showInvoiceReport(val){
        
  this.reportService.getInvoiceByDate(val)
  .subscribe(
    data => { 
      if (data.status == 0) { 
        this.invoiceList = [];
        this.cdr.markForCheck()
       } else {   
       
        console.log(data.result) 
        this.invoiceList = data.result; 
        this.cdr.markForCheck()
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
    });

}

showJobStatusReport(val){
        
  this.reportService.getJobStatusByDate(val)
  .subscribe(
    data => { 
      if (data.status == 0) { 
        this.statusList = [];
        this.cdr.markForCheck()
       } else {   
       
        console.log(data.result) 
        this.statusList = data.result; 
        this.cdr.markForCheck()
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
    });

}
getAllJobStatus() {

  this.jobStatusService.getAllJobStatus()
    .subscribe(
      data => {
        if (data.status == 0) {
          this.jobStatusVal = []; 
        } else {
          var list = [];
          var str = {}
          data.result.forEach(element => {
            str = {id:element.id,statusStage:element.statusStage, jobStatus: element.statusType };
            list.push(str);
          });
          this.jobStatusVal = list;  
        //  console.log(result) 
         
          this.filteredJobStatusMulti.next(this.jobStatusVal.slice());
          this.JobStatusMultiFilterCtrl.valueChanges
            .pipe(
              takeUntil(this._onDestroy))
            .subscribe(() => {
              this.searching = false;
              this.filterJobStatus()
            },
              error => {
                // no errors in our simulated example
                this.searching = false;
                // handle error...
              });
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
}

selectStatus(val) { 
//  console.log(result) 
 
  console.log(val) 
  var valData = {
    label: val
  }
  this.reportService.getJobStatusReportByStatus(valData)
  .subscribe(
    data => { 
      if (data.status == 0) { 
        this.jobStatusDetailList = [];
        this.cdr.markForCheck()
       } else {   
        // const table: any = $('table');
        // this.dt = table.DataTable({
        // });
        this.jobStatusDetailList = data.result; 
        this.cdr.markForCheck()
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
    }); 
}


// changeDetail (val) {
//   var dt
//   const table: any = $('table');
//    dt = table.DataTable({
//   });
//   const tr = $('#detail-btn');
//   const row =  dt.row( tr );

//   // var tr = $(this).closest('tr');
//   // var row = table.DataTable().row(tr);

//   // if ( row.child.isShown() ) {
//   //   // This row is already open - close it
//   //   row.child.hide();
//   //   tr.removeClass('shown');
//   // } else {
//   //   // Open this row
//   //   row.child(this.format({
//   //     val
//   // })).show();
//   // }

//   if (row.child.isShown()) {
//     // This row is already open - close it

//     row.child.hide();
//     tr.removeClass('shown');
// }
// else {
//     row.child(this.format({
//       val
//   })).show()  // create new if not exist
//     // tr.addClass('shown');
// }
// }
// invoiceItems:any = []
// format (val) {
//   this.invoiceItems = val.val.Invoiceitems
//   // `d` is the original data object for the row
//      // `d` is the original data object for the row
 
   
 
//      var html = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
//      for (var i=0;i< this.invoiceItems.length;i++){
//          html += 
     
//          '<tr *ngFor="let items of invoiceItems">'+
//          '<td>name:</td>'+
//          '<td> '+this.invoiceItems[i].name+' </td>'+
//       '</tr>'+
//       '<tr>'+
//          '<td>Price</td>'+
//          '<td> '+this.invoiceItems[i].price+' </td>'+
//       '</tr>'+
//       '<tr>'+
//          '<td>Quantity</td>'+
//          '<td> '+this.invoiceItems[i].quantity+' </td>'+
//        '</tr>';
//      }        
//      return html += '</table>'; 
// }
filterJobStatus() {
  if (!this.jobStatusVal) {
    return;
  }
  // get the search keyword
  let search = this.JobStatusMultiFilterCtrl.value;
  if (!search) {
    this.filteredJobStatusMulti.next(this.jobStatusVal.slice());
    return;
  } else {
    search = search.toLowerCase();
  }
  // filter the banks
  this.filteredJobStatusMulti.next(
    this.jobStatusVal.filter(jobstatus => jobstatus.jobStatus.toLowerCase().indexOf(search) > -1 || jobstatus.jobStatus.toUpperCase().indexOf(search) > -1)
  );
}
  selectedItem(val){
    this.selectedDate ={}
    this.showDate = false;
    if(val == 'viewStock'){
      
      this.isViewJob = false;
      this.isCustomer = false;
      this.isSales = false;
      this.isInvoice = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = false;
      this.isStock = true;
      
    } 
    if(val == 'viewJob'){ 
      this.isStock = false;
      this.isCustomer = false;
      this.isSales = false;
      this.isInvoice = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = false;
      this.isViewJob = true;
    }
    if(val == 'viewCustomer'){ 
      this.isStock = false;
      this.isViewJob = false;
      this.isSales = false;
      this.isInvoice = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = false;
      this.isCustomer = true;
    }
    if(val == 'viewSales'){ 
      this.isStock = false;
      this.isViewJob = false;
      this.isCustomer = false;
      this.isInvoice = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = false;
      this.isSales = true
    }
    if(val == 'viewInvoice'){ 
      this.isStock = false;
      this.isViewJob = false;
      this.isCustomer = false;
      this.isSales = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = false;
      this.isInvoice = true
    }
    if(val == 'viewJobStatus'){ 
      this.isStock = false;
      this.isViewJob = false;
      this.isCustomer = false;
      this.isSales = false
      this.isInvoice = false;
      this.isJobDetailstatus = false;
      this.isJobstatus = true;
    }
    if(val == 'viewJobDetailStatus'){ 
      this.isStock = false;
      this.isViewJob = false;
      this.isCustomer = false;
      this.isSales = false
      this.isInvoice = false;
      this.isJobstatus = false;
      this.isJobDetailstatus = true;
    }
  }
  public technicianList = [];
  selectTechnician(val) {
    console.log(val) 
    var valData = {
      technician: val
    }
    this.reportService.getJobsByTechnicians(valData)
      .subscribe(
        data => {
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.technicianList = []
          } else {
            // console.log(data)
            this.technicianList = data.result;
            this.cdr.markForCheck(); 
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });  
  }

  changeCustomerDateRange(e){
    if(e == "Custom Date Range"){
      
      this.showDate = true;
   

    }else{
      console.log(e)
      var data = {
        label:e
      }
      this.showCustomerReport(data)
     
      // this.selectedDate = {}
      this.showDate = false;
    }
  }
  changeCustomerDate(val1){
  
    console.log(val1)
    if(val1 != null){
      var val = {
        start:this.selectedDate.start._d,
        end:this.selectedDate.end._d
      }
      if(this.selectedDate.end._d != null){
        this.showCustomerReport(val) 
      }else{
        return
      }
    }
  
   
  }
  changePartsDateRange(e){
    if(e == "Custom Date Range"){
      this.selectedDate ={}
      this.showDate = true;
    
    }else{
      console.log(e)
      var data = {
        label:e
      }
      this.showPartsReport(data)
     
      // this.selectedDate = {}
      this.showDate = false;
    }
  }
  changePartsDate(val1){
  
    console.log(val1)
    if(val1 != null){
      var val = {
        start:this.selectedDate.start._d,
        end:this.selectedDate.end._d
      }
      if(this.selectedDate.end._d != null){
        this.showPartsReport(val) 
      }else{
        return
      }
    }
  
   
  }

  changeInvoiceDateRange(e){
    if(e == "Custom Date Range"){
      this.selectedDate ={}
      this.showDate = true;
    
    }else{
      console.log(e)
      var data = {
        label:e
      }
      this.showInvoiceReport(data)
     
      // this.selectedDate = {}
      this.showDate = false;
    }
  }

  changeJobStatusDate(val1){
  
    console.log(val1)
    if(val1 != null){
      var val = {
        start:this.selectedDate.start._d,
        end:this.selectedDate.end._d
      }
      if(this.selectedDate.end._d != null){
        this.showJobStatusReport(val) 
      }else{
        return
      }
    }
  
   
  } 
  changeJobStatusDateRange(e){
    if(e == "Custom Date Range"){
      this.selectedDate ={}
      this.showDate = true;
    
    }else{
      console.log(e)
      var data = {
        label:e
      }
      this.showJobStatusReport(data)
     
      // this.selectedDate = {}
      this.showDate = false;
    }
  }
  changeInvoiceDate(val1){
  
    console.log(val1)
    if(val1 != null){
      var val = {
        start:this.selectedDate.start._d,
        end:this.selectedDate.end._d
      }
      if(this.selectedDate.end._d != null){
        this.showInvoiceReport(val) 
      }else{
        return
      }
    }
  
   
  }
    disclaimer: any = {}
  getDisclaimer() {

    this.desclaimerService.getDisclaimer()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {

            this.isLoading$ = false;
          } else {
            this.disclaimer = data.result[0];
            // console.log(this.disclaimer)
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  getAllItemTypes() {

    this.itemTypeService.getAllItemTypes()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.itemVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { itemType: element.itemTypeName, id: element.id, checkList: element.checkList };
              list.push(str);
            });
            this.itemVal = list;
            // this.filteredItemMulti.next(this.itemVal.slice());
            // this.itemMultiFilterCtrl.valueChanges
            //   .pipe(
            //     takeUntil(this._onDestroy))
            //   .subscribe(() => {
            //     this.searching = false;
            //     this.filterItemType()
            //   },
            //     error => {
            //       // no errors in our simulated example
            //       this.searching = false;
            //       // handle error...
            //     });
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  isMailSent:boolean = false;
  sendWorkSheet(job) {

    var obj = job;
    var customer = job.customer.split(' ');
    obj.firstname = customer[0];
    obj.lastname = customer[1];
    var tmp = document.createElement("DIV");
    tmp.innerHTML = this.disclaimer.disclaimer;;
    tmp.textContent || tmp.innerText || "";
    obj.disclaimer = tmp.innerText

    var itemData = this.itemVal.filter(val => (val.itemType == job.itemType))[0]

    obj.checkList = itemData.checkList
    this.isMailSent = true;

    obj.createdDate = moment(job.createdDate).format('DD/MMMM/YYYY');
    obj.time = moment(new Date(job.createdDate)).format('h:mm');
    console.log(obj)
    this.emailSettings.sendWorkSheet(job)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
          }
          else {

            // var pdgfile  =  new Blob([data.data], { type: 'application/pdf' });
            // const fileURL = URL.createObjectURL(pdgfile);
            // console.log(data.data)
            window.open(data.data, '_blank');
            this.toastr.success(data.message)
            this.isMailSent = false;
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  openWorksheet(job){
    var obj = job;
    console.log(obj);
    this.isMailSent = true;
    this.emailSettings.openWorkSheet(job)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
          }
          else { 
            window.open(data.data, '_blank'); 
            this.isMailSent = false;
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  filterTechnician() {
    if (!this.techVal) {
      return;
    }
    // get the search keyword
    let search = this.TechnicianMultiFilterCtrl.value;
    if (!search) {
      this.filteredLocationMulti.next(this.techVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLocationMulti.next(
      this.techVal.filter(assignTo => assignTo.technician.toLowerCase().indexOf(search) > -1)
    );
  }
}
