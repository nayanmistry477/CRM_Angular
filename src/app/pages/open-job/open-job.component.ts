import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AccompanyingService } from 'src/app/modules/auth/_services/accompanying.service';
import { BrandService } from 'src/app/modules/auth/_services/brand.service';
import { ItemTypeService } from 'src/app/modules/auth/_services/itemType.service';
import { JobService } from 'src/app/modules/auth/_services/job.service';
import { JobStatusService } from 'src/app/modules/auth/_services/jobStatus.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { StorageService } from 'src/app/modules/auth/_services/storage.service';
import { EmployeeService } from 'src/app/modules/auth/_services/employee.service';
import { ProductService } from 'src/app/modules/auth/_services/product.service';
import { FileUploader } from 'ng2-file-upload';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ServicesService } from 'src/app/modules/auth/_services/services.service';
import { Gallery, ImageItem, ImageSize, ThumbnailsPosition } from '@ngx-gallery/core';
import { InvoiceService } from 'src/app/modules/auth/_services/invoice.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { EmailSettingsService } from 'src/app/modules/auth/_services/emailSettings.service';
import { DesclaimerService } from 'src/app/modules/auth/_services/desclaimer.service';
import * as moment from "moment";
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { TechnicianService } from 'src/app/modules/auth/_services/technicians.service';
import { PaymentService } from 'src/app/modules/auth/_services/payment.service';

declare var $: any;
interface PaymentType {
  paymentType: string;
}
const API_USERS_URL = `${environment.apiUrl}/services`;

