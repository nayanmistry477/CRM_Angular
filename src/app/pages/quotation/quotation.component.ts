import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild,AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CustomersService } from 'src/app/modules/auth/_services/customer.service';
import { EmailSettingsService } from 'src/app/modules/auth/_services/emailSettings.service';
import { UserService } from 'src/app/modules/auth/_services/user.service';
import { InvoiceService } from 'src/app/modules/auth/_services/invoice.service';
import { JobService } from 'src/app/modules/auth/_services/job.service';
import { JobStatusService } from 'src/app/modules/auth/_services/jobStatus.service';
import { PaymentService } from 'src/app/modules/auth/_services/payment.service';
import { ProductService } from 'src/app/modules/auth/_services/product.service';
import { QuotationService } from 'src/app/modules/auth/_services/quotation.service';
import { ServicesService } from 'src/app/modules/auth/_services/services.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: number;
}
interface PaymentType {
  paymentType: string;
}

interface Job {
  id: string;
  name: string;
}

interface DisplayName {
  id: string;
  name: string;
}

interface Status {
  id: string;
  name: string;
}
@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent implements OnInit {
  @ViewChild('openModal') openModal: TemplateRef<any>; 
  @ViewChild('confrimSalesBox') confrimSalesBox: TemplateRef<any>; 
  @ViewChild('confrimQuote') confrimQuote: TemplateRef<any>; 
  @ViewChild('manualproductopenModal') manualproductopenModal: TemplateRef<any>;  
  @ViewChild('confrimProductManual') confrimProductManual: TemplateRef<any>;
  @ViewChild('serviceopenModal') serviceopenModal: TemplateRef<any>;
  @ViewChild('confrimInvoice') confrimInvoice: TemplateRef<any>;
  @ViewChild('productopenModal') productopenModal: TemplateRef<any>; 
  protected _onDestroy = new Subject<void>();
  public filteredCustomerMulti: ReplaySubject<Customer[]> = new ReplaySubject<Customer[]>(1);

  public customerMultiFilterCtrl: FormControl = new FormControl();

  public filteredJobMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public jobMultiFilterCtrl: FormControl = new FormControl();

  public filteredDisplayMulti: ReplaySubject<DisplayName[]> = new ReplaySubject<DisplayName[]>(1);

  public DisplayMultiFilterCtrl: FormControl = new FormControl();
  public filteredProductMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public productMultiFilterCtrl: FormControl = new FormControl();
  public filteredServiceMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public serviceMultiFilterCtrl: FormControl = new FormControl();


  public filteredpaymentTypeMulti: ReplaySubject<PaymentType[]> = new ReplaySubject<PaymentType[]>(1);
  public paymentTypeMultiFilterCtrl: FormControl = new FormControl();
  public filteredstatusMulti: ReplaySubject<Status[]> = new ReplaySubject<Status[]>(1);
  public statusMultiFilterCtrl: FormControl = new FormControl();
  paginator: PaginatorState;
  paginatorService: PaginatorState;
  searchGroup: FormGroup; 
  quoteForm: FormGroup; 
  quoteGroup:FormGroup;
  productGroup: FormGroup;
  productManualForm:FormGroup; 
  ServiceformGroup: FormGroup;

  sorting: SortState;
  grouping: GroupingState;
  isLoading$
  isLoading: boolean;
  selectCompany: any = {}; 
  public searching: boolean = false;
 
  selectedIndex = 0;
  isFlag: number = 1;
  quoteTotal: number = 0;
  p: number
  quoteData: any = {}; 
  totalSum: any = 0;
  public dataList = [];
  public dataList1 = [];
  isFlagUpdate :number = 0;
  productData: any;
  orgPrice: number = 0;
  orgPrice1:number = 0;
  totalQty: number = 0;
  totalPaid: number;
  private productVal: any[] = [];
  private serviceVal: any[] = [];
  minDate = new Date();
  isProductManualVal:any={}
  list: any = {}
  sum: number = 0;
  private customerVal: any[] = [];
  private paymentVal: PaymentType[] = [
    { paymentType: 'Other', },
    { paymentType: 'Cash Sale', },
    { paymentType: 'Card Payment Remote', },
    { paymentType: 'Card Payment', },
    { paymentType: 'BACs', },
  ];
  private jobVal: Job[] = [];

  private displayVal: DisplayName[] = [
    { name: 'Bill Amos', id: 'A' },
    { name: 'John Doe', id: 'B' },
  ];
  private subscriptions: Subscription[] = [];

  private statusVal: Status[] = [
    { name: 'Open', id: '1' },
    { name: 'Sent', id: '2' },
    { name: 'Paid', id: '3' },
    { name: 'OverDue', id: '4' },
    { name: 'Void', id: '5' },
    { name: 'Write Off', id: '6' },
    { name: 'Part Paid', id: '7' },
  ];

  public jobStatusList = [];
  constructor(private fb: FormBuilder, 
    public jobStatusSService: JobStatusService,
    public jobService: JobService,
    private toastr: ToastrService,
    public productService: ProductService,
    public quotationService:QuotationService,
    public emailService: EmailSettingsService,
    public userService: UserService,
    public customerService: CustomersService, 
    public servicesService: ServicesService,
    public InvoiceService: InvoiceService,
    private router :Router,
    private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.modalService.dismissAll()
    this.getAllJobsStatus();
    const sb = this.quotationService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.quotationService.grouping;
    this.paginator = this.quotationService.paginator;
    this.sorting = this.quotationService.sorting;
    this.quotationService.fetch();
  }
  isShow: boolean = false;
  user: any = {}
  ngOnInit(): void {

    var token = JSON.parse(localStorage.getItem('token'));
    this.user = token.user;

    this.filteredDisplayMulti.next(this.displayVal.slice());
    this.filteredstatusMulti.next(this.statusVal.slice());

    this.changeOption('')
    this.searchForm(); 
    // this.getCompanyDetails();
    this.getAllProducts();
    this.getAllServices();
    this.getAllCustomers();
    this.getAllEmailSettings(); 

    this.quoteForm = this.fb.group({
      id:[''], 
      subTotal: [''],
      discount: [''],
      totalPrice: [''],
      deposit: [''], 
      quotationDate: [''],
      address:[''],
      customerEmail: ['',Validators.compose([  Validators.email])],
      customerContact: ['',Validators.compose([  Validators.minLength(11), Validators.maxLength(11)])],
      percentage:[''],
      service: [''],
      product: [''],
      exactAmount:['']
    });
    this.quoteGroup = this.fb.group({  
      job: [''],
      customer: ['', Validators.compose([Validators.required])] 
    })
    this.productGroup = this.fb.group({
      productName: ['', Validators.compose([Validators.required,])],
      sellPrice: ['', Validators.compose([Validators.required,])],
      costPrice: [''],
    });
    this.productManualForm = this.fb.group({
      id:[''],
      name: ['', Validators.compose([Validators.required,])],
      sellPrice: ['', Validators.compose([Validators.required,])],
      quantity:[''],
      costPrice: [''],
    }); 
    this.ServiceformGroup = this.fb.group({
      serviceName: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
    });
  }
  backToMain() {
    this.isShow = false;
    // this.getInvoiceByID(  this.invoiceData.id) 
    this.quoteData = {};
    this.dataList = [];
    this.dataList1 = []; 
    this.list = {};
    this.listPro = {};
    this.changeOption('')
    this.quotationService.fetch()
    this.jobService.fetch()
    this.cdr.markForCheck();
   
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
    // this.load_completed = true;
    // this.getInvoiceByID(  this.invoiceData.id)
  }
  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/; 
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  dates: any = {}
  editQuote(data) {
    console.log(data)
    this.isShow = true; 
    this.quoteForm.controls['subTotal'].setValue(data.subTotal)
    this.quoteData = data;
    this.dates = data;
    this.isInvoiceExistsOfQuotation(data.quoteID)
    
    // if (data.jobId != undefined || data.jobId != null) {
      // this.getJobByJobId(data.jobId) 
      // this.getManualProductByJobID(data.jobId);
      // this.getPaymentById(data.id) 
    // } else {
      this.getProducts_ServiceByQuoteID(this.quoteData.quoteID)
      this.getManualProductByQuoteID(this.quoteData.quoteID); 
      
      this.cdr.markForCheck();
    // } 
    // this.getInvoiceByjobID(data.jobId)
   

  }
  isInvoice:boolean = false
  isInvoiceExistsOfQuotation(id){
    var val ={
      quoteID:id
    }
    this.quotationService.getInvoiceByQuoteID(val)
    .subscribe(
      data => {
        if (data.status == 0) {
          this.isInvoice = false;
          this.cdr.markForCheck()
        } else {
          this.isInvoice = true;
          this.cdr.markForCheck()
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
  }
  isPercentageBox:boolean = false;
  isAmountBox:boolean = false;
  changeOption(val){
    if(val == 'percentage'){
      this.isAmountBox = false;
      this.isPercentageBox = true; 
      this.cdr.markForCheck()
    }if(val == 'exactAmount'){
      this.isPercentageBox = false;
      this.isAmountBox = true;   
      this.cdr.markForCheck()
    }if(val == ''){
      this.isPercentageBox = false;
      this.isAmountBox = false;  
      this.cdr.markForCheck()
    } 
    console.log(val)
  }
 
  
  isProductFlag:number = 1;
  productManualObj:any={}
  addProductManualModal(){
     this.isProductFlag = 1;
    this.modalService.open(this.manualproductopenModal);
    this.productManualForm.reset();
  }
  
  addProductManually() {

    this.productManualForm.markAllAsTouched();
    if (!this.productManualForm.valid) {
      return;
    } else {

      const productObj = this.productManualForm.value;
      productObj.quoteID = this.quoteData.quoteID 
       
      this.isLoading$ = true;
      if(this.productManualForm.value.quantity >1){
        productObj.unitPrice = Number(productObj.sellPrice ) / Number( productObj.quantity) 
      }else{
        productObj.unitPrice = productObj.sellPrice
      }
      this.sum = Number(this.quoteData.subTotal) + Number(productObj.sellPrice)
      this.quoteData.subTotal = this.sum;
      this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal);
      this.productService.createProductManually(productObj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)    
              this.productManualForm.reset();
              this.getManualProductByQuoteID(this.quoteData.quoteID);
              this.productManualForm.untouched;
              this.modalService.dismissAll();
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }
  editProductManualModal(data) {
    this.isProductFlag = 2;
    this.productManualObj = data;
    this.productManualForm.controls['id'].setValue(data.id);
    this.productManualForm.controls['name'].setValue(data.name);
    this.productManualForm.controls['sellPrice'].setValue(data.price); 
    this.productManualForm.controls['quantity'].setValue(data.quantity); 
    this.modalService.open(this.manualproductopenModal);  
  }
  productDeleteVal:any={}
  deleteManualProduct:boolean = false;
  editDeletemodalManual(data){
    this.productDeleteVal = data;
    this.modalService.open(this.confrimProductManual)
  }
  // updateProductManually(){
  //   this.productManualForm.markAllAsTouched();
  //   if (!this.productManualForm.valid) {
  //     return;
  //   } else {

  //     const productObj = this.productManualForm.value;
  //     productObj.id = this.productManualObj.id
  //     // productObj.invoiceID = this.invoiceData.invoiceID
  //     // productObj.jobID = this.invoiceData.jobId
  //     this.isLoading$ = true;
  //     // this.dataList1.forEach(element => {
  //     //   if (element.id == productObj.id) {
  //     //     var total;
  
  //     //     if (Number(productObj.sellPrice) >= Number(element.price)) {
  //     //       this.sum = this.quoteData.subTotal
  //     //       var old = this.sum - Number(element.price);
  //     //       this.sum = Number(old) + Number(productObj.sellPrice);
  //     //       this.quoteData.subTotal = this.sum
  
  //     //     }
  //     //     if (Number(productObj.sellPrice <= Number(element.price))) {
  //     //       this.sum = this.quoteData.subTotal
  //     //       total = Number(element.price) - Number(productObj.sellPrice)
  //     //       this.sum = this.sum - total;
  //     //       this.quoteData.subTotal = this.sum
  //     //       // console.log(this.sum)
  //     //     }
  //     //     if (element.id == element.id) {
  //     //       element.price = Number(productObj.sellPrice)
  //     //       // console.log(element)
  //     //       // service = element
  //     //     }
  //     //   }
  
  //     // });
  //     // if(this.productManualForm.value.quantity >1){
  //     //   productObj.unitPrice = Number(productObj.sellPrice ) / Number( productObj.quantity) 
  //     // }else{
  //     //   productObj.unitPrice = productObj.sellPrice
  //     // }
  //     // this.InvoiceForm.controls['product'].reset();
  //     // this.sum = Number(this.invoiceData.subTotal) + Number(productObj.sellPrice)
  //     // this.invoiceData.subTotal = this.sum;
        
  //     // this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
  //     this.productService.updateProductManually(productObj)
  //       .subscribe(
  //         data => {
  //           if (data.data.status == 0) {
  //             this.toastr.error(data.data.message)
  //             this.isLoading$ = false;
  //           } else {
  //             this.toastr.success(data.data.message)   
  //             this.productManualForm.reset();
  //             this.getManualProductByQuoteID(this.quoteData.quoteID);
  //             this.productManualForm.untouched;
  //             this.modalService.dismissAll();
  //             this.isLoading$ = false;

  //           }
  //         },
  //         error => {
  //           // this.showError(error.statusText);
  //           console.log(error);
  //         });
  //   }
  // }
 
  closeProductManualModal() {
    this.modalService.dismissAll(this.manualproductopenModal);
    this.productManualForm.reset();
  }
  deleteProductManual(){
   
 
      this.deleteManualProduct = true;
     
      const index = this.dataList1.indexOf(this.productDeleteVal, 0);
      if (index > -1) {
        this.dataList1.splice(index, 1);
        this.totalQty = 0
      } 

 
      this.productService.deleteProductManually(this.productDeleteVal)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.deleteManualProduct = false;
            } else {
              this.toastr.success(data.data.message)   
              this.sum = Number(this.quoteData.subTotal) - Number(this.productDeleteVal.price)
              this.quoteData.subTotal= this.sum
              this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
              this.updateRepairDetails()
              this.productManualForm.reset();
              
              this.getManualProductByQuoteID(this.quoteData.quoteID);
              this.productManualForm.untouched;
              this.modalService.dismissAll();
              this.deleteManualProduct = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
     
  }
  closedeleteManualProduct(){
    this.modalService.dismissAll(this.manualproductopenModal);
    this.productDeleteVal = {}
  }  

 
  deleteVal: any = {}
  editdeleteQuote(data) {
    console.log(data)
    this.deleteVal = data;
    this.modalService.open(this.confrimQuote)
  }
  isDelete$: boolean = false;
  deleteQuote() {
    this.isDelete$ = true;

    this.quotationService.deleteQuotation(this.deleteVal)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.deleteVal = {};
            this.isDelete$ = false;
            this.modalService.dismissAll()
            this.quotationService.fetch()
            this.cdr.markForCheck()
          } else {

            this.toastr.success(data.data.message)
             
            this.deleteVal = {};
            this.isDelete$ = false;
            this.modalService.dismissAll()
            this.quotationService.fetch()
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }

  closedeleteQuote(){
    this.modalService.dismissAll(this.confrimQuote); 
  }  

  //Add Product

  editProductModal() {
    this.modalService.open(this.productopenModal);
    this.productGroup.reset();
  }

  listPro: any = {}
  selectProduct(val) {
    console.log(val)
    this.list = {}
    var data = {}

    data = val;
    this.listPro = this.productVal.filter(x => x.product == val)[0];
    // console.log(this.list)

    // var valData = {
    //   productID: this.listPro.id
    // }
    // this.productService.getAllPurchaseCount(valData)
    //   .subscribe(
    //     data => {
    //       if (data.status == 0) {
    //         this.toastr.error(data.message)

    //       } else {
    //         // console.log(data)
    //         if (data.result) {
    //           this.totalQty = data.result[0].totalQty;
    //           console.log(data.result[0].totalQty)
    //         } else {
    //           this.totalQty = 0
    //         }
    //         this.cdr.markForCheck()
    //         console.log(data.result)
    //         // this.saleQty = data.result[0].saleQty;


    //       }
    //     },
    //     error => {
    //       // this.showError(error.statusText);
    //       console.log(error);
    //     });
    this.cdr.markForCheck()
  }
  closeServiceModal() {
    this.modalService.dismissAll(this.serviceopenModal);
    this.ServiceformGroup.reset();
  }
  servicePrice: number = 0;
  //Services 

  quantity: number = 1
  selectService(val) {
    console.log(val)
    this.list = {}
    var data = {}

    data = val
    this.list = data
    this.list = this.serviceVal.filter(x => x.service == val)[0];
    this.cdr.markForCheck()
  }

  getAllServices() {

    this.servicesService.getAllServices()
      .subscribe(
        data => {
          if (data.status == 0) {

            this.serviceVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { serviceID: element.serviceID, service: element.serviceName, price: element.price, id: element.id }

              list.push(str)

            });

            this.serviceVal = list;
            this.filteredServiceMulti.next(this.serviceVal.slice());
            this.serviceMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterService()
              },
                error => {
                  // no errors in our simulated example
                  this.searching = false;
                  // handle error...
                });
          } this.cdr.markForCheck();
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }

  addServiceInGrid() {

    var data = {
      id: this.list.serviceID,
      name: this.list.service,
      price: this.list.price,
      service: "1",
      type: "service",
      quantity: 1
    }
    if (this.list.price != null && this.list.price != ""
      && this.list.service != null && this.list.service != "") {

      // console.log(data)
      if (this.dataList.length == 0) {
        this.dataList.push(data)

        this.quoteForm.controls['service'].reset();
        this.sum = Number(this.quoteData.subTotal) + Number(this.list.price)
        this.quoteData.subTotal = this.sum;  
        this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
        this.list = []
      } else {

        var result = this.dataList.filter(res => res.name == this.list.service)[0];
        if (result != null) {

          var id = {
            id: result.id
          }
          this.servicesService.getServiceByServiceID(id)
            .subscribe(
              data => {

                if (data.status == 0) {
                  this.toastr.error(data.message)
                } else {

                  this.servicePrice = data.result[0].price;
                  // this.toastr.error('Service is already added in job');
                  result.quantity++
                  this.sum = Number(this.quoteData.subTotal) + Number(this.servicePrice);
                  this.quoteData.subTotal = this.sum;
                  this.dataList.forEach(element => {
                    if (element.id === result.id) {
                      element.price = Number(element.price) + Number(this.servicePrice);

                    }
                  }); 
                  // console.log(this.jobObj.deposit)  
 
                  // this.dataList.push(data)
                  this.quoteForm.controls['service'].reset();
                  this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
                  // this.sum = Number(this.sum) + Number(result.price)
                  result = []
                  this.list = []
                  this.cdr.markForCheck()
                }
              },
              error => {
                console.log(error);
              });


        }
        else {
          this.dataList.push(data)
          console.log(this.dataList)
          this.quoteForm.controls['service'].reset();
          this.sum = Number(this.quoteData.subTotal) + Number(this.list.price)  
          this.quoteData.subTotal = this.sum; 
          this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
          // console.log(this.jobObj.deposit) 
          this.cdr.markForCheck();
          this.list = []


        }
      }

      this.cdr.markForCheck()
    } else {
      this.toastr.error('Please Select Service')

    }

  }
  addService() {

    this.ServiceformGroup.markAllAsTouched();
    if (!this.ServiceformGroup.valid) {
      return;
    } else {

      const serviceObj = this.ServiceformGroup.value;
      this.isLoading$ = true;
      this.servicesService.createService(serviceObj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.quoteData.service = this.ServiceformGroup.value.serviceName;
              this.list = { serviceID: data.data.result1.serviceID, id: data.data.result1.id, service: this.ServiceformGroup.value.serviceName, price: this.ServiceformGroup.value.price }
              this.ServiceformGroup.reset();
              this.getAllServices();
              this.ServiceformGroup.untouched;
              this.modalService.dismissAll();
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }
  filterService() {
    if (!this.serviceVal) {
      return;
    }
    // get the search keyword
    let search = this.serviceMultiFilterCtrl.value;
    if (!search) {
      this.filteredServiceMulti.next(this.serviceVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredServiceMulti.next(
      this.serviceVal.filter(item => item.service.toLowerCase().indexOf(search) > -1 || item.service.toUpperCase().indexOf(search) > -1)
    );
  }
  getAllProducts() {

    this.productService.getAllProducts()
      .subscribe(
        data => {
          if (data.status == 0) {

            this.productVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { product: element.productName, price: element.sellPrice, id: element.id }
              list.push(str)
            });

            this.productVal = list;
            this.filteredProductMulti.next(this.productVal.slice());

            this.productMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterProduct()
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

  filterProduct() {
    if (!this.productVal) {
      return;
    }
    // get the search keyword
    let search = this.productMultiFilterCtrl.value;
    if (!search) {
      this.filteredProductMulti.next(this.productVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredProductMulti.next(
      this.productVal.filter(item => item.product.toLowerCase().indexOf(search) > -1 || item.product.toUpperCase().indexOf(search) > -1)
    );
  }
  proOrgPrice: number = 0;
  addProductInGrid() {
    var proList = []
    var data = {
      id: this.listPro.id,
      name: this.listPro.product,
      type: "product",
      quantity: 1,
      price: this.listPro.price,
      unitPrice:this.listPro.price
    }
    if (data.quantity != null && this.listPro.product != null && this.listPro.product != "" && this.listPro.price != null && this.listPro.price != ""
    ) {

      if (this.dataList.length == 0) {
        this.dataList.push(data) 
        this.quoteForm.controls['product'].reset();
        this.sum = Number(this.quoteData.subTotal) + Number(this.listPro.price)
        this.quoteData.subTotal = this.sum;  
        this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
        this.listPro = []
        this.cdr.markForCheck()
      } else {

        var result = this.dataList.filter(res => res.name == this.listPro.product)[0];
        if (result != null) {
 

            // this.toastr.error('Product is already added in job');
            var id = {
              id: result.id
            }
            this.productService.getProductByProductID(id)
              .subscribe(
                data => {

                  if (data.status == 0) {
                    this.toastr.error(data.message)
                  } else {

                    this.proOrgPrice = data.result[0].sellPrice;
                    // this.toastr.error('Service is already added in job');
                    result.quantity++
                    this.sum = Number(this.quoteData.subTotal) + Number(this.proOrgPrice);
                    this.quoteData.subTotal = this.sum;
                    this.dataList.forEach(element => {
                      if (element.id === result.id) {
                        element.price = Number(element.price) + Number(this.proOrgPrice);

                      }
                    }); 
                    
                    this.quoteForm.controls['product'].reset(); 
                    this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
                    result = [];
                    this.listPro = [];
                    this.cdr.markForCheck();
                  }

                },
                error => {
                  console.log(error);
                });
       
        }

        else {
         
            this.dataList.push(data)
            this.quoteForm.controls['product'].reset(); 
            this.sum = Number(this.quoteData.subTotal) + Number(this.listPro.price)  
            this.quoteData.subTotal = this.sum;  
            this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
            this.cdr.markForCheck();
            this.listPro = []
           
          this.cdr.markForCheck();
        }

      }
    } else {
      this.toastr.error('Please Select Product')
    }
  }
  addProduct() {

    this.productGroup.markAllAsTouched();
    if (!this.productGroup.valid) {
      return;
    } else {

      const productObj = this.productGroup.value;
      this.isLoading$ = true;
      this.productService.createProduct(productObj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.quoteData.product = this.productGroup.value.productName;
              this.listPro = {id:data.data.result1.insertId, product: this.productGroup.value.productName, price: this.productGroup.value.sellPrice, quanity: 1 }

              this.productGroup.reset();
              this.getAllProducts();
              this.productGroup.untouched;
              this.modalService.dismissAll();
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }
  closeProductModal() {
    this.modalService.dismissAll(this.productopenModal);
    this.productGroup.reset();
  }

  editServiceModal() {
    this.modalService.open(this.serviceopenModal);
    this.ServiceformGroup.reset();
  }

  deleVal: any = {}
  deleteData(val) {
    this.modalService.open(this.confrimSalesBox);
    this.deleVal = val;

  }
  closeDeleteItem() {
    this.modalService.dismissAll(this.confrimSalesBox)
  }
  deleteItem() {
   

      const index = this.dataList.indexOf(this.deleVal, 0);
      if (index > -1) {
        this.dataList.splice(index, 1);
        this.totalQty = 0
      } 

      
      this.quotationService.deleteItem(this.deleVal)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isDelete$ = false;
            } else {

              this.toastr.success(data.data.message)
              this.sum = Number(this.quoteData.subTotal) - Number(this.deleVal.price)
              this.quoteData.subTotal= this.sum
              this.quoteForm.controls['subTotal'].setValue( this.quoteData.subTotal)
              this.updateRepairDetails()
              this.deleVal = {};
              this.isDelete$ = false; 
              this.modalService.dismissAll()
              this.quotationService.fetch()
              this.cdr.markForCheck()

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    // }

  }
  editMode: any;
  editModeCheck(i, x, data) {
    if (i == x) {
      this.editMode = x;
      console.log(this.editMode)
      return false;
    }

  }

  priceVal: string;
  editModeSave(i, x, item) {
    if (Number(this.priceVal) <= 0) {
      this.toastr.error('Please enter valid amount')
    } else {

      if (this.priceVal == undefined) {
        // console.log("Price:" + this.priceVal);
        this.editMode = false;
        if (i == x) {
          if (this.editMode != false) {
            this.editMode = x;
          } else {
            this.editMode = null;
          }
        }
      } else {
        // console.log("Price:" + this.priceVal); 
        this.editMode = false;

        if (i == x) {
          if (this.editMode != false) {
            this.editMode = x;
          } else {
            this.editMode = null;
            this.editPrice(item, this.priceVal)
          }
        }
      }
    }
  }

  editPrice(item, newPrice) {

    this.dataList.forEach(element => {
      if (element.id == item.id) {
        var total;

        if (Number(newPrice) >= Number(item.price)) {
          this.sum = this.quoteData.subTotal
          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          this.quoteData.subTotal = this.sum

        }
        if (Number(newPrice <= Number(item.price))) {
          this.sum = this.quoteData.subTotal
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
          this.quoteData.subTotal = this.sum
          // console.log(this.sum)
        }
        if (element.id == item.id) {
          element.price = Number(newPrice)
          // console.log(element)
          // service = element
        }
      }

    }); 
    // console.log(this.jobObj.deposit) 
    this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
  }

  async increment(quote, i) {
    console.log(quote)
    this.isFlagUpdate = 1
       
      // return
      var id = {
        id: quote.id
      }
      var price
      this.productService.getProductByProductID(id)
        .subscribe(
          data => {

            if (data.status == 0) {
              // this.toastr.error(data.message)

            } else {

              this.orgPrice = data.result[0].sellPrice;

              quote.quantity++
              //  this.quantity ++ 
              //  console.log(Number(this.dataList[i].quantity))
              //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)

              this.dataList.forEach(element => {
                if (element.id === quote.id) {

                  var oldproductprice = this.quoteData.subTotal;
                  element.price = Number(element.price) + Number(this.orgPrice);
                  this.sum = Number(oldproductprice) + Number(this.orgPrice);
                  this.quoteData.subTotal = this.sum;
 
                }  
                this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
                this.cdr.markForCheck()
              })
            }
          },
          error => {
            console.log(error);
          });
   
 
     
    // }
    this.cdr.markForCheck();

  }
  async decrement(quote) {
    console.log(quote)
    this.isFlagUpdate = 1
    if (quote.quantity <= 0 && quote.quantity == -1) {
      quote.quantity = 1;
      this.sum = 0;
    } else {

      var valData = {
        id: quote.id, 

      }
      this.productService.getProductByProductID(valData)
      .subscribe(
        data => {

          if (data.status == 0) {
            // this.toastr.error(data.message)

          } else {

            this.orgPrice = data.result[0].sellPrice;

            quote.quantity--
 
            var oldproductprice = this.quoteData.subTotal;
              this.dataList.forEach(element => { 
                if (element.id === quote.id) {
                  element.price = Number(element.price) - Number( this.orgPrice);
                  this.sum = Number(oldproductprice) - Number( this.orgPrice);
                  this.quoteData.subTotal = this.sum;
                }
              });
              console.log(this.sum);
            
            this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
            this.cdr.markForCheck()
          }
        },
        error => {
          console.log(error);
        });
      
    }
  }

  //For Manual Product 
  editMode1: any;
  editModeCheck1(i, x, data) {
    this.isFlagUpdate = 2
    if (i == x) {
      this.editMode1 = x;
      console.log(this.editMode1)
      return false;
    }

  }

  priceVal1: string;
  editModeSave1(i, x, item) {
    this.isFlagUpdate = 2
    if (Number(this.priceVal1) <= 0) {
      this.toastr.error('Please enter valid amount')
    } else {

      if (this.priceVal1 == undefined) {
        // console.log("Price:" + this.priceVal);
        this.editMode1 = false;
        if (i == x) {
          if (this.editMode1 != false) {
            this.editMode1 = x;
          } else {
            this.editMode1 = null;
          }
        }
      } else {
        // console.log("Price:" + this.priceVal); 
        this.editMode1 = false;

        if (i == x) {
          if (this.editMode1 != false) {
            this.editMode1 = x;
          } else {
            this.editMode1 = null;
            this.editPrice1(item, this.priceVal1)
          }
        }
      }
    }
  }

  editPrice1(item, newPrice) {
    this.isFlagUpdate = 2
    this.dataList1.forEach(element => {
      if (element.id == item.id) {
        var total;

        if (Number(newPrice) >= Number(item.price)) {
          this.sum = this.quoteData.subTotal
          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          this.quoteData.subTotal = this.sum

        }
        if (Number(newPrice <= Number(item.price))) {
          this.sum = this.quoteData.subTotal
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
          this.quoteData.subTotal = this.sum
          // console.log(this.sum)
        }
        if (element.id == item.id) {
          element.price = Number(newPrice)
          // console.log(element)
          // service = element
        }
      }

    }); 
    // console.log(this.jobObj.deposit) 
    this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
  }

  async incrementManualProduct(quote, i) {
    console.log(quote)
    this.isFlagUpdate = 2
    this.isProductManualVal = quote;
      // return
      var id = {
        id: quote.id
      }
      var price
      this.productService.getProductManualByProductID(id)
        .subscribe(
          data => {

            if (data.status == 0) {
              // this.toastr.error(data.message)

            } else {

              this.orgPrice1 = data.result[0].unitPrice;

              quote.quantity++
              //  this.quantity ++ 
              //  console.log(Number(this.dataList[i].quantity))
              //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)

              this.dataList1.forEach(element => {
                if (element.id === quote.id) {

                  var oldproductprice = this.quoteData.subTotal;
                  element.price = Number(element.price) + Number(this.orgPrice1);
                  this.sum = Number(oldproductprice) + Number(this.orgPrice1);
                  this.quoteData.subTotal = this.sum;
 
                }  
                this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
                this.cdr.markForCheck()
              })
            }
          },
          error => {
            console.log(error);
          });
   
 
     
    // }
    this.cdr.markForCheck();

  }
  async decrementManualProduct(quote) {
    console.log(quote)
    this.isFlagUpdate = 2
    this.isProductManualVal = quote;
    if (quote.quantity <= 0 && quote.quantity == -1) {
      quote.quantity = 1;
      this.sum = 0;
    } else {

      var id = {
        id: quote.id, 

      }
      this.productService.getProductManualByProductID(id)
      .subscribe(
        data => {

          if (data.status == 0) {
            // this.toastr.error(data.message)

          } else {

            this.orgPrice1 = data.result[0].unitPrice;

            quote.quantity--
 
            var oldproductprice = this.quoteData.subTotal;
              this.dataList1.forEach(element => { 
                if (element.id === quote.id) {
                  element.price = Number(element.price) - Number( this.orgPrice1);
                  this.sum = Number(oldproductprice) - Number( this.orgPrice1);
                  this.quoteData.subTotal = this.sum;
                }
              });
              console.log(this.sum);
            
            this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
            this.cdr.markForCheck()
          }
        },
        error => {
          console.log(error);
        });
      
    }
  }
  getCompanyDetails() {

    this.userService.getCompanyDetails()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) { 

          } else {
            var result = data.result[0];
            console.log(result)
            // this.formGroup.controls['disclaimer'].setValue(result.disclaimer);

            // this.JobformGroup.controls['paymentTerms'].setValue(result.paymentTerms);
            this.quoteForm.controls['paymentDetails'].setValue(result.paymentDetails);

            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  
 
  
  // getJobByJobId(id) {
  //   var data = {
  //     id: id
  //   }
  //   this.jobService.getJobByJobId(data)
  //     .subscribe(
  //       data => {
  //         // console.log(data.data.status)
  //         if (data.status == 0) {
  //           // this.toastr.error(data.message)
  //         } else {

  //           this.jobObj = data.result[0];
  //           // console.log(this.jobObj) 

  //           this.cdr.markForCheck()
  //         }
  //       },
  //       error => {
  //         // this.showError(error.statusText);
  //         console.log(error);
  //       });
  // }

  
  generateQuote() {
    var obj = this.quoteData; 
    // obj.email = 'nayanmistry477@gmail.com'
    obj.email = this.quoteData.email
    // obj.items = this.dataList
    obj.items = this.dataList
    obj.items1 = this.dataList1
    obj.totalPrice = this.quoteTotal
    obj.customer = this.quoteData.customer;   
    obj.quotationDate = moment(new Date(this.dates.quotationDate)).format('DD/MMMM/YYYY'); 
    console.log(obj)
    this.isMailSent = true;
    this.emailService.generateQuote(obj)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
            this.cdr.markForCheck();
          }
          else {
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
  getQuoteValues(quote){
   
    var data1 = {
      quoteID: quote.quoteID
    }
    this.quotationService.getProducts_ServiceByQuoteID(data1)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.isLoading$ = false;
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {}
              var list = []
              data.result.forEach(element => {

                if (element.productID == null || element.productID == undefined) {
                  str = { ID: element.id,id:element.serviceID, serviceID: element.serviceID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id,id:element.productID, productID: element.productID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice}

                } 
                  list.push(str)
                

              });
              this.dataList = list;
              console.log(list) 
              
              this.cdr.markForCheck();
            } else {
              this.dataList = []
              this.cdr.markForCheck();
            }
            
            this.productService.getManualProductByQuoteID(data1)
            .subscribe(
              data => {
                // console.log(data.data.status)
                if (data.status == 0) {
                  // this.toastr.error(data.message) 
                  this.isLoading$ = false;
                  this.generateQuote1(quote) 
                } else {
      
                  // this.dataList = data.result
      
                  if (data.result.length > 0) {
                    var str = {};
                    var list = [];
                    data.result.forEach(element => {
      
                  
                        str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.sellPrice,unitPrice:element.unitPrice }
      
                     
                      list.push(str);
                      // console.log(this.dataList)
      
                    });
                    this.dataList1 = list;
                   
                    this.cdr.markForCheck();
                  } else {
                    this.dataList1 = [];
                    this.cdr.markForCheck();
                  }
                  
                  this.generateQuote1(quote) 
                }
              },
              error => {
                // this.showError(error.statusText);
                console.log(error);
              });
             
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
   
       
    
  }
  generateQuote1(quote){
    
 
    // obj.email = 'nayanmistry477@gmail.com'
    // obj.email = this.invoiceData.email
    var obj = quote;
    obj.items = this.dataList
    obj.items1 = this.dataList1 
    obj.totalPrice = quote.subTotal 
    obj.email = quote.email
    obj.quotationDate = moment(new Date( quote.quotationDate)).format('DD/MMMM/YYYY'); 
    this.isMailSent = true;
    console.log(obj)  
    
    this.emailService.generateQuote(quote)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
            this.cdr.markForCheck();
          }
          else {
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
  

  getManualProductByQuoteID(item) {
    var data = {
      quoteID: item
    }
    this.productService.getManualProductByQuoteID(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
            this.dataList1 = []
            this.isLoading$ = false;
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {};
              var list = [];
              data.result.forEach(element => { 
             
                  str = {productID:element.productID,serviceID:element.serviceID, id: element.id,quoteID:element.quoteID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name,quantity: element.quantity, unitPrice:element.unitPrice, price: element.sellPrice } 
                  list.push(str);
                 
                // console.log(this.dataList)

              });
              this.dataList1 = list;
              console.log(list)
              this.cdr.markForCheck();
            } else {
              this.dataList1 = [];
              this.cdr.markForCheck();
            }


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }
  // getManualProductByJobID(item) {
  //   var data = {
  //     jobID: item
  //   }
  //   this.productService.getManualProductByJobID(data)
  //     .subscribe(
  //       data => {
  //         // console.log(data.data.status)
  //         if (data.status == 0) {
  //           // this.toastr.error(data.message)
  //           this.isLoading$ = false;
  //         } else {

  //           // this.dataList = data.result

  //           if (data.result.length > 0) {
  //             var str = {};
  //             var list = [];
  //             data.result.forEach(element => {

             
  //                 str = { id: element.id, jobID: element.jobID, invoiceID: element.invoiceID, name: element.productName,quantity: element.quantity,costPrice:element.costPrice,unitPrice:element.unitPrice, price: element.sellPrice }
 
  //               list.push(str);
  //               // console.log(this.dataList)

  //             });
  //             this.dataList1 = list;
  //             this.cdr.markForCheck();
  //           } else {
  //             this.dataList1 = [];
  //             this.cdr.markForCheck();
  //           }


  //         }
  //       },
  //       error => {
  //         // this.showError(error.statusText);
  //         console.log(error);
  //       });

  // }

  editModal() {
    this.modalService.open(this.openModal);
    this.quoteGroup.reset();
  }
  closeQuoteModal(){
    this.modalService.dismissAll(this.openModal);
    this.quoteGroup.reset();
  }
  getAllCustomers() {
    this.customerService.getAllCustomers()
      .subscribe(
        data => {
          if (data.status == 0) {

            this.customerVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { customerID: element.id, customer: element.firstName + ' ' + element.lastName, customerEmail: element.email, customerContact: element.contactNo, address: element.address }

              list.push(str)
            });

            this.customerVal = list;
            this.filteredCustomerMulti.next(this.customerVal.slice());

            this.customerMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterCustomer()
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


  getAllJobsStatus() {
    this.jobStatusSService.getAllJobStatus()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isLoading$ = false;
          } else {


            // this.jobStatusList = data.result
            var list = []
            data.result.forEach(element => {
              // console.log(element)
              // if(element.statusType != 'pending' && element.statusType !='in progress'){
              list.push(element)
              // } 
            });
            this.jobStatusList = list
            // console.log(this.jobStatusList)

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  } 
 
 
  keyFunc(event) {
  
    setTimeout(() => {
   
      this.quoteTotal = Number(this.quoteData.subTotal) - Number(event.target.value)
      // console.log(this.jobObj.deposit)
      this.quoteForm.controls['totalPrice'].setValue(this.quoteTotal);
      var totalSum = Number(this.quoteTotal) - Number(this.quoteData.deposit);
      this.totalSum = totalSum.toFixed(2) 
      this.quoteData.discount = Number(event.target.value)

      this.cdr.markForCheck()

    }, 1000)
  }
  keyFunc1(event) {
    var discount = 0
    discount = (Number(this.quoteData.subTotal) / 100) * Number(event.target.value);
    setTimeout(() => {
   
      this.quoteTotal = Number(this.quoteData.subTotal) - Number(discount);
      // console.log(this.jobObj.deposit)
      this.quoteForm.controls['totalPrice'].setValue(this.quoteTotal);
      var totalSum = Number(this.quoteTotal) - Number(this.quoteData.deposit);
      this.totalSum = totalSum.toFixed(2) 
      this.quoteData.discount = Number(discount)

      this.cdr.markForCheck()

    }, 1000)
  }
  
  updateQuoteDetails() { 
    var data;
     data = {
        id: this.quoteData.id,  
        quoteTo: this.quoteData.quoteTo, 
        customerContact: this.quoteData.customerContact,
        customerEmail: this.quoteData.customerEmail,
        address: this.quoteData.address,
        quotationDate: this.quoteData.quotationDate, 
        subTotal: this.quoteForm.value.subTotal,
        discount: this.quoteData.discount,
        totalPrice: this.quoteData.totalPrice, 

      }
      if(this.invoiceID != null){
        data.invoiceID = this.invoiceID
      } 
      this.isLoading$ = true;
      // console.log(data)
      this.quotationService.updateQuotation(data)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {   

              if(this.invoiceID !=null ){
                this.router.navigate(['/invoice'])
              }
              this.getProducts_ServiceByQuoteID(this.quoteData.quoteID)
              this.getManualProductByQuoteID(this.quoteData.quoteID);  
              this.toastr.success(data.data.message);
              this.isLoading$ = false;
              this.quotationService.fetch(); 
              this.cdr.markForCheck()
            }
          },
          error => {
            console.log(error);
          });
   
  }
  
  updateRepairDetails() {

    var list = []
    // console.log(this.sum)
    // console.log(this.dataList)
    if(this.dataList.length != 0){  
    var str
    this.dataList.forEach(element => {

      if (element.type != 'service') {
        str = { ID: element.ID, productID: element.id, quoteID: this.quoteData.quoteID,  name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
      } else {
        str = { ID: element.ID, serviceID: element.id, quoteID: this.quoteData.quoteID,  name: element.name, quantity: element.quantity, price: element.price }
      }
      list.push(str);

    });
    this.isLoading$ = true;
    // console.log(list)
    this.quotationService.updateProduct_ServiceFinalQuote(list)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isLoading$ = false;
          } else {
            this.toastr.success(data.data.message);
            this.updateProductManually() 
            this.updateQuoteDetails();
            this.isLoading$ = false;

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }else{
       
        this.updateQuoteDetails();
      }
  }
  updateProductManually() {

    var list = []  
    var str
    this.dataList1.forEach(element => { 
    
        str = { id: element.id, quoteID: this.quoteData.quoteID,  name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
    
      list.push(str);

    });
    this.isLoading$ = true; 
    this.productService.updateProductManually(list)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            // this.toastr.error(data.data.message);
            this.isLoading$ = false;
          } else {
            this.toastr.success(data.data.message);
            this.getManualProductByQuoteID(this.quoteData.quoteID);
            this.quotationService.fetch()
            this.isLoading$ = false;

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
       
  }
  emailSettings:any=[]
  getAllEmailSettings() {

    this.emailService.getAllEmailSettings()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {


          } else {
            var result = data.result[0];
            this.emailSettings = result;
            console.log(result) 
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  isMailSent: boolean = false;
  sendMail() {

    var obj = this.quoteData; 
    obj.username = this.emailSettings.username;
    obj.password = this.emailSettings.password;
    obj.host = this.emailSettings.server;
    obj.isSSL = this.emailSettings.isSSL;
    obj.port = this.emailSettings.port;
    obj.encryptiontype	 = this.emailSettings.encryptiontype;
    // obj.email = 'nayanmistry477@gmail.com'
    obj.email = this.quoteData.customerEmail
    obj.items = this.dataList
    obj.items1 = this.dataList1
    obj.totalPrice = this.quoteTotal
    // console.log(obj)
    this.isMailSent = true;
    this.emailService.sendQuoteMail(obj)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
            this.cdr.markForCheck();
          } else {

            // this.saleQty = data.result[0].saleQty;
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
  getValues(quote){ 
    var data1 = {
      quoteID: quote.quoteID
    }
    this.quotationService.getProducts_ServiceByQuoteID(data1)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.isLoading$ = false;
            this.sendMailIquote(quote) 
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {}
              var list = []
              data.result.forEach(element => {

                if (element.productID == null || element.productID == undefined) {
                  str = { ID: element.id,id:element.serviceID, serviceID: element.serviceID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id,id:element.productID, productID: element.productID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice}

                } 
                  list.push(str)
                

              });
              this.dataList = list;
              console.log(list) 
              this.cdr.markForCheck();
            } else {
              this.dataList = []
              this.cdr.markForCheck();
            }
            this.productService.getManualProductByQuoteID(data1)
            .subscribe(
              data => {
                // console.log(data.data.status)
                if (data.status == 0) {
                  // this.toastr.error(data.message) 
                  this.isLoading$ = false;
                  this.sendMailIquote(quote) 
                } else {
      
                  // this.dataList = data.result
      
                  if (data.result.length > 0) {
                    var str = {};
                    var list = [];
                    data.result.forEach(element => {
      
                  
                        str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.sellPrice,unitPrice:element.unitPrice }
      
                     
                      list.push(str);
                      // console.log(this.dataList)
      
                    });
                    this.dataList1 = list;
                   
                    this.cdr.markForCheck();
                  } else {
                    this.dataList1 = [];
                    this.cdr.markForCheck();
                  }
      
                  this.sendMailIquote(quote) 
                }
              },
              error => {
                // this.showError(error.statusText);
                console.log(error);
              });
              
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
     
   
  }
  sendMailIquote(quote){
 
    var totalPrice = Number(quote.subTotal) - Number(quote.discount) 
    var totalSum = Number(totalPrice) - Number(quote.deposit);
    quote.totalPrice = totalPrice  
    quote.username = this.emailSettings.username;
    quote.password = this.emailSettings.password;
    quote.host = this.emailSettings.server;
    quote.isSSL = this.emailSettings.isSSL;
    quote.port = this.emailSettings.port;
    quote.encryptiontype = this.emailSettings.encryptiontype;
    quote.email = quote.customerEmail;
    // quote.email = 'nayanmistry477@gmail.com' 
    quote.items = this.dataList;
    quote.items1 = this.dataList1;
    console.log(quote)
    this.isMailSent = true;
    this.emailService.sendQuoteMail(quote)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)
            this.isMailSent = false;
            this.cdr.markForCheck();
          } else {
 
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
  filterCustomer() {
    if (!this.customerVal) {
      return;
    }
    // get the search keyword
    let search = this.customerMultiFilterCtrl.value;
    if (!search) {
      this.filteredCustomerMulti.next(this.customerVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCustomerMulti.next(
      this.customerVal.filter(item => item.customer.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.customer.toUpperCase().indexOf(search.toLowerCase()) > -1)
    );
  }
  
 
  selectedCustomer: any = {}
  selectCustomer(val) {
    console.log(val)
    this.selectedCustomer = val;
    this.getJobByCustomerID(val.customerID);
  }
  getJobByCustomerID(id) {

    var data = {
      id: id
    }
    this.jobService.getJobByCustomerID(data)
      .subscribe(
        data => {
          if (data.status == 0) {

            this.jobVal = [];
            this.filteredJobMulti.next(this.jobVal.slice());
            this.cdr.markForCheck()
          } else {
            var list = [];
            data.result.forEach(element => {
              list.push(element)
            });

            this.jobVal = list;
            this.filteredJobMulti.next(this.jobVal.slice());
            this.cdr.markForCheck()
            // this.jobMultiFilterCtrl.valueChanges
            //   .pipe(
            //     takeUntil(this._onDestroy))
            //   .subscribe(() => {
            //     this.searching = false;
            //     this.filterJob()
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
  selectedInvoiceTotal: number = 0;
  selectedTotalSum: number = 0;
  selectedJob: any = {}
  selectJob(val) {
    console.log(val)
    if(val != undefined){
      this.selectedJob = val;
      // if (this.selectedJob.discount == null || this.selectedJob.discount == "" || this.selectedJob.discount == undefined) {
      //   this.selectedJob.discount = 0;
      // }
      // this.selectedInvoiceTotal = Number(this.selectedJob.price) - Number(this.selectedJob.discount)
      // this.selectedTotalSum = Number(this.selectedInvoiceTotal) - Number(this.selectedJob.deposit);
      // console.log(this.selectedTotalSum)
      // console.log(this.selectedJob)
    }else{
      this.selectedJob = {}
    }
   
  }
  isInvoice$:boolean = false;
  isQuote$: boolean = false;
  createQuote() {

    this.quoteGroup.markAllAsTouched();
    if (!this.quoteGroup.valid) {
      return;
    } else {
      var data = { 
        quoteTo: this.selectedCustomer.customer, 
        customerContact: this.selectedCustomer.customerContact,
        customerEmail: this.selectedCustomer.customerEmail,
        address: this.selectedCustomer.address,
        discount: 0,
        subTotal: 0,
        totalPrice:0, 
      }
      
      this.isQuote$ = true;
      console.log(data)
      this.quotationService.createQuotation(data)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isQuote$ = false;
            } else {

              this.toastr.success(data.data.message)
              
              this.editQuote(data.data.result1)
              this.modalService.dismissAll()
              this.isQuote$ = false;
              this.selectedJob = {}
              this.selectedCustomer = {}
              this.quoteGroup.reset();
              // setTimeout(() => { 
              //   this.isQuote$ = false;
              //   this.modalService.dismissAll()
              //   window.location.reload()
              // }, 700)
              this.cdr.markForCheck();
            }
          },
          error => {
            console.log(error);
          });
    }
  }
  closeinvoice() {
    this.modalService.dismissAll();
  }
  openInvoice() {
    this.modalService.open(this.confrimInvoice);
  }
  invoiceID:any = null
  createInvoice() {
    var data = { 
      invoiceTo: this.quoteData.quoteTo,
      quoteID:this.quoteData.quoteID,
      customerContact: this.quoteData.customerContact,
      customerEmail: this.quoteData.customerEmail,
      address: this.quoteData.address,
      contactDetails: this.quoteData.customerContact + ',' + this.quoteData.customerEmail + ',' + this.quoteData.address,
      subTotal: this.quoteData.subTotal, 
      paymentStatus: "pending"
    } 

    this.isInvoice$ = true;
    // console.log(data)
    this.InvoiceService.createInvoice(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isInvoice$ = false;
          } else {
            this.toastr.success(data.data.message)
            this.createRepairDetailsOfInvoice(data.data.result1.invoiceID)
            
            // this.isInvoice$ = false;
            // this.modalService.dismissAll()
           
            // setTimeout(() => {
 
            
            //   window.location.reload()
            // }, 700)

          }
        },
        error => {
          console.log(error);
        });
  }

  list1: any = []
  createRepairDetailsOfInvoice(id) {
    var str = {}
    // this.dataList.forEach(element => {

    //   element.invoiceID = id

    // }); 

    this.dataList.forEach(element => {

      if (element.productID != null) {
        str = { ID: undefined, serviceID: element.serviceID, productID: element.productID,invoiceID:id, jobID: id, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
      } else {
        str = { ID: undefined, serviceID: element.serviceID,invoiceID:id, jobID: id, name: element.name, quantity: element.quantity, price: element.price }
      }
      this.list1.push(str);

    });
 
    console.log(this.list1)
    // alert('done') 
    this.isLoading$ = true;
      this.InvoiceService.createProduct_ServiceFinalInvoice(this.list1)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              // this.toastr.success(data.data.message)
              this.updateProductManuallyInvoice(id) 
              this.dataList = [];
              // this.isLoading$ = false;
              // this.isInvoice$ = false;
              // this.modalService.dismissAll()

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          }); 

  }
  updateProductManuallyInvoice(id) {

    var list = []  
    var str
    this.dataList1.forEach(element => { 
    
        str = { id: element.id, quoteID: this.quoteData.quoteID,invoiceID:id,  name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
    
      list.push(str);

    });
    // this.isLoading$ = true; 
    this.productService.updateProductManually(list)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            // this.toastr.error(data.data.message);
            this.isLoading$ = false; 
            this.invoiceID = id
            this.updateQuoteDetails()
          } else {
            // this.toastr.success(data.data.message);
            // this.getManualProductByQuoteID(this.quoteData.quoteID);
            // this.quotationService.fetch()
            // this.isLoading$ = false;
            this.invoiceID = id
            this.updateQuoteDetails()
            this.isLoading$ = false;
            this.isInvoice$ = false;
            this.modalService.dismissAll()
           
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
       
  }
  getProducts_ServiceByQuoteID(item) {
    var data = {
      quoteID: item
    }
    this.quotationService.getProducts_ServiceByQuoteID(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
            this.isLoading$ = false;
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {}
              var list = []
              data.result.forEach(element => {

                if (element.productID == null || element.productID == undefined) {
                  str = { ID: element.id,id:element.serviceID, serviceID: element.serviceID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id,id:element.productID, productID: element.productID,quoteID:element.quoteID,  invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice}

                }
             
                  list.push(str)
               
           

              });
              this.dataList = list;
              console.log(list)
              this.cdr.markForCheck();
            } else {
              this.dataList = []
              this.cdr.markForCheck();
            }

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }
  filterJob() {
    if (!this.jobVal) {
      return;
    }
    // get the search keyword
    let search = this.jobMultiFilterCtrl.value;
    if (!search) {
      this.filteredJobMulti.next(this.jobVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredJobMulti.next(
      this.jobVal.filter(item => item.id.indexOf(search) > -1)
    );
  }
  sort(column: string) {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'asc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.quotationService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.quotationService.patchState({ paginator });
  }

  searchForm() {
    this.searchGroup = this.fb.group({
      searchTerm: [''],
    });
    const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
      .pipe(
        /*
      The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
      we are limiting the amount of server requests emitted to a maximum of one every 150ms
      */
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val) => this.search(val));
    this.subscriptions.push(searchEvent);
  }
  val: string
  search(searchTerm: string) {
    console.log(searchTerm)
    this.quotationService.patchState({ searchTerm: searchTerm.toLocaleLowerCase() });
  }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.quoteGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.quoteGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.quoteGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.quoteGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  

 
 //ProductManual Form

 isProductManualControlInvalid(controlName: string): boolean {
  const control = this.productManualForm.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

ProductManualcontrolHasError(validation, controlName): boolean {
  const control = this.productManualForm.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isProductManualControlTouched(controlName): boolean {
  const control = this.productManualForm.controls[controlName];
  return control.dirty || control.touched;
}

  isFormControlValid(controlName: string): boolean {
    const control = this.quoteForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isFormControlInvalid(controlName: string): boolean {
    const control = this.quoteForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isFormcontrolHasError(validation, controlName): boolean {
    const control = this.quoteForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isFormControlTouched(controlName): boolean {
    const control = this.quoteForm.controls[controlName];
    return control.dirty || control.touched;
  }

    //Service Form

    isServiceControlValid(controlName: string): boolean {
      const control = this.ServiceformGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }
  
    isServiceControlInvalid(controlName: string): boolean {
      const control = this.ServiceformGroup.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    }
  
    isServicecontrolHasError(validation, controlName): boolean {
      const control = this.ServiceformGroup.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }
  
    isServiceControlTouched(controlName): boolean {
      const control = this.ServiceformGroup.controls[controlName];
      return control.dirty || control.touched;
    }
  
    //Product Form
  
    isProductControlInvalid(controlName: string): boolean {
      const control = this.productGroup.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    }
  
    ProductcontrolHasError(validation, controlName): boolean {
      const control = this.productGroup.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }
  
    isProductControlTouched(controlName): boolean {
      const control = this.productGroup.controls[controlName];
      return control.dirty || control.touched;
    }
}
