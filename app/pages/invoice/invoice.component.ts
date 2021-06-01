import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild,AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
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
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  @ViewChild('openModal') openModal: TemplateRef<any>;
  @ViewChild('openPaymentModal') openPaymentModal: TemplateRef<any>;
  @ViewChild('confrimSalesBox') confrimSalesBox: TemplateRef<any>;
  @ViewChild('serviceopenModal') serviceopenModal: TemplateRef<any>;
  @ViewChild('confrimInvoice') confrimInvoice: TemplateRef<any>;
  @ViewChild('productopenModal') productopenModal: TemplateRef<any>; 
  @ViewChild('manualproductopenModal') manualproductopenModal: TemplateRef<any>; 
  @ViewChild('confrimPayment') confrimPayment: TemplateRef<any>;
  @ViewChild('confrimProductManual') confrimProductManual: TemplateRef<any>;
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
  paymentForm: FormGroup;
  InvoiceForm: FormGroup;
  productGroup: FormGroup;
  productManualForm:FormGroup;
  ServiceformGroup: FormGroup;

  sorting: SortState;
  grouping: GroupingState;
  isLoading$
  isLoading: boolean;
  selectCompany: any = {};
  invoiceGroup: FormGroup;
  public searching: boolean = false;
  invoiceObj: any = {
    customer: '',
    job: ''
  }
  selectedIndex = 0;
  isFlag: number = 1;
  invoiceTotal: number = 0;
  p: number
  invoiceData: any = {};
  jobObj: any = {};
  paymentObj: any = {};
  totalSum: any = 0;
  public dataList = [];
  public dataList1 = [];

  productData: any;
  orgPrice: number = 0
  totalQty: number = 0;
  totalPaid: number;
  private productVal: any[] = [];
  private serviceVal: any[] = [];
  minDate = new Date();

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
    public invoiceService: InvoiceService,
    public jobStatusSService: JobStatusService,
    public jobService: JobService,
    private toastr: ToastrService,
    public productService: ProductService,
    public emailService: EmailSettingsService,
    public userService: UserService,
    public customerService: CustomersService,
    public servicesService: ServicesService,
    public paymentService:PaymentService,
    public quotationService:QuotationService,
    private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.modalService.dismissAll()
    
  
  }
  isShow: boolean = false;
  user: any = {}
  ngOnInit(): void {
    const sb = this.invoiceService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.invoiceService.grouping;
    this.paginator = this.invoiceService.paginator;
    this.sorting = this.invoiceService.sorting;
    this.invoiceService.fetch();
    var token = JSON.parse(localStorage.getItem('token'));
    this.user = token.user;

    this.filteredDisplayMulti.next(this.displayVal.slice());
    this.filteredstatusMulti.next(this.statusVal.slice());

    // this.changeOption('')
    this.searchForm();
    this.getAllProducts();
    this.getAllServices();
    this.getAllJobsStatus();
    this.getCompanyDetails();
    this.getAllCustomers();
    this.getAllEmailSettings();
    this.filteredpaymentTypeMulti.next(this.paymentVal.slice());

    this.paymentTypeMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filterpaymentType()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
    this.DisplayMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filterDisplay()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
    this.statusMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filterStatus()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });

    this.invoiceGroup = this.fb.group({

      job: [this.invoiceObj.job],
      customer: [this.invoiceObj.customer, Validators.compose([Validators.required])]

    })

    this.InvoiceForm = this.fb.group({
      id:[''],
      paymentDetails: [''],
      paymentType:[''],
      price: [''],
      discount: [''],
      totalPrice: [''],
      deposit: [''],
      extraDeposit: [''],
      pendingPrice: [''],
      invoiceDate: [''],
      address:[''],
      customerEmail: ['',Validators.compose([  Validators.email])],
      customerContact: ['',Validators.compose([  Validators.minLength(11), Validators.maxLength(11)])],
      dueDate: [''],
      service: [''],
      product: [''],
      percentage:[''],
      exactAmount:['']
    });
    this.paymentForm = this.fb.group({

      id: [''],
      invoiceId: [''],
      jobId: [''],
      paymentType: [''],
      paymentReference: [''],
      addedBy: [''],
      amount: ['', Validators.compose([Validators.required])],
      dueAmount: ['']

    });

    this.productGroup = this.fb.group({
      productName: ['', Validators.compose([Validators.required,])],
      sellPrice: ['', Validators.compose([Validators.required,])],
      costPrice: [''],
    });
    this.productManualForm = this.fb.group({
      id:[''],
      name: ['', Validators.compose([Validators.required,])],
      sellPrice: ['', Validators.compose([Validators.required,])],
      quantity:['',Validators.compose([Validators.required,])], 
    });
    this.ServiceformGroup = this.fb.group({
      serviceName: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
    });
  }
  backToMain() {
    this.isShow = false;
    // this.getInvoiceByID(  this.invoiceData.id)
    this.jobObj = {};
    this.paymentObj = {};
    this.invoiceData = {};
    this.dataList = [];
    this.dataList1 = [];
    this.paymentList = []
    this.list = {};
    this.listPro = {};
    this.changeOption('')
    this.invoiceService.fetch()
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
  editInvoice(data) {
    // console.log(data)
    this.isShow = true;
    data.dueDate.toString()
    this.invoiceData = data;
    this.dates = data;
    
    if (data.jobId != undefined || data.jobId != null) {
      this.getJobByJobId(data.jobId)
      this.getProducts_ServiceByjobID(data.jobId)
      this.getManualProductByJobID(data.jobId);
      // this.getPaymentById(data.id) 
    } else {

      this.getProducts_ServiceByinvoiceID(data.invoiceID)
      this.getManualProductByInvoiceID(this.invoiceData.invoiceID);
      this.getInvoiceByID(data.id)
      
      this.cdr.markForCheck();
    } 
    // this.getInvoiceByjobID(data.jobId)

  }
  isPercentageBox:boolean = false;
  isAmountBox:boolean = false;
  changeOption(val){
    if(val == 'percentage'){
      this.isAmountBox = false;
      this.isPercentageBox = true;  
      this.invoiceData.exactAmount = 0;
      this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(0)
      // console.log(this.jobObj.deposit)
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = 0;
      this.cdr.markForCheck();
    }if(val == 'exactAmount'){
      this.isPercentageBox = false;
      this.isAmountBox = true;   
      this.invoiceData.percentage = 0;
      this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(0)
      // console.log(this.jobObj.deposit)
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = 0;
     
      this.cdr.markForCheck();
    }if(val == ''){
      this.isPercentageBox = false;
      this.isAmountBox = false;    
      this.invoiceData.percentage = 0;
      this.invoiceData.exactAmount = 0;
      this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(0)
      // console.log(this.jobObj.deposit)
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = 0;
      this.cdr.markForCheck()
    }
    
    console.log(val)
  }
  editProductModal() {
    this.modalService.open(this.productopenModal);
    this.productGroup.reset();
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
              this.jobObj.product = this.productGroup.value.productName;
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
      productObj.invoiceID = this.invoiceData.invoiceID 
      productObj.jobID = this.invoiceData.jobId
      
      this.isLoading$ = true;
      if(this.productManualForm.value.quantity >1){
        productObj.unitPrice = Number(productObj.sellPrice ) / Number( productObj.quantity) 
      }else{
        productObj.unitPrice = productObj.sellPrice
      }
        
     
    
      this.productService.createProductManually(productObj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message) 
              this.InvoiceForm.controls['product'].reset();
              this.sum = Number(this.invoiceData.subTotal) + Number(productObj.sellPrice)
              this.invoiceData.subTotal = this.sum;
               
              this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
              this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
        
              this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
              
              this.productManualForm.reset();
              this.getManualProductByInvoiceID(this.invoiceData.invoiceID);
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
  //     this.dataList1.forEach(element => {
  //       if (element.id == productObj.id) {
  //         var total;
  
  //         if (Number(productObj.sellPrice) >= Number(element.price)) {
  //           this.sum = this.invoiceData.subTotal
  //           var old = this.sum - Number(element.price);
  //           this.sum = Number(old) + Number(productObj.sellPrice);
  //           this.invoiceData.subTotal = this.sum
  
  //         }
  //         if (Number(productObj.sellPrice <= Number(element.price))) {
  //           this.sum = this.invoiceData.subTotal
  //           total = Number(element.price) - Number(productObj.sellPrice)
  //           this.sum = this.sum - total;
  //           this.invoiceData.subTotal = this.sum
  //           // console.log(this.sum)
  //         }
  //         if (element.id == element.id) {
  //           element.price = Number(productObj.sellPrice)
  //           // console.log(element)
  //           // service = element
  //         }
  //       }
  
  //     });
  //     if(this.productManualForm.value.quantity >1){
  //       productObj.unitPrice = Number(productObj.sellPrice ) / Number( productObj.quantity) 
  //     }else{
  //       productObj.unitPrice = productObj.sellPrice
  //     }
  //     // this.InvoiceForm.controls['product'].reset();
  //     // this.sum = Number(this.invoiceData.subTotal) + Number(productObj.sellPrice)
  //     // this.invoiceData.subTotal = this.sum;
       
  //     this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
  //     this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
  //     this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

  //     this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
  //     this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
  //     this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
  //     this.productService.updateProductManually(productObj)
  //       .subscribe(
  //         data => {
  //           if (data.data.status == 0) {
  //             this.toastr.error(data.data.message)
  //             this.isLoading$ = false;
  //           } else {
  //             this.toastr.success(data.data.message)   
  //             this.productManualForm.reset();
  //             this.getManualProductByInvoiceID(this.invoiceData.invoiceID);
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
  updateProductManually() {

    var list = []  
    var str
    this.dataList1.forEach(element => { 
    
        str = { id: element.id, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
    
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
            this.getManualProductByJobID(this.jobObj.id);
            this.jobService.fetch()
            this.isLoading$ = false;
           
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
       
  }
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

      this.sum = Number(this.invoiceData.subTotal) - Number(this.productDeleteVal.price)
      this.invoiceData.totalPrice = this.sum
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceData.totalPrice)
      this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.productService.deleteProductManually(this.productDeleteVal)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.deleteManualProduct = false;
            } else {
              this.toastr.success(data.data.message)   
              this.sum = Number(this.invoiceData.subTotal) - Number(this.productDeleteVal.price)
              this.invoiceData.subTotal= this.sum
              this.InvoiceForm.controls['price'].setValue(this.totalSum)

              this.productManualForm.reset();
              this.updateInvoice('DeleteItem')
              // this.updateQuoteDetails(this.productDeleteVal)
              this.getManualProductByInvoiceID(this.invoiceData.invoiceID);
              this.productManualForm.untouched;
              this.modalService.dismissAll();
              

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
     
  }
  updateQuoteDetails(value) { 

    var data = {
      id: value.id,  
      subTotal: this.invoiceData.subTotal,   
    }
  
    // console.log(data)
    this.quotationService.updateQuotation(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.deleteManualProduct = false;
          } else {      
            this.deleteManualProduct = false;
          }
        },
        error => {
          console.log(error);
        });
 
}

  closedeleteManualProduct(){
    this.modalService.dismissAll(this.manualproductopenModal);
    this.productDeleteVal = {}
  }
  invoiceDetails: any = {}
  public isInvoice: Boolean = false;

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
          this.sum = this.invoiceData.subTotal
          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          this.invoiceData.subTotal = this.sum

        }
        if (Number(newPrice <= Number(item.price))) {
          this.sum = this.invoiceData.subTotal
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
          this.invoiceData.subTotal = this.sum
          // console.log(this.sum)
        }
        if (element.id == item.id) {
          element.price = Number(newPrice)
          // console.log(element)
          // service = element
        }
      }

    });
    this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
    // console.log(this.jobObj.deposit)
    this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
    this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

    this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
    this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
    this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
  }

  async increment(job, i) {
    console.log(job)
    var valData = {
      productID: job.id,
      jobID: job.jobID
    }
    this.productService.getAllPurchaseCountForUpdate(valData)
      .subscribe( async data => {

          if (data.status == 0) {
            this.toastr.error(data.message)

          } else {

            this.productData = data.result[0].product;
            // console.log(data)
            if (data.result) {
              this.totalQty = data.result[0].totalQty;

            } else {
              this.totalQty = 0
            }
            if (this.productData.id == job.id) {
              if (job.quantity >= this.totalQty) {
                this.toastr.error("Product stock gone its limit")
                return
              } else {
      
                job.quantity++
                this.sum = Number(this.sum) + Number(this.productData.sellPrice)
                this.cdr.markForCheck()
              }
              var list = []
              this.dataList.forEach(element => {
      
                var oldproductprice = this.invoiceData.subTotal;
                if (JSON.parse(element.id) === this.productData.id) {
                  element.price = Number(element.price) + Number(this.productData.sellPrice);
                  this.sum = Number(oldproductprice) + Number(this.productData.sellPrice);
                  this.invoiceData.subTotal = this.sum;
                }
              });
              this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
              // console.log(this.jobObj.deposit)
              this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      
              this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
              console.log(this.invoiceData.subTotal);
              this.cdr.markForCheck()
            }
            this.cdr.markForCheck()
          }
        },
        error => {
          console.log(error);
        });

    //     if (this.productData == undefined) {

    //       // return
    //       var id = {
    //         id: job.id
    //       }
    //       var price
    //       this.productService.getProductByProductID(id)
    //         .subscribe(
    //           data => {
    
    //             if (data.status == 0) {
    //               // this.toastr.error(data.message)
    
    //             } else {
    
    //               this.orgPrice = data.result[0].sellPrice;
    
    //               job.quantity++
    //               //  this.quantity ++ 
    //               //  console.log(Number(this.dataList[i].quantity))
    //               //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)
    
    //               this.dataList.forEach(element => {
    //                 if (element.id === job.id) {
    
    //                   var oldproductprice = this.invoiceData.subTotal;
    //                   element.price = Number(element.price) + Number(this.orgPrice);
    //                   this.sum = Number(oldproductprice) + Number(this.orgPrice);
    //                   this.invoiceData.subTotal = this.sum;
    
    
    //                 }
    //                 this.invoiceTotal =Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
    //                 this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
    //                 this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
    
    //                 this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
    //                 this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
    
    //                 this.cdr.markForCheck()
    //               })
    //             }
    //           },
    //           error => {
    //             console.log(error);
    //           });
    //     }
    // else {

     
    // }
    this.cdr.markForCheck();

  }
  async decrement(job) {
    if (job.quantity <= 0 && job.quantity == -1) {
      job.quantity = 1;
      this.sum = 0;
    } else {

      var valData = {
        productID: job.id,
        jobID: job.jobID

      }

      this.productService.getAllPurchaseCountForUpdate(valData)
        .subscribe(
          data => {
            if (data.status == 0) {
              this.toastr.error(data.message)

            } else {
              // console.log(data)
              if (data.result) {
                this.totalQty = data.result[0].totalQty
                this.productData = data.result[0].product
              } else {
                this.totalQty = 0
              }
              job.quantity--


              if (this.productData.id == job.id) {
      
                this.dataList.forEach(element => {
      
                  var oldproductprice = this.invoiceData.subTotal;
                  if (JSON.parse(element.id) === this.productData.id) {
                    element.price = Number(element.price) - Number(this.productData.sellPrice);
                    this.sum = Number(oldproductprice) - Number(this.productData.sellPrice);
                    this.invoiceData.subTotal = this.sum;
                  }
                });
                console.log(this.sum);
              }
              this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
              // console.log(this.jobObj.deposit)
              this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      
              this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
              this.cdr.markForCheck()
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
      // if (this.productData == undefined) {
      //   var id = {
      //     id: job.id
      //   }
      //   var price
      //   this.productService.getProductByProductID(id)
      //     .subscribe(
      //       data => {

      //         if (data.status == 0) {
      //           this.toastr.error(data.message)

      //         } else {
      //           this.orgPrice = data.result[0].sellPrice;

      //           job.quantity--

      //           this.dataList.forEach(element => {
      //             if (element.id === job.id) {

      //               var oldproductprice = this.invoiceData.subTotal;
      //               element.price = Number(element.price) - Number(this.orgPrice);
      //               this.sum = Number(oldproductprice) - Number(this.orgPrice);
      //               this.invoiceData.subTotal = this.sum;
      //             }
      //             this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
      //             // console.log(this.jobObj.deposit)
      //             this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      //             this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

      //             this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      //             this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      //             this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
      //             this.cdr.markForCheck();
      //           })
      //         }
      //       },
      //       error => {
      //         console.log(error);
      //       });
      // }

      // else {
      //   job.quantity--


      //   if (this.productData.id == job.id) {

      //     this.dataList.forEach(element => {

      //       var oldproductprice = this.invoiceData.subTotal;
      //       if (JSON.parse(element.id) === this.productData.id) {
      //         element.price = Number(element.price) - Number(this.productData.sellPrice);
      //         this.sum = Number(oldproductprice) - Number(this.productData.sellPrice);
      //         this.invoiceData.subTotal = this.sum;
      //       }
      //     });
      //     console.log(this.sum);
      //   }
      //   this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
      //   // console.log(this.jobObj.deposit)
      //   this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      //   this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

      //   this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      //   this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      //   this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
      //   this.cdr.markForCheck();

      // }
    }
  }
 //For Manual Product 
 editMode1: any;
 editModeCheck1(i, x, data) {
   if (i == x) {
     this.editMode1 = x;
     console.log(this.editMode1)
     return false;
   }

 }

 priceVal1: string;
 editModeSave1(i, x, item) {
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

  this.dataList1.forEach(element => {
    if (element.id == item.id) {
      var total;

      if (Number(newPrice) >= Number(item.price)) {
        this.sum = this.invoiceData.subTotal
        var old = this.sum - Number(item.price);
        this.sum = Number(old) + Number(newPrice);
        this.invoiceData.subTotal = this.sum

      }
      if (Number(newPrice <= Number(item.price))) {
        this.sum = this.invoiceData.subTotal
        total = Number(item.price) - Number(newPrice)
        this.sum = this.sum - total;
        this.invoiceData.subTotal = this.sum
        // console.log(this.sum)
      }
      if (element.id == item.id) {
        element.price = Number(newPrice)
        // console.log(element)
        // service = element
      }
    }

  });
  this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
  // console.log(this.jobObj.deposit)
  this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
  this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

  this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
  this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
  this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
}
orgPrice1:number = 0;
 async incrementManualProduct(job, i) {
   console.log(job)
    
     // return
     var id = {
       id: job.id
     }
     var price
     this.productService.getProductManualByProductID(id)
       .subscribe(
         data => {

           if (data.status == 0) {
             // this.toastr.error(data.message)

           } else {

             this.orgPrice1 = data.result[0].unitPrice;

             job.quantity++
             //  this.quantity ++ 
             //  console.log(Number(this.dataList[i].quantity))
             //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)

             this.dataList1.forEach(element => {
               if (element.id === job.id) {

                 var oldproductprice =   this.invoiceData.subTotal;
                 element.price = Number(element.price) + Number(this.orgPrice1);
                 this.sum = Number(oldproductprice) + Number(this.orgPrice1);
                 this.invoiceData.subTotal= this.sum;

               }  
               // this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
            
             })
             this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
             this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
             this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
     
             this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
             this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
             this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
             this.cdr.markForCheck()
           }
         },
         error => {
           console.log(error);
         }); 
   // }
   this.cdr.markForCheck();

 }
 async decrementManualProduct(job) {
   console.log(job) 
   if (job.quantity <= 0 && job.quantity == -1) {
     job.quantity = 1;
     this.sum = 0;
   } else {

     var id = {
       id: job.id, 

     }
     this.productService.getProductManualByProductID(id)
     .subscribe(
       data => {

         if (data.status == 0) {
           // this.toastr.error(data.message)

         } else {

           this.orgPrice1 = data.result[0].unitPrice;

           job.quantity--

           var oldproductprice =  this.invoiceData.subTotal
             this.dataList1.forEach(element => { 
               if (element.id === job.id) {
                 element.price = Number(element.price) - Number( this.orgPrice1);
                 this.sum = Number(oldproductprice) - Number( this.orgPrice1);
                 this.invoiceData.subTotal= this.sum;
               }
             }); 
             this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
             this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
             this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
     
             this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
             this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
             this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal); 
           this.cdr.markForCheck()
         }
       },
       error => {
         console.log(error);
       });
     
   }
 }

  deleteVal: any = {}
  editdeleteInvoice(data) {
    console.log(data)
    this.deleteVal = data;
    this.modalService.open(this.confrimInvoice)
  }
  isDelete$: boolean = false;
  deleteInvoice() {
    this.isDelete$ = true;

    this.invoiceService.deleteInvoice(this.deleteVal)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.deleteVal = {};
            this.isDelete$ = false;
            this.modalService.dismissAll()
            this.invoiceService.fetch()
            this.cdr.markForCheck()
          } else {

            this.toastr.success(data.data.message)
             
            this.deleteVal = {};
            this.isDelete$ = false;
            this.modalService.dismissAll()
            this.invoiceService.fetch()
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }

  editPayment(data) {
   console.log(data)
    this.isFlag = 2
    this.paymentObj = data
    this.paymentForm.controls['id'].setValue(data.id)
    this.paymentForm.controls['invoiceId'].setValue(data.invoiceId)
    this.paymentForm.controls['jobId'].setValue(data.jobId) 
    this.paymentForm.controls['paymentReference'].setValue(data.paymentReference)
    this.paymentForm.controls['addedBy'].setValue(data.addedBy)
    this.paymentForm.controls['amount'].setValue(data.amount) 
            
    this.paymentForm.controls['dueAmount'].setValue(data.dueAmount)
    
    this.modalService.open(this.openPaymentModal)
    this.cdr.markForCheck()
  }

 
  updatePayment() {
    this.paymentForm.markAllAsTouched();
    if (!this.paymentForm.valid) {
      return;
    } else {
      var orgAmtVal;
      var obj = this.paymentForm.value;
      if (obj.amount <= 0) {
        this.toastr.error('Please enter valid amount')
      }  var orgAmtVal = this.paymentForm.value.amount;
      if (orgAmtVal > this.paymentObj.amount || orgAmtVal < this.paymentObj.amount) {
        this.toastr.error('Amount cannot be changed')
         
      }else{

     
     
        this.isPayment$ = true;
        obj.invoiceId = this.invoiceData.id;
        obj.jobId = this.jobObj.id;
        obj.addedBy = this.user.firstname + ' ' + this.user.lastname;
        this.payType = obj.paymentType
        var orgAmtVal = this.paymentForm.value.amount;

      // if (orgAmtVal > this.paymentObj.amount) {
      //   var totalDeposit = 0
      //   var extraDeposit = Number(orgAmtVal) - Number(this.paymentObj.amount);   

      //   if( extraDeposit != null ||  extraDeposit != undefined ||  extraDeposit !=0){
      //     totalDeposit = this.invoiceData.deposit + this.invoiceData.discount 
      //     var latestVal = 0;
      //     var extraVal = this.invoiceData.deposit +  extraDeposit;
      //     var olddeposit =  extraVal
      //     this.invoiceData.deposit= extraVal
          
      //     if(this.invoiceData.discount != null || this.invoiceData.discount !="" || this.invoiceData.discount !=undefined){
      //       latestVal = extraVal + this.invoiceData.discount 
      //       this.JobformGroup.controls['deposit'].setValue( olddeposit);
      //       this.JobformGroup.controls['pendingPrice'].setValue(0)
      //       this.invoiceData.pendingPrice = 0
      //       this.JobformGroup.controls['extraDeposit'].setValue(0);
      //     }else{
      //       latestVal = extraVal;
      //     }
        
      //     if(latestVal != this.invoiceData.totalPrice){
         
      //     this.JobformGroup.controls['extraDeposit'].setValue(extraDeposit);
      //     this.JobformGroup.controls['deposit'].setValue( extraVal); 
      //   }else{
      //     this.JobformGroup.controls['deposit'].setValue( olddeposit);
      //     this.JobformGroup.controls['pendingPrice'].setValue(0)
      //     this.invoiceData.pendingPrice = 0
      //     this.JobformGroup.controls['extraDeposit'].setValue(0);
      //   }
      //   }else{
      //     this.invoiceData.deposit= Number(extraVal) - Number(  this.paymentForm.value.amount)
      //     this.JobformGroup.controls['pendingPrice'].setValue(this.invoiceData.deposit);
      //   } 
      // }else{
      //   if(orgAmtVal < this.paymentObj.amount){
      //     var totalDeposit = 0
      //     var latestVal = 0;
        
      //     this.paymentForm.value.amount =  this.paymentObj.amount - orgAmtVal;
      //     this.invoiceData.deposit= this.invoiceData.deposit - this.paymentForm.value.amount
      //     var olddeposit =   this.invoiceData.deposit
      //     if(this.invoiceData.discount != null || this.invoiceData.discount !="" || this.invoiceData.discount !=undefined){
      //       latestVal = this.invoiceData.deposit + this.invoiceData.discount 
      //       this.JobformGroup.controls['deposit'].setValue( olddeposit);
      //       this.JobformGroup.controls['pendingPrice'].setValue(0)
      //       this.invoiceData.pendingPrice = 0
      //       this.JobformGroup.controls['extraDeposit'].setValue(0);
      //     }else{
      //       latestVal = this.invoiceData.deposit;
      //     } 
      //     this.JobformGroup.controls['deposit'].setValue( olddeposit);
      //     if(latestVal != this.invoiceData.totalPrice){
      //       this.JobformGroup.controls['pendingPrice'].setValue(this.paymentForm.value.amount);
      //     }else{
      //       this.JobformGroup.controls['pendingPrice'].setValue(0)
      //       this.JobformGroup.controls['extraDeposit'].setValue(0);
      //       this.invoiceData.pendingPrice = 0
      //     }
         
      //   }else{
      //     this.invoiceData.deposit= this.invoiceData.deposit - this.JobformGroup.value.extraDeposit;
      //     this.JobformGroup.controls['extraDeposit'].setValue(0);
      //     this.JobformGroup.controls['deposit'].setValue( this.invoiceData.deposit); 
      //   } 
      
      // }

    
      // obj.amount = orgAmtVal;
        this.paymentService.updatePayment(obj)
          .subscribe(
            data => {
              // console.log(data.data.status)
              if (data.data.status == 0) {
                this.toastr.error(data.data.message)
                this.isLoading$ = false;
              } else {

                this.toastr.success(data.data.message)

                this.updateInvoice('updatePayment')
                this.isPayment$ = false;
                this.modalService.dismissAll()


              }
            },
            error => {
              // this.showError(error.statusText);
              console.log(error);
            });
       
    }
    }
  }
   
deletePaymentObj:any={}
  editDeletePayment(data) {
    this.deletePaymentObj = data;
    this.modalService.open(this.confrimPayment)
  }
  isDeletePayment$: boolean = false;
  deletePayment() { 
      if(this.InvoiceForm.value.extraDeposit != null || this.InvoiceForm.value.extraDeposit != undefined || this.InvoiceForm.value.extraDeposit !=0){
     
        this.paymentForm.value.amount = this.invoiceData.deposit - this.invoiceData.extraDeposit
        this.InvoiceForm.controls['extraDeposit'].setValue(0);
        this.invoiceData.deposit= Number(this.invoiceData.deposit) - Number( this.deletePaymentObj.amount)
        this.InvoiceForm.controls['pendingPrice'].setValue(this.invoiceData.deposit);
      }else{
        this.invoiceData.deposit= Number(this.invoiceData.deposit) - Number( this.deletePaymentObj.amount)
        this.InvoiceForm.controls['pendingPrice'].setValue(this.invoiceData.deposit);
      } 
    
    this.isDeletePayment$ = true;
    this.paymentService.deletePayment(this.deletePaymentObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isDeletePayment$ = false;
          } else {

            this.toastr.success(data.data.message)
            this.isDeletePayment$ = false;
            this.updateInvoice('DeletePayment')
            this.modalService.dismissAll()
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });


  }
  closedeletePayment() {
    this.deletePaymentObj = {}
    this.modalService.dismissAll();
  }
  closedeleteInvoice() {
    this.deletePaymentObj = {}
    this.modalService.dismissAll();
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
            this.InvoiceForm.controls['paymentDetails'].setValue(result.paymentDetails);

            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
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
    // if (this.deleVal.ID == undefined) {
      // const index = this.dataList.indexOf(this.deleVal, 0);
      // if (index > -1) {
      //   this.dataList.splice(index, 1);
      //   this.isDelete$ = false;
      //   this.modalService.dismissAll()
      //   this.sum = Number(this.invoiceData.subTotal) - Number(this.deleVal.price)
      //   this.invoiceData.subTotal = this.sum
      //   this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
      //   this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      //   this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      //   this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      //   this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      //   this.totalQty = 0
      //   this.cdr.markForCheck()
      // }
    // } else {

      const index = this.dataList.indexOf(this.deleVal, 0);
      if (index > -1) {
        this.dataList.splice(index, 1);
        this.totalQty = 0
      } 

      this.sum = Number(this.invoiceData.subTotal) - Number(this.deleVal.price)
      this.invoiceData.totalPrice = this.sum
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceData.totalPrice)
      this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.isDelete$ = true;
      this.jobService.deleteItem(this.deleVal)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isDelete$ = false;
            } else {

              this.toastr.success(data.data.message)
              this.sum = Number(this.invoiceData.subTotal) - Number(this.deleVal.price)
              this.invoiceData.subTotal= this.sum
              this.InvoiceForm.controls['price'].setValue(this.totalSum)
              this.deleVal = {};
              this.isDelete$ = false;
              this.updateInvoice('DeleteItem')
              this.modalService.dismissAll()
              this.invoiceService.fetch()
              this.cdr.markForCheck()

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    // }

  }
  getJobByJobId(id) {
    var data = {
      id: id
    }
    this.jobService.getJobByJobId(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
          } else {

            this.jobObj = data.result[0];
            // console.log(this.jobObj)

            // if (this.invoiceData.paymentStatus == 'completed') {
            //   this.InvoiceForm.controls['discount'].disable()
            // } else {
            //   this.InvoiceForm.controls['discount'].enable()
            // }

            // this.InvoiceForm.controls['price'].setValue(this.jobObj.price);
            // this.InvoiceForm.controls['discount'].setValue(this.jobObj.discount);

            // if (this.jobObj.discount == null || this.jobObj.discount == "") {
            //   this.jobObj.discount = 0;

            // }
            // this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
            // // console.log(this.jobObj.deposit)
            // this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
            // this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

            // if (this.invoiceData.extraDeposit != null || this.invoiceData.extraDeposit != 0) {
            //   this.InvoiceForm.controls['extraDeposit'].setValue(this.invoiceData.extraDeposit);
            //   var totalOrg = Number(this.totalSum) - Number(this.invoiceData.extraDeposit)
            //   if (this.totalSum < 0) {
            //     this.InvoiceForm.controls['pendingPrice'].setValue(0);
            //     this.cdr.markForCheck()
            //   } else {
            //     this.InvoiceForm.controls['pendingPrice'].setValue(totalOrg);
            //     this.paymentForm.controls['dueAmount'].setValue(totalOrg);
            //     this.cdr.markForCheck()
            //   }

            // } else {
            //   this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
            //   this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
            //   this.cdr.markForCheck()
            // }
            // this.InvoiceForm.controls['price'].setValue(this.invoiceData.totalPrice);
            // this.sum = this.invoiceData.totalPrice;
            // this.getPaymentById(this.jobObj.id)
            this.getInvoiceByID(this.invoiceData.id)

            this.cdr.markForCheck()
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  getInvoiceByID(id) {
    var val = {
      id: id
    }
    this.invoiceService.getInvoiceByID(val)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.isInvoice = false;
            this.cdr.markForCheck()
          } else {

            this.invoiceData = data.result[0];
            this.cdr.markForCheck()
            this.getPaymentById(this.invoiceData.id)
            this.InvoiceForm.controls['price'].setValue(this.invoiceData.subTotal);
            
            // console.log(this.invoiceData)
            this.isInvoice = true;
            if (this.invoiceData.discount == null || this.invoiceData.discount == "") {
              this.invoiceData.discount = 0;
            }

            this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
            this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal); 
            this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
            this.sum = this.invoiceData.totalPrice;

            // if (this.invoiceData.paymentStatus == 'completed') {
            //   this.InvoiceForm.controls['discount'].disable()
            //   this.cdr.markForCheck()
            // } else {
            //   this.InvoiceForm.controls['discount'].enable()
            //   this.cdr.markForCheck()
            // }

            if (this.invoiceData.extraDeposit != null || this.invoiceData.extraDeposit != 0) {
              this.InvoiceForm.controls['extraDeposit'].setValue(this.invoiceData.extraDeposit);
              var totalOrg = Number(this.totalSum) - Number(this.invoiceData.extraDeposit)

              if (this.totalSum < 0) {
                this.InvoiceForm.controls['pendingPrice'].setValue(0);
                this.cdr.markForCheck()
              } else {
                this.InvoiceForm.controls['pendingPrice'].setValue(totalOrg);
                this.paymentForm.controls['dueAmount'].setValue(totalOrg);
                this.cdr.markForCheck()
              }
            } else {
              this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.cdr.markForCheck()
            }

            // this.cdr.markForCheck()
          }

        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  generateInvoice() {
    var obj = this.invoiceData;
    obj.duePrice = this.totalSum;
    // obj.email = 'nayanmistry477@gmail.com'
    obj.email = this.invoiceData.email
    obj.items = this.dataList
    obj.items1 = this.dataList1
    obj.totalPrice = this.invoiceTotal
    obj.customer = this.invoiceData.customer;
    obj.paymentType = this.invoiceData.paymentType;
    obj.paymentDetails = this.InvoiceForm.value.paymentDetails;
    obj.DueDate = moment(new Date(this.dates.dueDate)).format('DD/MMMM/YYYY');
    obj.InvoiceDate = moment(new Date(this.dates.invoiceDate)).format('DD/MMMM/YYYY');
    obj.ItemType = this.jobObj.itemType
    obj.Brand = this.jobObj.brand;
    obj.SerialNo = this.jobObj.serialNo
    obj.repairDescription = this.jobObj.repairDescription
    console.log(obj)
    this.isMailSent = true;
    this.emailService.generateInvoice(obj)
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
  getInvoiceValues(invoice){
    if (invoice.jobId != undefined || invoice.jobId != null) {
      // this.getJobByJobId(invoice.jobId)
      var val = {
        id: invoice.jobId
      }
      this.jobService.getJobByJobId(val)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.status == 0) {
              // this.toastr.error(data.message)
            } else {
  
              this.jobObj = data.result[0];
              var data1 = {
                jobID: invoice.jobId
              }
              this.servicesService.getProducts_ServiceByjobID(data1)
                .subscribe(
                  data => {
                    // console.log(data.data.status)
                    if (data.status == 0) {
                      // this.toastr.error(data.message)
                      this.dataList = [];
                      this.isLoading$ = false;
                      this.productService.getManualProductByJobID(val)
                      .subscribe(
                        data => {
                          // console.log(data.data.status)
                          if (data.status == 0) {
                            // this.toastr.error(data.message)
                            this.generateInvoice1(invoice)
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
                              this.cdr.markForCheck();
                            } else {
                              this.dataList1 = [];
                              this.cdr.markForCheck();
                            } 
                            this.generateInvoice1(invoice)
                          }
                        },
                        error => {
                          // this.showError(error.statusText);
                          console.log(error);
                        });
                    } else {
          
                      // this.dataList = data.result
          
                      if (data.result.length > 0) {
                        var str = {};
                        var list = [];
                        data.result.forEach(element => {
          
                          if (element.productID == null && element.productID == undefined) {
                            str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }
          
                          } else {
                            str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
          
                          }
                          list.push(str);
                          // console.log(this.dataList)
          
                        });
                        this.dataList = list;
                       
                        this.cdr.markForCheck();
                      } else {
                        this.dataList = [];
                        this.cdr.markForCheck();
                      }
          
                      this.productService.getManualProductByJobID(val)
                      .subscribe(
                        data => {
                          // console.log(data.data.status)
                          if (data.status == 0) {
                            // this.toastr.error(data.message)
                            this.generateInvoice1(invoice)
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
                              this.cdr.markForCheck();
                            } else {
                              this.dataList1 = [];
                              this.cdr.markForCheck();
                            } 
                            this.generateInvoice1(invoice)
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
  
              this.cdr.markForCheck()
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          }); 
          
      // this.getPaymentById(data.id) 
    } else {
 
      var data2 = {
        invoiceID: invoice.invoiceID
      }
      this.invoiceService.getProducts_ServiceByinvoiceID(data2)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.status == 0) {
              // this.toastr.error(data.message)
              this.productService.getManualProductByInvoiceID(data2)
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
                      this.cdr.markForCheck();
                    } else {
                      this.dataList1 = [];
                      this.cdr.markForCheck();
                    }
        
                    this.generateInvoice1(invoice)
                  }
                },
                error => {
                  // this.showError(error.statusText);
                  console.log(error);
                });
              this.isLoading$ = false;
            } else {
  
              // this.dataList = data.result
  
              if (data.result.length > 0) {
                var str = {};
                var list = [];
                data.result.forEach(element => {
  
                  if (element.productID == null && element.productID == undefined) {
                    str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }
  
                  } else {
                    str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice }
  
                  }
                  list.push(str);
                  // console.log(this.dataList)
  
                });
                this.dataList = list;
                
                this.cdr.markForCheck();
              } else {
                this.dataList = [];
                this.cdr.markForCheck();
              }
              this.productService.getManualProductByInvoiceID(data2)
              .subscribe(
                data => {
                  // console.log(data.data.status)
                  if (data.status == 0) {
                    // this.toastr.error(data.message)
                    this.dataList1 = []
                    this.isLoading$ = false;
                    this.generateInvoice1(invoice)
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
                      this.cdr.markForCheck();
                    } else {
                      this.dataList1 = [];
                      this.cdr.markForCheck();
                    }
        
                    this.generateInvoice1(invoice)
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
      this.cdr.markForCheck();
    }
  }
  generateInvoice1(invoice){
    console.log(invoice)
    invoice.dueDate.toString()
    var dueDate = invoice.dueDate 
    var totalPrice = Number(invoice.subTotal) - Number(invoice.discount) 
    var totalSum = Number(totalPrice) - Number(invoice.deposit);
    invoice.totalPrice = totalPrice 
    invoice.duePrice =  totalSum; 
    
    // obj.email = 'nayanmistry477@gmail.com'
    // obj.email = this.invoiceData.email
    invoice.paymentDetails = this.InvoiceForm.value.paymentDetails;
    invoice.items = this.dataList  
    invoice.items1 = this.dataList1
    invoice.DueDate = moment(new Date( dueDate)).format('DD/MMMM/YYYY');
    invoice.InvoiceDate = moment(new Date( invoice.invoiceDate)).format('DD/MMMM/YYYY');
    invoice.ItemType = this.jobObj.itemType
    invoice.Brand = this.jobObj.brand;
    invoice.SerialNo = this.jobObj.serialNo
    invoice.repairDescription = this.jobObj.repairDescription
    this.isMailSent = true;
    this.emailService.generateInvoice(invoice)
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
 
  getProducts_ServiceByinvoiceID(item) {
    var data = {
      invoiceID: item
    }
    this.invoiceService.getProducts_ServiceByinvoiceID(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
            this.isLoading$ = false;
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {};
              var list = [];
              data.result.forEach(element => {

                if (element.productID == null && element.productID == undefined) {
                  str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice }

                }
                if( element.productID !=null || element.serviceID != null){
                  list.push(str)
                }
                // console.log(this.dataList)

              });
              this.dataList = list;
              this.cdr.markForCheck();
            } else {
              this.dataList = [];
              this.cdr.markForCheck();
            }


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }
  getProducts_ServiceByjobID(item) {
    var data = {
      jobID: item
    }
    this.servicesService.getProducts_ServiceByjobID(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
            this.isLoading$ = false;
          } else {

            // this.dataList = data.result

            if (data.result.length > 0) {
              var str = {};
              var list = [];
              data.result.forEach(element => {

                if (element.productID == null && element.productID == undefined) {
                  str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }

                }
                if( element.productID !=null || element.serviceID != null){
                  list.push(str)
                }
                // console.log(this.dataList)

              });
              this.dataList = list;
              this.cdr.markForCheck();
            } else {
              this.dataList = [];
              this.cdr.markForCheck();
            }


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }

  getManualProductByInvoiceID(item) {
    var data = {
      invoiceID: item
    }
    this.productService.getManualProductByInvoiceID(data)
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
  getManualProductByJobID(item) {
    var data = {
      jobID: item
    }
    this.productService.getManualProductByJobID(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
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
              this.cdr.markForCheck();
            } else {
              this.dataList1 = [];
              this.cdr.markForCheck();
            }
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }
  editModal() {
    this.modalService.open(this.openModal);
    this.invoiceGroup.reset();
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
  editPaymentModal() {
    this.isFlag = 1;
    this.modalService.open(this.openPaymentModal)
    this.cdr.detectChanges();
  } 
  payType:any = null;
  isPayment$: boolean = false;
  addPayment() {

    this.paymentForm.markAllAsTouched();
    if (!this.paymentForm.valid) {
      return;
    } else {
      var orgAmtVal;
      var obj = this.paymentForm.value;
      if (obj.amount <= 0) {
        this.toastr.error('Please enter valid amount')
      } else {
        if (obj.amount > this.totalSum) {
          this.toastr.error('Please enter due amount')
          return
          // this.isPayment$ = true;
          // obj.invoiceId = this.invoiceData.id;
          // obj.jobId = this.jobObj.id;
          // obj.addedBy = this.user.firstname + ' ' + this.user.lastname;
          // var orgPaymentAmt = obj.amount
          // var extraDeposit = Number(obj.amount) - Number(this.totalSum);
          // orgAmtVal = this.totalSum;
          // this.paymentForm.value.amount = this.paymentForm.value.amount + this.invoiceData.deposit
          // this.InvoiceForm.controls['deposit'].setValue(this.paymentForm.value.amount);
          // this.InvoiceForm.controls['extraDeposit'].setValue(extraDeposit);
          // this.InvoiceForm.controls['pendingPrice'].setValue(0);

          // obj.amount = orgPaymentAmt


          // this.invoiceService.createPayment(obj)
          //   .subscribe(
          //     data => {
          //       // console.log(data.data.status)
          //       if (data.data.status == 0) {
          //         this.toastr.error(data.data.message)
          //         this.isLoading$ = false;
          //       } else {

          //         this.toastr.success(data.data.message)

          //         this.updateInvoice('createPayment')
          //         this.isPayment$ = false;
          //         this.modalService.dismissAll()


          //       }
          //     },
          //     error => {
          //       // this.showError(error.statusText);
          //       console.log(error);
          //     });
        } else {


          this.isPayment$ = true;

          obj.invoiceId = this.invoiceData.id;
          obj.jobId = this.jobObj.id;
          obj.addedBy = this.user.firstname + ' ' + this.user.lastname;
          // console.log(obj) 
          this.payType = obj.paymentType 
          orgAmtVal = this.paymentForm.value.amount
          this.paymentForm.value.amount = this.paymentForm.value.amount + this.invoiceData.deposit
          this.InvoiceForm.controls['deposit'].setValue(this.paymentForm.value.amount);


          obj.amount = orgAmtVal 
          this.paymentService.createPayment(obj)
            .subscribe(
              data => {
                // console.log(data.data.status)
                if (data.data.status == 0) {
                  this.toastr.error(data.data.message)
                  this.isLoading$ = false;
                } else {

                  this.toastr.success(data.data.message)
                  this.updateInvoice('createPayment')
                  this.isPayment$ = false;
                  this.modalService.dismissAll()


                }
              },
              error => {
                // this.showError(error.statusText);
                console.log(error);
              });
        }
      }
    }
  }

  updateInvoice(val) {
    if (this.jobObj.id != undefined) {


      var data = {
        id: this.invoiceData.id,
        jobId: this.jobObj.id,
        invoiceTo: this.invoiceData.invoiceTo,
        paymentType: this.payType,
        paymentDetails: this.InvoiceForm.value.paymentDetails,
        customerContact: this.invoiceData.customerContact,
        customerEmail: this.invoiceData.customerEmail,
        address: this.invoiceData.address,
        contactDetails: this.invoiceData.customerContact + ',' + this.invoiceData.email + ',' + this.invoiceData.address,
        invoiceDate: this.InvoiceForm.value.invoiceDate,
        dueDate: this.InvoiceForm.value.dueDate,
        subTotal: this.invoiceData.subTotal,
        discount: this.invoiceData.discount,
        totalPrice: this.invoiceData.totalPrice,
        deposit: this.invoiceData.deposit,
        paymentStatus: "",
        extraDeposit: this.InvoiceForm.value.extraDeposit

      }

  
      if (data.extraDeposit == "" || data.extraDeposit == null || data.extraDeposit == undefined || data.extraDeposit == 0) {
        if(this.invoiceData.pendingPrice != 0){
          this.totalPaid = Number(this.paymentForm.value.amount) - Number(this.InvoiceForm.value.pendingPrice)
        }else{
          
        this.totalPaid = 0
        }
        
      } else {


        this.totalPaid = 0
      }

      if (val == 'createPayment') {
        if (this.totalPaid == 0) {
          data.paymentStatus = 'completed'
        } else {
          data.paymentStatus = 'pending'
        }
      } else {
        if(val == 'DeletePayment'){
          data.paymentStatus = 'pending'
        }else{
          if (this.totalPaid == 0) {
            data.paymentStatus = 'completed'
          } else {
            data.paymentStatus = 'pending'
          }
        }
      
      }

      if(val == 'updatePayment'){
        data.paymentStatus = 'completed'
      } 

      this.isLoading$ = true;
      // console.log(data)
      this.invoiceService.updateInvoice(data)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {

              if (val != 1) {
                if (val == 'updateRepair') {
                  this.updateJob('updateRepair')
                } else {
                  this.updateJob('Invoice')
                  this.paymentForm.reset()
                  this.paymentObj = {}
                  this.isLoading$ = false;
                }

              } else {
                this.toastr.success(data.data.message);
                // this.invoiceService.fetch();
                this.updateJob('Invoice');
                this.isLoading$ = false;

              }
              // this.getInvoiceByjobID(this.jobObj.id);


            }
          },
          error => {
            console.log(error);
          });
    } else {
      this.updateInvoice1(val)
    }
  }

  updateInvoice1(val) {

    var data = {
      id: this.invoiceData.id,
      invoiceTo: this.invoiceData.invoiceTo,
      paymentDetails: this.InvoiceForm.value.paymentDetails,
      paymentType: this.payType,
      customerContact: this.invoiceData.customerContact,
      customerEmail: this.invoiceData.customerEmail,
      address: this.invoiceData.address,
      contactDetails: this.invoiceData.customerContact + ',' + this.invoiceData.email + ',' + this.invoiceData.address,
      invoiceDate: this.InvoiceForm.value.invoiceDate,
      dueDate: this.InvoiceForm.value.dueDate,
      subTotal: this.invoiceData.subTotal,
      discount: this.invoiceData.discount,
      totalPrice: this.invoiceData.totalPrice,
      deposit: this.invoiceData.deposit,
      paymentStatus: "",
      extraDeposit: this.InvoiceForm.value.extraDeposit

    }
    
    if( val != 'updatePayment'){

    
    if (this.InvoiceForm.value.pendingPrice != "" && this.InvoiceForm.value.pendingPrice != null && this.InvoiceForm.value.pendingPrice != 0 ) {
  
        if(this.paymentForm.value.amount == null && this.paymentForm.value.amount == ""){
          this.totalPaid = 0
        }else{
          this.totalPaid = Number(this.paymentForm.value.amount) - Number(this.InvoiceForm.value.pendingPrice)
       
        }
  
       

      if (this.totalPaid == 0) {
        data.paymentStatus = 'completed'
      } else {
        data.paymentStatus = 'pending'
      }
    } else {
      if(this.invoiceData.paymentStatus == 'completed'){
        data.paymentStatus = 'completed'
      }else{
        data.paymentStatus = 'pending'
      }
     
    }
  }else{
    data.paymentStatus = 'completed'
  }

  

    this.isLoading$ = true;
    // console.log(data)
    this.invoiceService.updateInvoice(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isLoading$ = false;
          } else {  
            // this.invoiceService.fetch();
            // this.updateJob('Invoice');

            if (val != 1) {
              if (val == 'updateRepair') {
                // setTimeout(() => {
                //   window.location.reload()
                //   this.selectedIndex = 1;
                // }, 500)
                this.getProducts_ServiceByinvoiceID(this.invoiceData.id)
                this.getInvoiceByID(this.invoiceData.id)
                this.invoiceService.fetch()
              } else {
                this.paymentForm.reset()
                this.paymentObj = {}
                this.getInvoiceByID(this.invoiceData.id)
                this.invoiceService.fetch()
                
                // setTimeout(() => {
                //   window.location.reload()
                //   this.selectedIndex = 1;
                // }, 500)
                this.isLoading$ = false; 
              }

            } else {
              this.toastr.success(data.data.message);
              this.isLoading$ = false;
            //    setTimeout(() => {
            //   window.location.reload()
            //   this.selectedIndex = 1;
            // }, 500) 
            this.getInvoiceByID(this.invoiceData.id)
              this.invoiceService.fetch()
            
            }
          
            // this.getInvoiceByjobID(this.jobObj.id);


          }
        },
        error => {
          console.log(error);
        });
  }

  public paymentList = [];
  getPaymentById(id) {
    var val = {
      id: id
    }
    this.paymentService.getPaymentById(val)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.paymentList = data.result 
          } else {
            this.paymentList = data.result
            // console.log(this.paymentList)
          }
          this.cdr.markForCheck();
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
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
              this.jobObj.service = this.ServiceformGroup.value.serviceName;
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

  listPro: any = {}
  selectProduct(val) {
    console.log(val)
    this.list = {}
    var data = {}

    data = val;
    this.listPro = this.productVal.filter(x => x.product == val)[0];
    // console.log(this.list)

    var valData = {
      productID: this.listPro.id
    }
    this.productService.getAllPurchaseCount(valData)
      .subscribe(
        data => {
          if (data.status == 0) {
            this.toastr.error(data.message)

          } else {
            // console.log(data)
            if (data.result) {
              this.totalQty = data.result[0].totalQty;
              console.log(data.result[0].totalQty)
            } else {
              this.totalQty = 0
            }
            this.cdr.markForCheck()
            console.log(data.result)
            // this.saleQty = data.result[0].saleQty;


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
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

        this.InvoiceForm.controls['service'].reset();
        this.sum = Number(this.invoiceData.subTotal) + Number(this.list.price)
        this.invoiceData.subTotal = this.sum;
        this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
        // console.log(this.jobObj.deposit)
        this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
        this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

        this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
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
                  this.sum = Number(this.invoiceData.subTotal) + Number(this.servicePrice);
                  this.invoiceData.subTotal = this.sum;
                  this.dataList.forEach(element => {
                    if (element.id === result.id) {
                      element.price = Number(element.price) + Number(this.servicePrice);

                    }
                  });
                  this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
                  // console.log(this.jobObj.deposit)
                  this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
                  this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

                  this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
                  this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
                  // this.dataList.push(data)
                  this.InvoiceForm.controls['service'].reset();
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
          this.InvoiceForm.controls['service'].reset();
          this.sum = Number(this.invoiceData.subTotal) + Number(this.list.price)  
          this.invoiceData.subTotal = this.sum;
          this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
          // console.log(this.jobObj.deposit)
          this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
          this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

          this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
          this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
          this.cdr.markForCheck();
          this.list = []


        }
      }

      this.cdr.markForCheck()
    } else {
      this.toastr.error('Please Select Service')

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
        this.InvoiceForm.controls['product'].reset();
        this.sum = Number(this.invoiceData.subTotal) + Number(this.listPro.price)
        this.invoiceData.subTotal = this.sum;
        this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
        this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
        this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

        this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
        this.listPro = []
        this.cdr.markForCheck()
      } else {

        var result = this.dataList.filter(res => res.name == this.listPro.product)[0];
        if (result != null) {

          if (result.quantity >= this.totalQty ) {
            this.toastr.error("Product stock gone its limit")
          } else {

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
                    this.sum = Number(this.invoiceData.subTotal) + Number(this.proOrgPrice);
                    this.invoiceData.subTotal = this.sum;
                    this.dataList.forEach(element => {
                      if (element.id === result.id) {
                        element.price = Number(element.price) + Number(this.proOrgPrice);

                      }
                    });
                    this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount)
                    // console.log(this.jobObj.deposit)
                    this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
                    this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
  
                    this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
                    this.paymentForm.controls['dueAmount'].setValue(this.totalSum); 
                    this.InvoiceForm.controls['product'].reset(); 
                    result = [];
                    this.listPro = [];
                    this.cdr.markForCheck();
                  }

                },
                error => {
                  console.log(error);
                });
          }
        }

        else {
         
            this.dataList.push(data)
            this.InvoiceForm.controls['product'].reset(); 
            this.sum = Number(this.invoiceData.subTotal) + Number(this.listPro.price)  
            this.invoiceData.subTotal = this.sum;
            this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(this.invoiceData.discount) 
            this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
            this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
  
            this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
            this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
            this.cdr.markForCheck();
            this.listPro = []
           
          this.cdr.markForCheck();
        }

      }
    } else {
      this.toastr.error('Please Select Product')
    }
  }
  keyFunc(event) {
  
    setTimeout(() => {
   
      this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(event.target.value)
      // console.log(this.jobObj.deposit)
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = Number(event.target.value)

      this.cdr.markForCheck()

    }, 1000)
  }
  keyFunc1(event) {
    var discount = 0
    discount = (Number(this.invoiceData.subTotal) / 100) * Number(event.target.value);
    setTimeout(() => {
   
      this.invoiceTotal = Number(this.invoiceData.subTotal) - Number(discount);
      // console.log(this.jobObj.deposit)
      this.InvoiceForm.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.InvoiceForm.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = Number(discount)

      this.cdr.markForCheck()

    }, 1000)
  }
  updateRepairDetails() {

    if(this.dataList.length != 0){
      
    
    var list = [];

    var str;
    this.dataList.forEach(element => {

      if (element.type != 'service') {
        str = { ID: element.ID, productID: element.id, jobID: this.jobObj.id, invoiceID: this.invoiceData.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice }
      } else {
        str = { ID: element.ID, serviceID: element.id, jobID: this.jobObj.id, invoiceID: this.invoiceData.invoiceID, name: element.name, quantity: element.quantity, price: element.price }
      }
      list.push(str);

    });
    this.isLoading$ = true;
    if (this.jobObj.id != null || this.jobObj.id != undefined) {
      this.servicesService.updateProduct_ServiceFinal(list)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
            } else {
              this.toastr.success(data.data.message);
              this.InvoiceForm.controls['product'].reset();
              this.InvoiceForm.controls['service'].reset();
              this.updateInvoice('updateRepair')
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    } else {
      this.invoiceService.updateProduct_ServiceFinalInvoice(list)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
            } else {
              this.toastr.success(data.data.message);
              this.updateInvoice1('updateRepair')
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }else{
    
      this.updateInvoice1('updateRepair')
  }

  }

  updateJob(v) {
    // this.isLoading$ = true

    // this.JobformGroup.markAllAsTouched();
    // if (!this.JobformGroup.valid) {
    //   return;
    // } else {
    this.isLoading$ = true;

    var setval;
    setval = this.jobObj.accompanying.toString().replace("[", "").replace("]", "");
    var getval = setval.toString()
    this.jobObj.accompanying = getval
    if (this.jobObj.underWarranty == false) {
      this.jobObj.underWarranty = ""
    } else {
      this.jobObj.underWarranty = "true"
    }
    if(this.jobObj.estDate == null){
      this.jobObj.estDate = ""
    }
    this.jobObj.price = this.invoiceData.subTotal;
    this.jobObj.discount = this.invoiceData.discount;
    this.jobObj.deposit = this.invoiceData.deposit
    console.log(this.jobObj)
    // console.log(this.sum)

    this.jobService.updateJobService(this.jobObj)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isLoading$ = false;
          } else {

            if (v != 1) {
              if (v == 'updateRepair') {
                // setTimeout(() => {
                //   window.location.reload()
                //   this.selectedIndex = 1;
                // }, 500)
                this.updateProductManually()
                this.getProducts_ServiceByjobID(this.jobObj.id)
                // this.invoiceService.fetch();
              }
              this.getJobByJobId(this.jobObj.id)
              this.invoiceService.fetch();
              this.isLoading$ = false;
           
              // setTimeout(() => {
              //   window.location.reload()
              //   this.selectedIndex = 1;
              // }, 500)
              // this.cdr.markForCheck();
              // setTimeout(() => {
              //   window.location.reload()
              // }, 700)
            } else {
              this.toastr.success(data.data.message);
              this.getJobByJobId(this.jobObj.id)
              this.invoiceService.fetch();
              this.isLoading$ = false;
              // this.cdr.markForCheck();
              // setTimeout(() => {
              //   window.location.reload()
              //   this.selectedIndex = 1;
              // }, 500)
             
              // setTimeout(() => {
              //   window.location.reload()
              // }, 700)
            }


            // this.uploadAttachment(data.data.result1.id);

            // window.location.reload()  


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    // }
  }
  selectpaymentType(val) {

  }
  closeModal() {
    this.modalService.dismissAll();
    // this.invoiceGroup.markAsUntouched()
    this.paymentObj = {};
    this.paymentForm.controls['amount'].reset();
    this.paymentForm.controls['paymentType'].reset();
    this.paymentForm.controls['paymentReference'].reset();

  }
  selectDisplayName(val) {
    console.log(val)
    console.log(this.selectCompany)
  }
  selectStatus(val) {
    console.log(val)
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

    var obj = this.invoiceData;
    obj.duePrice = this.totalSum;
    obj.username = this.emailSettings.username;
    obj.password = this.emailSettings.password;
    obj.host = this.emailSettings.server;
    obj.isSSL = this.emailSettings.isSSL;
    obj.port = this.emailSettings.port;
    obj.encryptiontype	 = this.emailSettings.encryptiontype;
    // obj.email = 'nayanmistry477@gmail.com'
    obj.email = this.invoiceData.customerEmail
    obj.items = this.dataList
    obj.items1 = this.dataList1
    obj.totalPrice = this.invoiceTotal
    console.log(obj)
    this.isMailSent = true;
    this.emailService.sendMail(obj)
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
  getValues(invoice){
    if (invoice.jobId != undefined || invoice.jobId != null) { 
      // this.getProducts_ServiceByjobID(invoice.jobId)
      var val = {
        jobID: invoice.jobId
      }
      this.servicesService.getProducts_ServiceByjobID(val)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.status == 0) {
              // this.toastr.error(data.message)
              this.isLoading$ = false;
            } else {
  
              // this.dataList = data.result
  
              if (data.result.length > 0) {
                var str = {};
                var list = [];
                data.result.forEach(element => {
  
                  if (element.productID == null && element.productID == undefined) {
                    str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }
  
                  } else {
                    str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
  
                  }
                  list.push(str);
                  // console.log(this.dataList)
  
                });
                this.dataList = list;
               
                this.cdr.markForCheck();
              } else {
                this.dataList = [];
                this.cdr.markForCheck();
              }
              this.productService.getManualProductByJobID(val)
              .subscribe(
                data => {
                  // console.log(data.data.status)
                  if (data.status == 0) {
                    // this.toastr.error(data.message)
                    this.sendMailInvoice(invoice)
                    this.dataList1 = [];
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
                      this.cdr.markForCheck();
                    } else {
                      this.dataList1 = [];
                      this.cdr.markForCheck();
                    } 
                    this.sendMailInvoice(invoice)
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
          
      // this.getPaymentById(data.id) 
    } else {

      this.getProducts_ServiceByinvoiceID(invoice.invoiceID) 
      var val1 = {
        invoiceID: invoice.invoiceID
      }
      this.invoiceService.getProducts_ServiceByinvoiceID(val1)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.status == 0) {
              // this.toastr.error(data.message)
              this.isLoading$ = false;
            } else {
  
              // this.dataList = data.result
  
              if (data.result.length > 0) {
                var str = {};
                var list = [];
                data.result.forEach(element => {
  
                  if (element.productID == null && element.productID == undefined) {
                    str = { ID: element.id, id: element.serviceID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }
  
                  } else {
                    str = { ID: element.id, id: element.productID, jobID: element.jobID, invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice }
  
                  }
                  list.push(str);
                  // console.log(this.dataList)
  
                });
                this.dataList = list;
                
                this.cdr.markForCheck();
              } else {
                this.dataList = [];
                this.cdr.markForCheck();
              }
              this.productService.getManualProductByInvoiceID(val1)
              .subscribe(
                data => {
                  // console.log(data.data.status)
                  if (data.status == 0) {
                    // this.toastr.error(data.message)
                    this.sendMailInvoice(invoice)
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
                      this.cdr.markForCheck();
                    } else {
                      this.dataList1 = [];
                      this.cdr.markForCheck();
                    }
        
                    this.sendMailInvoice(invoice)
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
   
  }
  sendMailInvoice(invoice){
 
    var totalPrice = Number(invoice.subTotal) - Number(invoice.discount) 
    var totalSum = Number(totalPrice) - Number(invoice.deposit);
    invoice.totalPrice = totalPrice 
    invoice.duePrice =  totalSum; 
    invoice.username = this.emailSettings.username;
    invoice.password = this.emailSettings.password;
    invoice.host = this.emailSettings.server;
    invoice.isSSL = this.emailSettings.isSSL;
    invoice.port = this.emailSettings.port;
    invoice.encryptiontype	 = this.emailSettings.encryptiontype;
    invoice.email = invoice.customerEmail;
    // obj.email = 'nayanmistry477@gmail.com' 
    invoice.items = this.dataList;
    invoice.items1 = this.dataList1;

    // console.log(invoice)
    this.isMailSent = true;
    this.emailService.sendMail(invoice)
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
  filterDisplay() {
    if (!this.displayVal) {
      return;
    }
    // get the search keyword
    let search = this.DisplayMultiFilterCtrl.value;
    if (!search) {
      this.filteredDisplayMulti.next(this.displayVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredDisplayMulti.next(
      this.displayVal.filter(item => item.name.toLowerCase().indexOf(search) > -1 || item.name.toUpperCase().indexOf(search) > -1)
    );
  }
  filterStatus() {
    if (!this.statusVal) {
      return;
    }
    // get the search keyword
    let search = this.statusMultiFilterCtrl.value;
    if (!search) {
      this.filteredstatusMulti.next(this.statusVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredstatusMulti.next(
      this.statusVal.filter(item => item.name.toLowerCase().indexOf(search) > -1 || item.name.toUpperCase().indexOf(search) > -1)
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
      if (this.selectedJob.discount == null || this.selectedJob.discount == "" || this.selectedJob.discount == undefined) {
        this.selectedJob.discount = 0;
      }
      this.selectedInvoiceTotal = Number(this.selectedJob.price) - Number(this.selectedJob.discount)
      this.selectedTotalSum = Number(this.selectedInvoiceTotal) - Number(this.selectedJob.deposit);
      // console.log(this.selectedTotalSum)
      console.log(this.selectedJob)
    }else{
      this.selectedJob = {}
    }
   
  }
  isInvoice$: boolean = false;
  createInvoice() {

    this.invoiceGroup.markAllAsTouched();
    if (!this.invoiceGroup.valid) {
      return;
    } else {
      var data = {
        jobId: this.selectedJob.id,
        invoiceTo: this.selectedCustomer.customer,
        customerContact: this.selectedCustomer.customerContact,
        customerEmail: this.selectedCustomer.customerEmail,
        address: this.selectedCustomer.address,
        contactDetails: this.selectedCustomer.customerContact + ',' + this.selectedCustomer.customerEmail + ',' + this.selectedCustomer.address,
        discount: this.selectedJob.discount,
        subTotal: this.selectedJob.price,
        totalPrice: this.selectedInvoiceTotal,
        deposit: "",
        paymentStatus: "pending"
      }
      if (this.selectedJob.id != undefined) {
        if (this.selectedTotalSum == 0) {
          data.paymentStatus = 'completed'
        } else {
          data.paymentStatus = 'pending'
        }
        if (this.selectedJob.deposit != null || this.selectedJob.deposit != 0) {
          data.deposit = this.selectedJob.deposit;
        }
      } else {
        data.paymentStatus = 'pending';
        data.discount = 0;
        data.subTotal = 0;
        data.jobId = null;
      }


      this.isInvoice$ = true;
      console.log(data)
      this.invoiceService.createInvoice(data)
        .subscribe(async data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isInvoice$ = false;
            } else {

              this.toastr.success(data.data.message)
              this.editInvoice(data.data.result1) 
              this.isInvoice$ = false;
              this.modalService.dismissAll()
              this.selectedJob = {}
              this.selectedCustomer = {}
              this.invoiceGroup.reset();   
              this.cdr.markForCheck()

            }
          },
          error => {
            console.log(error);
          });
    }
  }
  filterpaymentType() {
    if (!this.paymentVal) {
      return;
    }
    // get the search keyword
    let search = this.paymentTypeMultiFilterCtrl.value;
    if (!search) {
      this.filteredpaymentTypeMulti.next(this.paymentVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredpaymentTypeMulti.next(
      this.paymentVal.filter(item => item.paymentType.toLowerCase().indexOf(search) > -1 || item.paymentType.toUpperCase().indexOf(search) > -1)
    );
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
    this.invoiceService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.invoiceService.patchState({ paginator });
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
    this.invoiceService.patchState({ searchTerm: searchTerm.toLocaleLowerCase() });
  }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.invoiceGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.invoiceGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.invoiceGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.invoiceGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //Payment Form

  PaymentControlValid(controlName: string): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  PaymentControlInvalid(controlName: string): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  PaymentcontrolHasError(validation, controlName): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  PaymentControlTouched(controlName): boolean {
    const control = this.paymentForm.controls[controlName];
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
    const control = this.InvoiceForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isFormControlInvalid(controlName: string): boolean {
    const control = this.InvoiceForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isFormcontrolHasError(validation, controlName): boolean {
    const control = this.InvoiceForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isFormControlTouched(controlName): boolean {
    const control = this.InvoiceForm.controls[controlName];
    return control.dirty || control.touched;
  }
}