@Component({
  selector: 'app-open-job',
  templateUrl: './open-job.component.html',
  styleUrls: ['./open-job.component.scss']
})
export class OpenJobComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('openJobModal') openJobModal: TemplateRef<any>;
  @ViewChild('openRepairItem') openRepairItem: TemplateRef<any>;
  @ViewChild('openRepairModal') openRepairModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;
  @ViewChild('productopenModal') productopenModal: TemplateRef<any>;
  @ViewChild('brandopenModal') brandopenModal: TemplateRef<any>;
  @ViewChild('itemopenModal') itemopenModal: TemplateRef<any>;
  @ViewChild('confrimPayment') confrimPayment: TemplateRef<any>;

  @ViewChild('acItemopenModal') acItemopenModal: TemplateRef<any>;
  @ViewChild('storageopenModal') storageopenModal: TemplateRef<any>;
  @ViewChild('serviceopenModal') serviceopenModal: TemplateRef<any>;
  @ViewChild('confrimSalesBox') confrimSalesBox: TemplateRef<any>;
  @ViewChild('confrimAttachment') confrimAttachment: TemplateRef<any>;
  @ViewChild('openPaymentModal') openPaymentModal: TemplateRef<any>;
  @ViewChild('confrimInvoice') confrimInvoice: TemplateRef<any>;
  @ViewChild('manualproductopenModal') manualproductopenModal: TemplateRef<any>; 
  @ViewChild('confrimProductManual') confrimProductManual: TemplateRef<any>;

  @ViewChild(MatDatepicker) picker4: MatDatepicker<Moment>;
  @ViewChild(MatDatepicker) picker1: MatDatepicker<Moment>;

  public jobObj: any = {};
  JobformGroup: FormGroup;
  itemRepairForm: FormGroup;
  repairAssignForm: FormGroup;
  productGroup: FormGroup;
  brandGroup: FormGroup;
  customerForm: FormGroup;
  ACItemsGroup: FormGroup;
  itemTypeGroup: FormGroup;
  locationGroup: FormGroup;
  ServiceformGroup: FormGroup;
  searchGroup: FormGroup;
  paymentForm: FormGroup;
  productManualForm:FormGroup; 
  public repairItemObj: any = {}
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  uploader: FileUploader;
  uploader1: FileUploader;
  p: number
  public attachmentList = []
  public jobStatusList: any = []
  private subscriptions: Subscription[] = [];
  private itemVal: any[] = [];
  private brandsVal: any[] = [];
  private acItemsVal: any[] = [];
  private storageLocationVal: any[] = [];
  private assignToVal: any[] = [];
  private productVal: any[] = [];
  private bookedByVal: any[] = [];
  private jobStatusVal: any[] = [];
  private serviceVal: any[] = [];
  private invoiceVal: any[] = [];

  minDate = new Date();
  isLoading$
  isLoading: boolean;
  isFlag: number = 1;
  isShow: boolean = false;
  public searching: boolean = false;
  isJobShow: Boolean = false;
  selectedIndex = 0;
  protected _onDestroy = new Subject<void>();
  token: any = {}
  fileData: File = null;
  fileObj: any = {}
  totalSum:any = 0;
  paymentObj: any = {};
  public filteredpaymentTypeMulti: ReplaySubject<PaymentType[]> = new ReplaySubject<PaymentType[]>(1);
  public paymentTypeMultiFilterCtrl: FormControl = new FormControl();
  private paymentVal: PaymentType[] = [
    { paymentType: 'Other', },
    { paymentType: 'Cash Sale', },
    { paymentType: 'Card Payment Remote', },
    { paymentType: 'Card Payment', },
    { paymentType: 'BACs', },
  ];
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    minHeight: '2rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',

    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  public itemMultiFilterCtrl: FormControl = new FormControl();
  public brandMultiFilterCtrl: FormControl = new FormControl();
  public ACItemsMultiFilterCtrl: FormControl = new FormControl();
  public LocationMultiFilterCtrl: FormControl = new FormControl();
  public assignToMultiFilterCtrl: FormControl = new FormControl();
  public jobStatusMultiFilterCtrl: FormControl = new FormControl();
  public productMultiFilterCtrl: FormControl = new FormControl();
  public bookedByMultiFilterCtrl: FormControl = new FormControl();
  public serviceMultiFilterCtrl: FormControl = new FormControl(); 
  public invoiceMultiFilterCtrl: FormControl = new FormControl();
  
  public filteredInvoiceMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);  
  public filteredProductMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredbookedByMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredjobStatusMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredItemMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredBrandMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredACItemsMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredLocationMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredassignToMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredServiceMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public totalProductPrice: number;

  public dataList = []
  public dataList1 = [];

  constructor(private fb: FormBuilder,
    public jobService: JobService,
    public itemTypeService: ItemTypeService,
    public brandService: BrandService,
    public ACCItemService: AccompanyingService,
    private cdr: ChangeDetectorRef,
    public jobStatusSService: JobStatusService,
    public userService: EmployeeService,
    public productService: ProductService,
    public emailService: EmailSettingsService,
    private sanitizer: DomSanitizer,
    public http: HttpClient,
    public servicesService: ServicesService,
    public gallery: Gallery,
    public InvoiceService: InvoiceService,
    private desclaimerService: DesclaimerService,
    private elRef: ElementRef,
    public storageLocationService: StorageService,
    private ngZone: NgZone,
    public technicianService: TechnicianService,
    public paymentService:PaymentService,
    private modalService: NgbModal, private toastr: ToastrService) {
    this.getAllJobsStatus()

    this.modalService.dismissAll();

    this.uploader = new FileUploader({
      // url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction:  (item) => {
        return new Promise((resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date()
          });
        });
      }
    });
    this.uploader1 = new FileUploader({
      // url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item) => {
        return new Promise((resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date()
          });
        });
      }
    });
  }

  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  user: any = {}
  ngOnInit(): void {
    var token = JSON.parse(localStorage.getItem('token'));
    this.token = token.accessToken
    this.user = token.user
    const sb = this.jobService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.jobService.grouping;
    this.paginator = this.jobService.paginator;
    this.sorting = this.jobService.sorting;

    this.jobService.fetch();
    this.changeOption('')
    this.getAllItemTypes();
    this.getAllBrands();
    this.getAllAccompanyings()
    this.getAllStorageLocation()
    this.getAllAssignToUser();
    this.getAllProducts();
    this.getAllServices();
    this.getAllBookedByUser();
    this.getAllJobStatus(); 
    this.getDesclaimer();
    this.getCompanyDetails();
    this.getAllEmailSettings();
    this.searchForm();
    this.filteredpaymentTypeMulti.next(this.paymentVal.slice()); 

    this.paymentTypeMultiFilterCtrl.valueChanges
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
    this.JobformGroup = this.fb.group({
      id: [''],
      customer: ['', [Validators.required]],
      customerEmail: ['',Validators.compose([  Validators.email])],
      customerContact: ['',Validators.compose([  Validators.minLength(11), Validators.maxLength(11)])],
      itemType: ['', Validators.compose([Validators.required])],
      brand: ['', Validators.compose([Validators.required])],
      accompanying: ['', Validators.compose([Validators.required])],
      serialNo: [''],
      damageAsses: [''],
      underWarranty: [''],
      itemComment: [''],
      password: [''],
      price: [''],
      pendingPrice: [''],
      deposit: [''],
      extraDeposit: [''],
      discount: [''],
      address: [''],
      bookedBy: ['', Validators.compose([Validators.required])],
      assignedTo: ['',],
      estDate: [''],
      createdDate: [''],
      completedDate: [''],
      jobStatus: ['', Validators.compose([Validators.required])],
      statusStage: [''],
      storageLocation: ['', Validators.compose([Validators.required])],
      barcode: [''],
      repairDescription: [''],
      service: [''],
      product: [''],
      invoiceDate: [''],
      dueDate: [''],
      paymentDetails: [''],
      totalPrice: [''],
      subTotal: [''],
      additionalNotes: [''],
      technicianNotes: [''],
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
    this.ACItemsGroup = this.fb.group({

      accompanyingName: ['', Validators.compose([Validators.required])]

    });
    this.itemRepairForm = this.fb.group({
      id: [''],
      barcode: [''],
      storageLocation: ['', Validators.compose([Validators.required])],
      deposit: [''],
      repairDescription: ['']
    });
    this.repairAssignForm = this.fb.group({
      id: [''],
      name: [''],
      assignedTo: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required])],
      quantity: ['']
    });
    this.itemTypeGroup = this.fb.group({

      itemTypeName: ['', Validators.compose([Validators.required])]

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
      quantity:[''], 
    });
    this.ServiceformGroup = this.fb.group({
      serviceName: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
    });
    this.brandGroup = this.fb.group({

      brandName: ['', Validators.compose([Validators.required])]
    });
    this.locationGroup = this.fb.group({
      id: [''],
      storageName: ['', Validators.compose([Validators.required])]
    })

    this.cdr.markForCheck();
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
    this.jobService.patchState({ searchTerm: searchTerm.toLocaleLowerCase() });
  }
  onSelect() {
    for (let i = 0; i < this.uploader.queue.length; i++) {
      let fileItem = this.uploader.queue[i]._file;
      if (fileItem.size > 100000000) {
        // alert("Each File should be less than 10 MB of size.");
        this.toastr.warning("Each File should be less than 10 MB of size.")
        this.uploader.queue = []
        return;
      }
    }
  }
  uploadAttachment() {

    for (let j = 0; j < this.uploader.queue.length; j++) {
      let data = new FormData();
      let fileItem = this.uploader.queue[j]._file; 
      data.append('file', fileItem);
      this.uploadFile(this.jobObj.id, data) 
    }
    
  }

   async uploadFile(id, data: FormData) {

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    await new Promise((resolve, reject) => {
      // your upload code
   this.http.post<any>(`${API_USERS_URL}/createAttachment/` + id, data, { headers: httpHeaders, reportProgress: true, observe: 'events' })
        .subscribe(async event => {
          if (event.type === HttpEventType.UploadProgress) {
          } else if (event instanceof HttpResponse) {
            if (event.status == 200) {

              if (event.body.data.status == 0) {

              } else {
                this.jobService.fetch();
                this.isLoading$ = false;
                this.toastr.success('Attachment uploaded successfully')
                this.uploader.clearQueue()
                this.getattachmentsByjobID(this.jobObj.id)
                // this.updateInvoice('updateInvoice')
                // this.cdr.markForCheck();
              }
            }

          }

        },
          error => {
            console.log(error);
            this.toastr.error("Attachment upload failed");
            this.jobService.fetch();
            this.isLoading$ = false;
            this.uploader.clearQueue()
          });
    });


  }
  public fileName:any=[]
  onSelectDocument(){
    this.fileName = [];
    // for (let i = 0; i < this.uploader1.queue.length; i++) {
      let fileItem = this.uploader1.queue[0]._file;
      console.log(fileItem.name); 
      this.fileName = fileItem.name
      if (fileItem.size > 100000000) {
        // alert("Each File should be less than 10 MB of size.");
        this.toastr.warning("Each File should be less than 10 MB of size.")
        this.uploader1.queue = []
        return;
      // }
    }
  }
  uploadDocument(){
    let data = new FormData();
     
    
      let fileItem = this.uploader1.queue[0]._file;
      console.log(fileItem.name); 
      data.append('file', fileItem);
      // this.uploadFileDocument(this.jobObj.id, data)
      // console.log(data)
      this.isLoading$ = true
      const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this.http.post<any>(`${environment.apiUrl}/reports/uploadDocument/` + this.jobObj.jobId, data,{ headers: httpHeaders } )
    .subscribe(
      data => {
        if (data.status == 0) {
          this.toastr.error(data.message)
          this.isLoading$ = false
        } else {
          // console.log(data)
          this.toastr.success(data.message)
          this.uploader1.clearQueue()
          this.isLoading$ = false
          this.cdr.markForCheck(); 
          // this.saleQty = data.result[0].saleQty;


        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
  }
  clearDocument(){
    this.uploader1.clearQueue()
    this.fileName = [];
    this.cdr.markForCheck();
  }
  selectInvoice(data){
    console.log(data)
  }
  
  invoiceData: any = {};
  invoiceTotal: number = 0;
  payStatus: any = {}

  isPendingPrice: boolean = false;
  isImageLoading: boolean = false;
  totalPaid: number = 0;
  editJob(job) {

    this.isShow = true
    this.getProducts_ServiceByJobID(job.id)
    this.getManualProductByJobID(job.id);
    this.getJobByInvoiceID(job.id)
    // this.getPaymentById(job.id)

    this.selectedIndex = 0;
    this.jobObj = job;
    this.repairItemObj = job;
    // console.log(job)
    if (job.accompanying != null && job.accompanying != undefined) {
      this.jobObj.accompanying = job.accompanying.split(',')
      var setval;
      setval = this.jobObj.accompanying.toString().replace("[", "").replace("]", "");
      var getval = setval.toString()
    }
    else {
      getval = this.jobObj.accompanying
    }
    this.JobformGroup.controls['id'].setValue(this.jobObj.id);
    this.JobformGroup.controls['itemType'].setValue(this.jobObj.itemType);
    this.JobformGroup.controls['damageAsses'].setValue(this.jobObj.damageAsses);
    this.JobformGroup.controls['brand'].setValue(this.jobObj.brand);
    this.JobformGroup.controls['underWarranty'].setValue(this.jobObj.underWarranty);
    this.JobformGroup.controls['serialNo'].setValue(this.jobObj.serialNo);
    this.JobformGroup.controls['accompanying'].setValue(getval);
    this.JobformGroup.controls['itemComment'].setValue(this.jobObj.itemComment);
    this.JobformGroup.controls['customer'].setValue(this.jobObj.customer);
    this.JobformGroup.controls['customerContact'].setValue(this.jobObj.customerContact);
    this.JobformGroup.controls['customerEmail'].setValue(this.jobObj.customerEmail);
    this.JobformGroup.controls['address'].setValue(this.jobObj.address);
    this.JobformGroup.controls['password'].setValue(this.jobObj.password);
    this.JobformGroup.controls['price'].setValue(this.jobObj.price);
    this.JobformGroup.controls['deposit'].setValue(this.jobObj.deposit);
    this.JobformGroup.controls['assignedTo'].setValue(this.jobObj.assignedTo);
    this.JobformGroup.controls['bookedBy'].setValue(this.jobObj.bookedBy);
    // this.JobformGroup.controls['barcode'].setValue(this.jobObj.barcode);
    this.JobformGroup.controls['estDate'].setValue(this.jobObj.estDate);
    this.JobformGroup.controls['completedDate'].setValue(this.jobObj.completedDate);
    this.JobformGroup.controls['createdDate'].setValue(this.jobObj.createdDate);
    this.JobformGroup.controls['repairDescription'].setValue(this.jobObj.repairDescription);
    this.JobformGroup.controls['discount'].setValue(this.jobObj.discount);
    this.JobformGroup.controls['storageLocation'].setValue(this.jobObj.storageLocation);
    this.JobformGroup.controls['additionalNotes'].setValue(this.jobObj.additionalNotes);
    this.JobformGroup.controls['technicianNotes'].setValue(this.jobObj.technicianNotes);
    this.JobformGroup.controls['statusStage'].setValue(this.jobObj.statusStage)
    this.JobformGroup.controls['jobStatus'].setValue(this.jobObj.jobStatus)

    // this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
    // this.paymentForm.controls['dueAmount'].setValue(this.totalSum);


    this.sum = this.jobObj.price;

    this.cdr.markForCheck()
    // this.cdr.detectChanges()
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
            this.JobformGroup.controls['paymentDetails'].setValue(result.paymentDetails);

            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  public isInvoice: Boolean = false;
async getJobByInvoiceID(id) {
    var val = {
      id: id
    } 
 
    this.InvoiceService.getJobByInvoiceID(val)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.isInvoice = false;
            if (this.jobObj.discount == null || this.jobObj.discount == "") {
              this.jobObj.discount = 0;
            }

            this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
            this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
            this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
            this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
            this.getattachmentsByjobID(id)
            this.cdr.markForCheck()
          } else {
            this.invoiceData = data.result[0];
            // console.log(this.invoiceData)
            this.isInvoice = true;
            this.getPaymentById(this.invoiceData.id) 
            this.getattachmentsByjobID(id)
            if (this.jobObj.discount == null || this.jobObj.discount == "") {
              this.jobObj.discount = 0;
            }

            this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
            this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal); 
            this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

            this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
            // if (this.invoiceData.paymentStatus == 'completed') {
            //   this.JobformGroup.controls['discount'].disable()
            //   this.cdr.markForCheck()
            // } else {
            //   this.JobformGroup.controls['discount'].enable()
            //   this.cdr.markForCheck()
            // }

            if (this.invoiceData.extraDeposit != null || this.invoiceData.extraDeposit != 0) {
              this.JobformGroup.controls['extraDeposit'].setValue(this.invoiceData.extraDeposit);
              var totalOrg = Number(this.totalSum) - Number(this.invoiceData.extraDeposit)

              if (this.totalSum < 0) {
                this.JobformGroup.controls['pendingPrice'].setValue(0);
                this.cdr.markForCheck()
              } else {
                this.JobformGroup.controls['pendingPrice'].setValue(totalOrg);
                this.paymentForm.controls['dueAmount'].setValue(totalOrg);
                this.cdr.markForCheck()
              }
            } else {
              this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.cdr.markForCheck()
            }

            this.cdr.markForCheck()
          }

        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  

  getInvoiceByID(id){
    this.InvoiceService.getInvoiceByID(id)
    .subscribe(
      data => {
        // console.log(data.data.status)
        if (data.status == 0) {
          // this.toastr.error(data.message) 
          this.isInvoice = false;
          if (this.jobObj.discount == null || this.jobObj.discount == "") {
            this.jobObj.discount = 0;
          }

          this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
          this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
          this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
          this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
          this.cdr.markForCheck()
        } else {
          this.invoiceData = data.result[0];
          // console.log(this.invoiceData)
          this.isInvoice = true;
          this.getPaymentById(this.jobObj.id)

          if (this.jobObj.discount == null || this.jobObj.discount == "") {
            this.jobObj.discount = 0;
          }

          this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
          this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
          this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

          this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
          if (this.invoiceData.paymentStatus == 'completed') {
            this.JobformGroup.controls['discount'].disable()
            this.cdr.markForCheck()
          } else {
            this.JobformGroup.controls['discount'].enable()
            this.cdr.markForCheck()
          }

          if (this.invoiceData.extraDeposit != null || this.invoiceData.extraDeposit != 0) {
            this.JobformGroup.controls['extraDeposit'].setValue(this.invoiceData.extraDeposit);
            var totalOrg = Number(this.totalSum) - Number(this.invoiceData.extraDeposit)

            if (this.totalSum < 0) {
              this.JobformGroup.controls['pendingPrice'].setValue(0);
              this.cdr.markForCheck()
            } else {
              this.JobformGroup.controls['pendingPrice'].setValue(totalOrg);
              this.paymentForm.controls['dueAmount'].setValue(totalOrg);
              this.cdr.markForCheck()
            }
          } else {
            this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
            this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
            this.cdr.markForCheck()
          }

          this.cdr.markForCheck()
        }

      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
  }

  isInvoice$: boolean = false;
  closeinvoice() {
    this.modalService.dismissAll();
  }
  openInvoice() {
    this.modalService.open(this.confrimInvoice);
  }
  createInvoice() {
    var data = {
      jobId: this.jobObj.id,
      invoiceTo: this.jobObj.customer,
      customerContact: this.jobObj.customerContact,
      customerEmail: this.jobObj.customerEmail,
      address: this.jobObj.address,
      contactDetails: this.jobObj.customerContact + ',' + this.jobObj.customerEmail + ',' + this.jobObj.address,
      discount: this.jobObj.discount,
      subTotal: this.jobObj.price,
      totalPrice: this.invoiceTotal,
      deposit: "",
      paymentStatus: "pending"
    }
    if (this.totalSum == 0) {
      data.paymentStatus = 'completed'
    } else {
      data.paymentStatus = 'pending'
    }
    if (this.jobObj.deposit != null) {
      data.deposit = this.jobObj.deposit;
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
            setTimeout(() => {

              this.getJobByInvoiceID(this.jobObj.id);
              this.isInvoice$ = false;
              this.modalService.dismissAll()
              window.location.reload()
            }, 700)

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
          this.cdr.markForCheck()
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  editPaymentModal() {

    this.modalService.open(this.openPaymentModal)
    this.cdr.detectChanges();
  }
payType:any=null
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
          // this.JobformGroup.controls['deposit'].setValue(this.paymentForm.value.amount);
          // this.JobformGroup.controls['extraDeposit'].setValue(extraDeposit);
          // this.JobformGroup.controls['pendingPrice'].setValue(0);
          // obj.amount = orgPaymentAmt;

          // this.InvoiceService.createPayment(obj)
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
          var obj = this.paymentForm.value;
          obj.invoiceId = this.invoiceData.id;
          obj.jobId = this.jobObj.id;
          obj.addedBy = this.user.firstname + ' ' + this.user.lastname;
          // console.log(obj) 
          this.payType = obj.paymentType
          var orgAmtVal = this.paymentForm.value.amount
          this.paymentForm.value.amount = this.paymentForm.value.amount + this.invoiceData.deposit
          this.JobformGroup.controls['deposit'].setValue(this.paymentForm.value.amount);

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
  selectpaymentType(val) {

  }
  closeModal() {
    this.modalService.dismissAll()
    this.paymentForm.controls['amount'].reset();
    this.paymentForm.controls['paymentType'].reset();
    this.paymentForm.controls['paymentReference'].reset();
  }
  updateInvoice(val) {
    this.isLoading$ = true;
    var data = {
      id: this.invoiceData.id,
      jobId: this.jobObj.id,
      invoiceTo: this.jobObj.customer,
      paymentType: this.payType,
      paymentDetails: this.JobformGroup.value.paymentDetails,
      customerContact: this.jobObj.customerContact,
      customerEmail: this.jobObj.customerEmail,
      address: this.jobObj.address,
      contactDetails: this.jobObj.customerContact + ',' + this.jobObj.customerEmail + ',' + this.jobObj.address,
      invoiceDate: this.JobformGroup.value.invoiceDate,
      dueDate: this.JobformGroup.value.dueDate,
      subTotal: this.jobObj.price,
      discount: this.invoiceData.discount,
      totalPrice: this.invoiceData.totalPrice,
      deposit: this.jobObj.deposit,
      paymentStatus: "",
      extraDeposit: this.JobformGroup.value.extraDeposit

    }
    if (data.extraDeposit == "" || data.extraDeposit == null || data.extraDeposit == undefined || data.extraDeposit == 0) {

      // this.totalPaid = Number(this.paymentForm.value.amount) - Number(this.JobformGroup.value.pendingPrice)
      if(this.JobformGroup.value.pendingPrice != 0 && this.JobformGroup.value.pendingPrice!= undefined){
        this.totalPaid = Number(this.paymentForm.value.amount) - Number(this.JobformGroup.value.pendingPrice)
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
    this.InvoiceService.updateInvoice(data)
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
                if(val == 'updateInvoice'){
                  // setTimeout(() => {
                  //   window.location.reload()
                  // }, 700)
                  this.jobService.fetch(); 
                  this.JobformGroup.untouched;
                  this.isLoading$ = false; 
                }
              }
            } else {
              this.toastr.success(data.data.message)
              // this.getJobByInvoiceID(this.jobObj.id);
              this.updateJob('Invoice')
              this.isLoading$ = false;
             
              
            }
          }
        },
        error => {
          console.log(error);
        });
  }
  editMode: any;
  editModeCheck(i, x, data) {
    if (i == x) {
      this.editMode = x;
      // console.log(this.editMode)
      return false;
    }

  }
  getattachmentsByjobID(jobID) {
    var id = { jobID: jobID }
    this.jobService.getattachmentsByjobID(id)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message) 
            this.attachmentList = []
          } else {
            var list = [];
            data.result.forEach(element => {
              if (element != null) {
                this.isImageLoading = true

                list.push(element);


              } else {
                this.isImageLoading = false
              }

            });
            this.attachmentList = list.map(item =>
              // new ImageItem({ src: item.fileName, thumb: item.fileName, id: item.id })
              new ImageItem({ src:'https://bmtechcrm.co.uk' + '/'+ item.fileName, thumb:'https://bmtechcrm.co.uk' + '/'+ item.fileName, id: item.id })

            );
            // console.log(list)
            // this.attachmentList = list;
            this.gallery.ref().load(this.attachmentList);
            this.withCustomGalleryConfig();
            // console.log(this.attachmentList)
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  withCustomGalleryConfig() {

    // 2. Get a lightbox gallery ref
    const lightboxGalleryRef = this.gallery.ref('anotherLightbox');

    // (Optional) Set custom gallery config to this lightbox
    lightboxGalleryRef.setConfig({
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Top
    });

    // 3. Load the items into the lightbox
    lightboxGalleryRef.load(this.attachmentList);
  }
  editPrice(item, newPrice) {

    this.dataList.forEach(element => {
      if (element.id == item.id) {
        var total;

        if (Number(newPrice) >= Number(item.price)) {
          this.sum = this.jobObj.price
          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          this.jobObj.price = this.sum

        }
        if (Number(newPrice <= Number(item.price))) {
          this.sum = this.jobObj.price
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
          this.jobObj.price = this.sum
          // console.log(this.sum)
        }
        if (element.id == item.id) {
          element.price = Number(newPrice)
          // console.log(element)
          // service = element
        }
      }

    });

  }
  demoArr = [
    { name: "Manthan", role: "Frontend Dev , Mobile App Dev" },
    { name: "Krunal", role: "Full Stack Dev" },
    { name: "Sunil", role: "Full Stack Dev" },
    { name: "Nayan", role: "Full Stack Dev" }
  ];
  issShow = false;
  value: any;
  sele: any;
  demo(j, i, x) {
    // console.log(j, i, x);
    if (j == x) {
      this.issShow = true;
      this.sele = x;
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
          // console.log(this.editMode)
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
          this.sum = this.jobObj.price
          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          this.jobObj.price= this.sum

        }
        if (Number(newPrice <= Number(item.price))) {
          this.sum =  this.jobObj.price
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
          this.jobObj.price= this.sum
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
    // this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
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

                  var oldproductprice =  this.jobObj.price;
                  element.price = Number(element.price) + Number(this.orgPrice1);
                  this.sum = Number(oldproductprice) + Number(this.orgPrice1);
                  this.jobObj.price = this.sum;
 
                }  
                // this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
             
              })
              this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
              this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      
              this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
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
 
            var oldproductprice =  this.jobObj.price
              this.dataList1.forEach(element => { 
                if (element.id === job.id) {
                  element.price = Number(element.price) - Number( this.orgPrice1);
                  this.sum = Number(oldproductprice) - Number( this.orgPrice1);
                  this.jobObj.price = this.sum;
                }
              }); 
              this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
              this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      
              this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
            // this.quoteForm.controls['subTotal'].setValue(this.quoteData.subTotal);
            this.cdr.markForCheck()
          }
        },
        error => {
          console.log(error);
        });
      
    }
  }
  deleteObj: any = {}
  editDeleteJob(job) {
    this.modalService.open(this.confrimBox)
    this.deleteObj = job;

  }
  deleteJob() {
    this.isLoading$ = true;
    this.jobService.deleteJob(this.deleteObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isLoading$ = false;
            this.cdr.markForCheck()
          } else {

            this.toastr.success(data.data.message)
            this.deleteObj = {};
            this.isLoading$ = false;
            this.modalService.dismissAll()
            this.jobService.fetch()
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

  }
  closeDeleteJob() {
    this.modalService.dismissAll();
  }
  dateNow: any;
  ngAfterViewInit() {
    // wait a tick to avoid one-time devMode
    // unidirectional-data-flow-violation error
    this.isLoading$ = false
    this.cdr.detectChanges()


  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  updateRepairDetails() {

    var list = []
    // console.log(this.sum)
    // console.log(this.dataList)
    
    var str
    this.dataList.forEach(element => {

      if (element.type != 'service') {
        str = { ID: element.ID, productID: element.id, jobID: this.jobObj.id,invoiceID: this.invoiceData.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
      } else {
        str = { ID: element.ID, serviceID: element.id, jobID: this.jobObj.id,invoiceID: this.invoiceData.invoiceID, name: element.name, quantity: element.quantity, price: element.price }
      }
      list.push(str);

    });
    this.isLoading$ = true;
    // console.log(list)
    this.servicesService.updateProduct_ServiceFinal(list)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isLoading$ = false;
          } else {
            this.toastr.success(data.data.message);
           
            this.updateInvoice('updateRepair');
            this.isLoading$ = false;

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  keyFunc(event) {


    setTimeout(() => {
 
      this.invoiceTotal = Number(this.jobObj.price) - Number(event.target.value)
      this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.jobObj.discount = Number(event.target.value)
      this.invoiceData.discount = Number(event.target.value)
      // this.sum = this.jobObj.price;
      this.cdr.markForCheck()
      

    }, 1000)
  }
  keyFunc1(event) {
    var discount = 0
    discount = (Number(this.jobObj.price) / 100) * Number(event.target.value);
    setTimeout(() => {
   
      this.invoiceTotal = Number(this.jobObj.price) - Number(discount);
      // console.log(this.jobObj.deposit)
      this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
      var totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      this.totalSum = totalSum.toFixed(2)

      this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.invoiceData.discount = Number(discount)

      this.cdr.markForCheck()

    }, 1000)
  }
   updateJob(val) {
    // this.isLoading$ = true

    // this.JobformGroup.markAllAsTouched();
    // if (!this.JobformGroup.valid) {
    // return;
    // } else {
    this.isLoading$ = true;
    var obj = this.JobformGroup.value

    var setval;
    setval = this.jobObj.accompanying.toString().replace("[", "").replace("]", "");
    var getval = setval.toString()
    obj.accompanying = getval
    if (this.JobformGroup.value.underWarranty == false) {
      obj.underWarranty = ""
    } else {
      obj.underWarranty = "true"
    }
    if (obj.statusStage == "closed" || val != 'DeleteItem') {
      obj.completedDate = new Date()
    }
    // obj.discount = this.jobObj.discount;
    obj.price = this.jobObj.price;
    obj.customer = this.jobObj.customer;
    obj.id = this.jobObj.id;
    
    if(this.invoiceData.discount != undefined && this.invoiceData.discount != null ){
      obj.discount = this.invoiceData.discount 
    }else{
      obj.discount = this.jobObj.discount;
    }
    // console.log(obj) 
    if(this.JobformGroup.value.estDate == null){
      obj.estDate = ""
    }
    // console.log(this.sum)

    this.jobService.updateJobData(obj)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isLoading$ = false;
          } else {
            if (val == 'updateJob') {
 
                this.toastr.success(data.data.message); 
                if(this.uploader1.queue.length != null && this.uploader1.queue.length != 0){
                  this.uploadDocument();
                  this.clearDocument()  
                  this.cdr.markForCheck()
                }
                this.updateInvoice('updateInvoice')
                
              this.cdr.markForCheck()
              // window.location.reload() 
            } else {
              if (val == 'updateRepair') {
                // setTimeout(() => {
                //   window.location.reload()
                //   this.selectedIndex = 1;
                // }, 500)
                this.updateProductManually()
                this.isLoading$ = false;
                this.getProducts_ServiceByJobID(this.jobObj.id)
                

              }
            
              this.paymentForm.reset()
              this.jobService.fetch();
              this.JobformGroup.untouched;
              // this.isLoading$ = false;
              // this.cdr.markForCheck();
              // setTimeout(() => {
              //   window.location.reload()
              // }, 700)
              this.getJobByInvoiceID(this.jobObj.id); 
            }

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    // }
  }
  getAllJobsStatus() {
    this.jobStatusSService.getAllJobStatus()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {
            // this.toastr.error(data.message)
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
            this.cdr.markForCheck()
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  //Services


  quantity: number = 1
  sum: number = 0;
  selectService(val) {
    // console.log(val)
    this.list = {}
    var data = {}

    data = val
    this.list = data
    this.list = this.serviceVal.filter(x => x.service == val)[0];
    // console.log(this.list)
    this.cdr.markForCheck()

  }

  servicePrice: number = 0;
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
        this.JobformGroup.controls['service'].reset();
        this.sum = Number(this.jobObj.price) + Number(this.list.price)
        this.jobObj.price = this.sum;
        this.list = []
        this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
        // console.log(this.jobObj.deposit)
        this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
        this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

        this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
        this.JobformGroup.controls['price'].setValue(this.jobObj.price);

        // this.toastr.success('Services Added Successfully')
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
                  // this.toastr.error(data.message)
                } else {

                  this.servicePrice = data.result[0].price;
                  // this.toastr.error('Service is already added in job');
                  result.quantity++
                  this.sum = Number(this.jobObj.price) + Number(this.servicePrice);
                  this.jobObj.price = this.sum;
                  this.dataList.forEach(element => {
                    if (element.id === result.id) {
                      element.price = Number(element.price) + Number(this.servicePrice);

                    }
                  });
                  this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
                  // console.log(this.jobObj.deposit)
                  this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
                  this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

                  this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
                  this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
                  this.JobformGroup.controls['price'].setValue(this.jobObj.price);
                  this.JobformGroup.controls['service'].reset();
                  // this.sum = Number(this.sum) + Number(result.price)
                  // this.toastr.success('Services Added Successfully')
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
          // console.log(this.dataList)
          this.JobformGroup.controls['service'].reset();
          this.sum = Number(this.jobObj.price) + Number(this.list.price)
          // console.log(this.sum)
          this.jobObj.price = this.sum;
          this.list = []
          this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
          // console.log(this.jobObj.deposit)
          this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
          this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

          this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
          this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
          this.JobformGroup.controls['price'].setValue(this.jobObj.price);
          // this.toastr.success('Services Added Successfully')
          this.cdr.markForCheck()
        }
      }


    } else {
      this.toastr.error('Please Select Service')

    }

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

  closeServiceModal() {
    this.modalService.dismissAll(this.serviceopenModal);
    this.ServiceformGroup.reset();
  }
  editServiceModal() {
    this.modalService.open(this.serviceopenModal);
    this.ServiceformGroup.reset();
  }

  addService() {

    this.ServiceformGroup.markAllAsTouched();
    if (!this.ServiceformGroup.valid) {
      return;
    } else {

      const serviceObj = this.ServiceformGroup.value;
      this.isLoading$ = true;
      this.servicesService.createOnlyService(serviceObj)
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





  editRepairModal() {
    this.jobService.fetch()
    this.modalService.open(this.openRepairItem)
    this.itemRepairForm.controls['id'].setValue(this.repairItemObj.id);
    this.itemRepairForm.controls['repairDescription'].setValue(this.repairItemObj.repairDescription);
    this.itemRepairForm.controls['storageLocation'].setValue(this.repairItemObj.storageLocation);
    this.itemRepairForm.controls['deposit'].setValue(this.repairItemObj.deposit);
    this.itemRepairForm.controls['barcode'].setValue(this.repairItemObj.barcode);
  }

  // updateRepairInfo() {
  //   // this.isLoading$ = true 

  //   this.itemRepairForm.markAllAsTouched();
  //   if (!this.itemRepairForm.valid) {
  //     return;
  //   } else {
  //     this.isLoading$ = true;

  //     var obj = this.itemRepairForm.value

  //     this.jobService.updateItemInfo(obj)
  //       .subscribe(
  //         data => {
  //           if (data.data.status == 0) {
  //             this.toastr.error(data.data.message)
  //             this.isLoading$ = false;
  //           } else {
  //             this.isLoading$ = false;
  //             this.jobService.fetch()
  //             this.toastr.success(data.data.message)
  //             this.itemRepairForm.reset();
  //             this.itemRepairForm.untouched;
  //             this.modalService.dismissAll();


  //             // this.cdr.markForCheck()
  //           }
  //         },
  //         error => {
  //           // this.showError(error.statusText);
  //           console.log(error);
  //         });
  //   }
  // }

  closeUpdateJob() {
    // this.isJobShow = false
    this.modalService.dismissAll()
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
            this.filteredItemMulti.next(this.itemVal.slice());
            this.itemMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterItemType()
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
  //Item Type 

  filterItemType() {
    if (!this.itemVal) {
      return;
    }
    // get the search keyword
    let search = this.itemMultiFilterCtrl.value;
    if (!search) {
      this.filteredItemMulti.next(this.itemVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredItemMulti.next(
      this.itemVal.filter(item => item.itemType.toLowerCase().indexOf(search) > -1 || item.itemType.toUpperCase().indexOf(search) > -1)
    );
  }

  getAllBrands() {

    this.brandService.getAllBrands()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.brandsVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { brand: element.brandName };
              list.push(str);
            });
            this.brandsVal = list;
            this.filteredBrandMulti.next(this.brandsVal.slice());
            this.brandMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterBrands()
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

  //Brand Types  
  filterBrands() {
    if (!this.brandsVal) {
      return;
    }
    // get the search keyword
    let search = this.brandMultiFilterCtrl.value;
    if (!search) {
      this.filteredBrandMulti.next(this.brandsVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBrandMulti.next(
      this.brandsVal.filter(brands => brands.brand.toLowerCase().indexOf(search) > -1 || brands.brand.toUpperCase().indexOf(search) > -1)
    );
  }

  //ACTypes 

  getAllAccompanyings() {

    this.ACCItemService.getAllAccompanyings()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.acItemsVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { acItems: element.accompanyingName };
              list.push(str);
            });
            this.acItemsVal = list;
            this.filteredACItemsMulti.next(this.acItemsVal.slice());
            this.ACItemsMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterACItem()
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

  filterACItem() {
    if (!this.acItemsVal) {
      return;
    }
    // get the search keyword
    let search = this.ACItemsMultiFilterCtrl.value;
    if (!search) {
      this.filteredACItemsMulti.next(this.acItemsVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredACItemsMulti.next(
      this.acItemsVal.filter(accItems => accItems.acItems.toLowerCase().indexOf(search) > -1 || accItems.acItems.toUpperCase().indexOf(search) > -1)
    );
  }

  //Storage Location 

  getAllStorageLocation() {

    this.storageLocationService.getAllStorages()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.storageLocationVal = [];

          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { storageLocation: element.storageName };
              list.push(str);
            });
            this.storageLocationVal = list;
            this.filteredLocationMulti.next(this.storageLocationVal.slice());
            this.LocationMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterStorageLocation()
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

  filterStorageLocation() {
    if (!this.storageLocationVal) {
      return;
    }
    // get the search keyword
    let search = this.LocationMultiFilterCtrl.value;
    if (!search) {
      this.filteredLocationMulti.next(this.storageLocationVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLocationMulti.next(
      this.storageLocationVal.filter(storageLocation => storageLocation.storageLocation.toLowerCase().indexOf(search) > -1 || storageLocation.storageLocation.toUpperCase().indexOf(search) > -1)
    );
  }

  selectStorageLocation(val) {
    console.log(val)
  }

  //AssignTo

  getAllAssignToUser() {

    this.technicianService.getAllTechnicians()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.assignToVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { assignTo: element.firstname + ' ' + element.lastname };
              list.push(str);
            });
            this.assignToVal = list;
            this.filteredassignToMulti.next(this.assignToVal.slice());
            this.assignToMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterassignTo()
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

  filterassignTo() {
    if (!this.assignToVal) {
      return;
    }
    // get the search keyword
    let search = this.assignToMultiFilterCtrl.value;
    if (!search) {
      this.filteredassignToMulti.next(this.assignToVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredassignToMulti.next(
      this.assignToVal.filter(assignTo => assignTo.assignTo.toLowerCase().indexOf(search) > -1 || assignTo.assignTo.toUpperCase().indexOf(search) > -1)
    );
  }
  selectAssignTo(val) {
    console.log(val)
  }


  //Job Status

  getAllJobStatus() {

    this.jobStatusSService.getAllJobStatus()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.jobStatusVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { id: element.id, statusStage: element.statusStage, jobStatus: element.statusType };
              list.push(str);
            });
            this.jobStatusVal = list;
            this.filteredjobStatusMulti.next(this.jobStatusVal.slice());
            this.jobStatusMultiFilterCtrl.valueChanges
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

  filterJobStatus() {
    if (!this.jobStatusVal) {
      return;
    }
    // get the search keyword
    let search = this.jobStatusMultiFilterCtrl.value;
    if (!search) {
      this.filteredjobStatusMulti.next(this.jobStatusVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredjobStatusMulti.next(
      this.jobStatusVal.filter(jobstatus => jobstatus.jobStatus.toLowerCase().indexOf(search) > -1 || jobstatus.jobStatus.toUpperCase().indexOf(search) > -1)
    );
  }


  selectJobStatus(val) {
    // console.log(val)
    var result;
    result = this.jobStatusVal.filter(res => res.jobStatus == val)[0];
    //  console.log(result) 
    // this.jobObj.jobStatus = result.jobStatus;
    // this.jobObj.statusStage = result.statusStage
    // console.log(this.jobObj)
    this.JobformGroup.controls['statusStage'].setValue(result.statusStage)
  }

  disclaimer: any = {}
  getDesclaimer() {

    this.desclaimerService.getDesclaimer()
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
    this.emailService.sendWorkSheet(job)
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

  sendJobSheet(job) {

    var obj = job;
    var customer = job.customer.split(' ');
    obj.firstname = customer[0];
    obj.lastname = customer[1];
    var tmp = document.createElement("DIV");
    tmp.innerHTML = this.disclaimer.disclaimer;
    tmp.textContent || tmp.innerText || "";
    obj.disclaimer = tmp.innerText

    var tmp1 = document.createElement("DIV");
    tmp1.innerHTML = job.technicianNotes;
    tmp1.textContent || tmp1.innerText || "";
    obj.technicianNotes = tmp1.textContent
    this.isMailSent = true;
    obj.createdDate = moment(job.createdDate).format('DD/MM/YYYY h:mm');
    this.emailService.sendJobSheet(job)
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
    obj.username =this.emailSettings.username;
    obj.password = this.emailSettings.password;
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

  generateInvoice(){
    var obj = this.invoiceData;
    obj.duePrice = this.totalSum;
    // obj.email = 'nayanmistry477@gmail.com'
    obj.email = this.jobObj.customerEmail
    obj.items = this.dataList
    obj.items1 = this.dataList1
    obj.totalPrice = this.invoiceTotal
    obj.customer =  this.jobObj.customer;
    obj.paymentType = this.invoiceData.paymentType;
    obj.paymentDetails = this.JobformGroup.value.paymentDetails;
    obj.DueDate = moment(new Date(this.invoiceData.dueDate)).format('MMMM/DD/YYYY'); 
    obj.InvoiceDate = moment(new Date(this.invoiceData.invoiceDate)).format('MMMM/DD/YYYY');  
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
  selectItem(items) {
    console.log(items)
  }
  selectBrand(items) {
    console.log(items)
  }
  selectACItems(items) {
    console.log(items)
  }
  changeWarranty(val) {
    console.log(val)

  }

  repairAssig: any = {}
  editRepairAssignment(item, data) {
    // this.openReviewModel() 
    // document.getElementById("openModalButton").click();
    this.modalService.open(this.openRepairModal)
    // console.log(data)
    // console.log(item)

    if (item.productID == null) {

      this.repairAssignForm.controls['quantity'].disable();

    } else {
      this.repairAssignForm.controls['quantity'].enable();
    }
    this.repairAssignForm.controls['id'].setValue(item.id);
    this.repairAssignForm.controls['assignedTo'].setValue(data.assignedTo);
    this.repairAssignForm.controls['price'].setValue(item.price);
    this.repairAssignForm.controls['quantity'].setValue(item.quantity);
    this.repairAssignForm.controls['name'].setValue(item.name);
    this.repairAssig = item;
    // this.increment();
    this.cdr.markForCheck()
  }

  editProductModal() {
    this.modalService.open(this.productopenModal);
    this.productGroup.reset();
  }
  editDeleteRepairInfo(data) {

  }
  addRepairAssignment() {
    this.repairAssignForm.markAllAsTouched();
    if (!this.repairAssignForm.valid) {
      return;
    } else {

    }
  }
  addEditRepirAssignment() {
    this.isJobShow = true;

  }

  closeAddRepariAssignModal() {
    this.isJobShow = false;
    this.selectedIndex = 1;
    this.repairAssignForm.reset()
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
      productObj.jobID = this.jobObj.id
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
              this.JobformGroup.controls['product'].reset();
              this.sum = Number(this.jobObj.price ) + Number(productObj.sellPrice)
              this.jobObj.price = this.sum;
               
              this.invoiceTotal = Number(this.jobObj.price) - Number(this.invoiceData.discount) 
              this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
        
              this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              this.JobformGroup.controls['price'].setValue(this.jobObj.price);
              this.productManualForm.reset();
              this.getManualProductByJobID(this.jobObj.id);
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
  //     // productObj.invoiceID = this.invoiceData.invoiceID
  //     // productObj.jobID = this.invoiceData.jobId
  //     this.isLoading$ = true;
  //     this.dataList1.forEach(element => {
  //       if (element.id == productObj.id) {
  //         var total;
  
  //         if (Number(productObj.sellPrice) >= Number(element.price)) {
  //           this.sum = this.jobObj.price
  //           var old = this.sum - Number(element.price);
  //           this.sum = Number(old) + Number(productObj.sellPrice);
  //           this.jobObj.price = this.sum
  
  //         }
  //         if (Number(productObj.sellPrice <= Number(element.price))) {
  //           this.sum = this.jobObj.price
  //           total = Number(element.price) - Number(productObj.sellPrice)
  //           this.sum = this.sum - total;
  //           this.jobObj.price = this.sum
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
       
  //     this.invoiceTotal = Number(this.jobObj.price) - Number(this.invoiceData.discount) 
  //     this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
  //     this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);

  //     this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
  //     this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
  //     this.JobformGroup.controls['price'].setValue(this.jobObj.price);
  //     this.productService.updateProductManually(productObj)
  //       .subscribe(
  //         data => {
  //           if (data.data.status == 0) {
  //             this.toastr.error(data.data.message)
  //             this.isLoading$ = false;
  //           } else {
  //             this.toastr.success(data.data.message)   
  //             this.productManualForm.reset();
  //             this.getManualProductByJobID(this.jobObj.id);
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

      this.sum = Number(this.jobObj.price) - Number(this.productDeleteVal.price)
      this.invoiceData.totalPrice = this.sum
      this.JobformGroup.controls['totalPrice'].setValue(this.invoiceData.totalPrice)
      this.totalSum = Number(this.invoiceTotal) - Number(this.invoiceData.deposit);
      this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
      this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      this.productService.deleteProductManually(this.productDeleteVal)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.deleteManualProduct = false;
            } else {
              this.toastr.success(data.data.message)   
              this.sum = Number(this.jobObj.price) - Number(this.productDeleteVal.price)
              this.jobObj.price= this.sum
              this.JobformGroup.controls['price'].setValue(this.jobObj.price)

              this.productManualForm.reset();
              this.updateInvoice('DeleteItem')
              this.getManualProductByJobID(this.jobObj.id);
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
  updateRepairAssignment() {
    var Obj = this.repairAssignForm.value
    if (this.repairAssig.productID == null) {
      Obj.price = this.repairAssignForm.controls['price'].value
    } else {
      Obj.price = this.repairAssig.price
    }

    Obj.quantity = this.repairAssig.quantity
    // console.log(Obj)
  }
  list: any = {}
  totalQty: number = 0
  productData: any;
  temp: any;
 
  listPro: any = {}
  selectProduct(val) {
    // console.log(val)
    this.listPro = {}
    var data = {}

    data = val;
    this.listPro = this.productVal.filter(x => x.product == val)[0];
    // console.log(this.list)
    this.cdr.markForCheck()
    var valData = {
      productID: this.listPro.id
    }
    this.productService.getAllPurchaseCount(valData)
      .subscribe(
        data => {
          if (data.status == 0) {
            // this.toastr.error(data.message)

          } else {
            // console.log(data)
            if (data.result) {
              this.totalQty = data.result[0].totalQty;
              // console.log(data.result[0].totalQty)
            } else {
              this.totalQty = 0
            }
            this.cdr.markForCheck()
            // console.log(data.result)
            // this.saleQty = data.result[0].saleQty;


          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

    // this.cdr.markForCheck()
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
        this.JobformGroup.controls['product'].reset();
        this.sum = Number(this.jobObj.price) + Number(this.listPro.price)
        this.jobObj.price = this.sum;
        this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
        this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
        this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

        this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
        // this.toastr.success('Product Added Successfully')

        this.listPro = []
        this.cdr.markForCheck()

      } else {

        var result = this.dataList.filter(res => res.name == this.listPro.product)[0];
        if (result != null) {

          if (result.quantity >= this.totalQty) {
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
                    if (data.quantity >= this.totalQty) {
                      this.toastr.error("Product stock gone its limit")
                    }
                    else {

                      this.proOrgPrice = data.result[0].sellPrice;
                      // this.toastr.error('Service is already added in job');
                      result.quantity++
                      this.sum = Number(this.jobObj.price) + Number(this.proOrgPrice);
                      this.jobObj.price = this.sum;
                      this.dataList.forEach(element => {
                        if (element.id === result.id) {
                          element.price = Number(element.price) + Number(this.proOrgPrice);

                        }
                        this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
                        this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
                        this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

                        this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
                        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
                      });

                      this.JobformGroup.controls['product'].reset();
                      // this.sum = Number(this.sum) + Number(result.price)
                      // this.toastr.success('Product Added Successfully')

                      result = []
                      this.listPro = []
                      this.cdr.markForCheck()
                    }
                  }
                },
                error => {
                  console.log(error);
                });
          }
        }

        else {
         
          this.dataList.push(data)
          this.JobformGroup.controls['product'].reset();
          this.sum = Number(this.jobObj.price) + Number(this.listPro.price);
          this.jobObj.price = this.sum;
          this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
          this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
          this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

          this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
          this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
          // this.toastr.success('Product Added Successfully')

          this.listPro = []
          this.cdr.markForCheck()
         
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

  closeUpdateRepariAsignment() {
    this.repairAssig = {}
    this.repairAssignForm.controls['quantity'].reset()
    this.repairAssignForm.reset()
    this.modalService.dismissAll()

  }
  // decrement() {
  //   if (Number(this.repairAssig.quantity) <= 0 && Number(this.repairAssig.quantity) == -1) {
  //     this.repairAssig.quantity = 1;
  //     this.sum = 0;
  //   } else {

  //     var valData = {
  //       productID: this.repairAssig.id
  //     }

  //     this.productService.getAllPurchaseCount(valData)
  //       .subscribe(
  //         data => {
  //           if (data.status == 0) {
  //             this.toastr.error(data.message)

  //           } else {
  //             // console.log(data)
  //             if (data.result != -1) {
  //               this.totalQty = data.result[0].totalQty
  //               this.productData = data.result[0].product
  //               this.cdr.detectChanges()
  //             } else {
  //               this.totalQty = 0
  //             }

  //             // this.saleQty = data.result[0].saleQty;


  //           }
  //         },
  //         error => {
  //           // this.showError(error.statusText);
  //           console.log(error);
  //         });


  //     if (this.productData == undefined) {
  //       Number(this.repairAssig.quantity--)

  //       this.sum = Number(this.sum) - Number(this.repairAssig.price)

  //     } else {
  //       this.repairAssig.quantity--
  //       // if(this.productData.id == this.repairAssig.id){
  //       // this.sum = Number(this.repairAssig.price) - Number(this.productData.sellPrice)
  //       this.repairAssig.price = Number(this.repairAssig.price) - Number(this.productData.sellPrice);
  //       // this.repairAssig.price = this.sum

  //       // }
  //     }

  //   }
  // }

  getProducts_ServiceByJobID(item) {
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
              var str = {}
              var list = []
              data.result.forEach(element => {

                if (element.productID == null || element.productID == undefined) {
                  str = { ID: element.id, id: element.serviceID, jobID: element.jobID,invoiceID: element.invoiceID, name: element.name, service: "1", quantity: element.quantity, price: element.price }

                } else {
                  str = { ID: element.id, id: element.productID, jobID: element.jobID,invoiceID: element.invoiceID, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice}

                }
                if( element.productID !=null || element.serviceID != null){
                  list.push(str)
                }

              });
              this.dataList = list;
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

  deleAttachment: any = {}
  editDeleteattachment(val) {
    this.modalService.open(this.confrimAttachment);
    this.deleAttachment = val.data;
    // console.log(this.deleAttachment)
  }
  closeDeleteAttachment() {
    this.modalService.dismissAll();
    this.deleAttachment = {};
  }
  isDeleting:Boolean = false;
  deleteImage() {
    this.isDeleting = true;
    this.jobService.deleteAttachment(this.deleAttachment)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.jobService.fetch()
            this.isDeleting = false; 
            this.modalService.dismissAll();
            this.cdr.markForCheck()
          } else {

            this.toastr.success(data.data.message)
            // this.isLoading$ = false; 
            // this.modalService.dismissAll()
            this.isDeleting = false; 
            this.getattachmentsByjobID(this.jobObj.id)
            this.jobService.fetch()
            this.modalService.dismissAll();
            this.cdr.markForCheck()

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  orgPrice: number = 0
  async increment(job, i) {
    // console.log(job)
    var valData = {
      productID: job.id,
      jobID: job.jobID
    }
    this.productService.getAllPurchaseCountForUpdate(valData)
      .subscribe(async data => {

          if (data.status == 0) {
            // this.toastr.error(data.message)

          } else {


            this.productData = data.result[0].product;
            // console.log(data)
            if (data.result) {
              this.totalQty = data.result[0].totalQty;
              // console.log(data.result[0].totalQty)
            } else {
              this.totalQty = 0
            }
            if (this.productData.id == job.id) {
              if (job.quantity >= this.totalQty) {
                this.toastr.error("Product stock gone its limit")
                return
              } else {
      
                job.quantity++
                //  this.quantity ++ 
                // this.sum = Number(job.quantity) * Number(this.orgPrice)
                //   console.log(  this.sum)
                //  this.quantity ++ 
                this.sum = Number(this.sum) + Number(this.productData.sellPrice)
      
              }
              var list = []
              this.dataList.forEach(element => {
      
                var oldproductprice = this.jobObj.price;
                if (JSON.parse(element.id) === this.productData.id) {
                  element.price = Number(element.price) + Number(this.productData.sellPrice);
                  this.sum = Number(oldproductprice) + Number(this.productData.sellPrice);
                  this.jobObj.price = this.sum;
                }
              });
              this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
              this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
              this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      
              this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
              this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
              // console.log(this.jobObj.price);
      
      
            }
            this.cdr.markForCheck()
          }
        },
        error => {
          console.log(error);
        });

    // if (this.productData == undefined) {

    //   // return
    //   var id = {
    //     id: job.id
    //   }
    //   var price
    //   this.productService.getProductByProductID(id)
    //     .subscribe(
    //       data => {

    //         if (data.status == 0) {
    //           // this.toastr.error(data.message)

    //         } else {

    //           this.orgPrice = data.result[0].sellPrice;

    //           job.quantity++
    //           //  this.quantity ++ 
    //           //  console.log(Number(this.dataList[i].quantity))
    //           //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)

    //           this.dataList.forEach(element => {
    //             if (element.id === job.id) {

    //               var oldproductprice = this.jobObj.price;
    //               element.price = Number(element.price) + Number(this.orgPrice);
    //               this.sum = Number(oldproductprice) + Number(this.orgPrice);
    //               this.jobObj.price = this.sum;


    //             }
    //             this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
    //             this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
    //             this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

    //             this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
    //             this.paymentForm.controls['dueAmount'].setValue(this.totalSum);

    //             this.cdr.markForCheck()
    //           })
    //         }
    //       },
    //       error => {
    //         console.log(error);
    //       });
    // }
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
                // this.sum = Number(this.sum) - Number(this.productData.sellPrice)
      
                // this.dataList.forEach(element => {
      
                //   if (JSON.parse(element.id) === this.productData.id) element.price = Number(element.price) - Number(this.productData.sellPrice)
      
                //   console.log(element.price)
                // })
      
                this.dataList.forEach(element => {
      
                  var oldproductprice = this.jobObj.price;
                  if (JSON.parse(element.id) === this.productData.id) {
                    element.price = Number(element.price) - Number(this.productData.sellPrice);
                    this.sum = Number(oldproductprice) - Number(this.productData.sellPrice);
                    this.jobObj.price = this.sum;
                  }
                });
                // console.log(this.sum);
                this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
                // console.log(this.jobObj.deposit)
                this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
                this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);
      
                this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
                this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
                this.JobformGroup.controls['price'].setValue(this.jobObj.price);
              }
      
              // this.JobformGroup.controls['price'].setValue(this.sum)
              this.cdr.markForCheck()
              // this.saleQty = data.result[0].saleQty;


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

      //           // console.log(data)

      //           this.orgPrice = data.result[0].sellPrice;

      //           job.quantity--
      //           //  this.quantity ++ 
      //           //  console.log(Number(this.dataList[i].quantity))
      //           //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)


      //           this.dataList.forEach(element => {
      //             if (element.id === job.id) {

      //               var oldproductprice = this.jobObj.price;
      //               element.price = Number(element.price) - Number(this.orgPrice);
      //               this.sum = Number(oldproductprice) - Number(this.orgPrice);
      //               this.jobObj.price = this.sum;
      //             }
      //             this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
      //             // console.log(this.jobObj.deposit)
      //             this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
      //             this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

      //             this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
      //             this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      //             this.JobformGroup.controls['price'].setValue(this.jobObj.price);
      //             this.cdr.markForCheck()
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
      //     // this.sum = Number(this.sum) - Number(this.productData.sellPrice)

      //     // this.dataList.forEach(element => {

      //     //   if (JSON.parse(element.id) === this.productData.id) element.price = Number(element.price) - Number(this.productData.sellPrice)

      //     //   console.log(element.price)
      //     // })

      //     this.dataList.forEach(element => {

      //       var oldproductprice = this.jobObj.price;
      //       if (JSON.parse(element.id) === this.productData.id) {
      //         element.price = Number(element.price) - Number(this.productData.sellPrice);
      //         this.sum = Number(oldproductprice) - Number(this.productData.sellPrice);
      //         this.jobObj.price = this.sum;
      //       }
      //     });
      //     console.log(this.sum);
      //     this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
      //     // console.log(this.jobObj.deposit)
      //     this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
      //     this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

      //     this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
      //     this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      //     this.JobformGroup.controls['price'].setValue(this.jobObj.price);
      //   }

      //   // this.JobformGroup.controls['price'].setValue(this.sum)
      //   this.cdr.markForCheck();

      // }
    }
  }
  deleVal: any = {}
  deleteData(val) {
    this.modalService.open(this.confrimSalesBox);
    this.deleVal = val;

  }
  isDelete$: boolean = false;
  deleteItem() {

    // if (this.deleVal.ID == undefined) {
    //   const index = this.dataList.indexOf(this.deleVal, 0);
    //   if (index > -1) {
    //     this.dataList.splice(index, 1);
    //     this.isDelete$ = false;
    //     this.modalService.dismissAll()
    //     this.sum = Number(this.jobObj.price) - Number(this.deleVal.price)
    //     this.jobObj.price = this.sum

    //     this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
    //     this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
    //     this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit);

    //     this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
    //     this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
    //     this.totalQty = 0
    //     this.cdr.markForCheck()
    //   }
    // } else {

      const index = this.dataList.indexOf(this.deleVal, 0);
      if (index > -1) {
        this.dataList.splice(index, 1);
        this.totalQty = 0
        this.jobService.fetch()
        this.cdr.markForCheck()
      }
     
        this.invoiceTotal = Number(this.jobObj.price) - Number(this.jobObj.discount)
        this.JobformGroup.controls['totalPrice'].setValue(this.invoiceTotal);
        this.totalSum = Number(this.invoiceTotal) - Number(this.jobObj.deposit); 
        this.JobformGroup.controls['pendingPrice'].setValue(this.totalSum);
        this.paymentForm.controls['dueAmount'].setValue(this.totalSum);
      // console.log(this.deleVal)
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
              this.sum = Number(this.jobObj.price) - Number(this.deleVal.price)
              this.jobObj.price = this.sum
              this.JobformGroup.controls['price'].setValue(this.jobObj.price)
              this.deleVal = {};
              this.isDelete$ = false;
              this.updateInvoice('DeleteItem')
              this.modalService.dismissAll()
              this.cdr.markForCheck()

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    // }

  }
  closeDeleteItem() {
    this.modalService.dismissAll(this.confrimSalesBox)
  }
  addACItem() {
    // console.log(this.ACItemsGroup.value)
    this.ACItemsGroup.markAllAsTouched();
    if (!this.ACItemsGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.ACItemsGroup.value;
      this.ACCItemService.createAccompanying(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message);
              // this.createJobObj.acItems = this.ACItemsGroup.value.accompanyingName;
              this.getAllAccompanyings();
              this.ACItemsGroup.reset();
              this.ACItemsGroup.untouched;
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
   deletePaymentObj:any={}
   editDeletePayment(data) {
     this.deletePaymentObj = data;
     this.modalService.open(this.confrimPayment)
   }
   isDeletePayment$: boolean = false;
   deletePayment() { 
   
    this.invoiceData.deposit= Number(this.invoiceData.deposit) - Number( this.deletePaymentObj.amount)
    this.JobformGroup.controls['pendingPrice'].setValue(this.invoiceData.deposit);
    this.cdr.markForCheck()
    
     
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
        this.payType = obj.paymentType
        obj.jobId = this.jobObj.id;
        obj.addedBy = this.user.firstname + ' ' + this.user.lastname;
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

  
  closedeletePayment() {
    this.deletePaymentObj = {}
    this.modalService.dismissAll();
  }
  editACItemModal() {
    this.modalService.open(this.acItemopenModal);
    this.ACItemsGroup.reset();
  }
  closeACItem() {
    this.modalService.dismissAll(this.ACItemsGroup);
    this.ACItemsGroup.reset();
  }

  closeLocation() {
    this.modalService.dismissAll();
    this.locationGroup.markAsUntouched();

  }

  addLocation() {

    this.locationGroup.markAllAsTouched();
    if (!this.locationGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.locationGroup.value;
      // productObj.isWOOConnected	= this.formGroup.value
      this.storageLocationService.createStorage(Obj)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.jobObj.storageLocation = this.locationGroup.value.storageName;
              this.getAllStorageLocation()
              this.toastr.success(data.data.message)
              this.locationGroup.untouched;
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

  editStorageModal() {
    this.modalService.open(this.storageopenModal);
    this.locationGroup.reset();
  }

  addBrand() {

    this.brandGroup.markAllAsTouched();
    if (!this.brandGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.brandGroup.value;
      this.brandService.createBrand(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message);
              this.jobObj.brand = this.brandGroup.value.brandName;
              this.getAllBrands();
              this.brandGroup.reset();
              this.brandGroup.untouched;
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
  closeBrand() {
    this.modalService.dismissAll(this.brandGroup);
    this.brandGroup.reset();
  }

  editBrandModal() {
    this.modalService.open(this.brandopenModal);
    this.brandGroup.reset();
  }

  addItemType() {

    this.itemTypeGroup.markAllAsTouched();
    if (!this.itemTypeGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.itemTypeGroup.value;
      this.itemTypeService.createItemType(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message);
              this.jobObj.itemType = this.itemTypeGroup.value.itemTypeName;
              this.getAllItemTypes();
              this.itemTypeGroup.reset();
              this.itemTypeGroup.untouched;
              this.modalService.dismissAll();
              this.itemTypeService.fetch();
              this.isLoading$ = false;
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }

  }

  editItemModal() {
    this.modalService.open(this.itemopenModal);
    this.itemTypeGroup.reset();
  }
  closeItemTypeModal() {
    this.modalService.dismissAll(this.itemopenModal);
    this.itemTypeGroup.reset();
  }

  //Booked By

  getAllBookedByUser() {

    this.userService.getAllUsers()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.bookedByVal = [];
            this.assignToVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { bookedBy: element.firstname + ' ' + element.lastname };
              list.push(str);
            });
            this.bookedByVal = list;
            this.filteredbookedByMulti.next(this.bookedByVal.slice());
            this.bookedByMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterBookedBy()
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

  filterBookedBy() {
    if (!this.bookedByVal) {
      return;
    }
    // get the search keyword
    let search = this.bookedByMultiFilterCtrl.value;
    if (!search) {
      this.filteredbookedByMulti.next(this.bookedByVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredbookedByMulti.next(
      this.bookedByVal.filter(booked => booked.bookedBy.toLowerCase().indexOf(search) > -1 || booked.bookedBy.toUpperCase().indexOf(search) > -1)
    );
  }
  selectBookedBy(val) {
    console.log(val)
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
    this.jobService.patchState({ sorting });
  }
  filterCustomer() {
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
  // pagination
  paginate(paginator: PaginatorState) {
    this.jobService.patchState({ paginator });
  }

  backToMain() {
    this.jobObj = null;
    this.paymentObj = {};
    this.invoiceData = {};
    this.dataList = []
    this.dataList1 = []
    this.paymentList = []
    this.list = null;
    this.listPro = null;
    this.attachmentList = []
    this.isShow = false;
    this.changeOption('')
    this.jobService.fetch()
    this.cdr.markForCheck();
  }

  jobControlInvalid(controlName: string): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  jobcontrolHasError(validation, controlName): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  jobisControlTouched(controlName): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //Item Repair information
  repairControlInvalid(controlName: string): boolean {
    const control = this.itemRepairForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  repaircontrolHasError(validation, controlName): boolean {
    const control = this.itemRepairForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  // repairisControlTouched(controlName): boolean {
  //   const control = this.itemRepairForm.controls[controlName];
  //   return control.dirty || control.touched;
  // }


  //Item Repair Assignment
  repairassignControlInvalid(controlName: string): boolean {
    const control = this.repairAssignForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  repairassigncontrolHasError(validation, controlName): boolean {
    const control = this.repairAssignForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  repairassignControlTouched(controlName): boolean {
    const control = this.repairAssignForm.controls[controlName];
    return control.dirty || control.touched;
  }


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

  // Item type  
  isItemControlValid(controlName: string): boolean {
    const control = this.itemTypeGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isItemControlInvalid(controlName: string): boolean {
    const control = this.itemTypeGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isItemcontrolHasError(validation, controlName): boolean {
    const control = this.itemTypeGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isItemControlTouched(controlName): boolean {
    const control = this.itemTypeGroup.controls[controlName];
    return control.dirty || control.touched;
  }


  // Brand 
  isBrandControlValid(controlName: string): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isBrandControlInvalid(controlName: string): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isBrandcontrolHasError(validation, controlName): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isBrandControlTouched(controlName): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //Accompanying Items
  isACitemsControlValid(controlName: string): boolean {
    const control = this.ACItemsGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isACitemsControlInvalid(controlName: string): boolean {
    const control = this.ACItemsGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isACitemscontrolHasError(validation, controlName): boolean {
    const control = this.ACItemsGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isACitemsControlTouched(controlName): boolean {
    const control = this.ACItemsGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //storageLocation Select Form
  storageLocationSelectControlValid(controlName: string): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  storageLocationSelectControlInvalid(controlName: string): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  storageLocationSelectcontrolHasError(validation, controlName): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  storageLocationSelectControlTouched(controlName): boolean {
    const control = this.locationGroup.controls[controlName];
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
}


