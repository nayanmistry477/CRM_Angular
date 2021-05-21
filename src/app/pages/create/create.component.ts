import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';

import KTWizard from '../../../assets/js/components/wizard';
import { KTUtil } from '../../../assets/js/components/util';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { debounceTime, delay, tap, filter, map, takeUntil, take } from 'rxjs/operators';
import { ReferredByService } from 'src/app/modules/auth/_services/referredBy.service';
import { CustomersService } from 'src/app/modules/auth/_services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { ItemTypeService } from 'src/app/modules/auth/_services/itemType.service';
import { BrandService } from 'src/app/modules/auth/_services/brand.service';
import { AccompanyingService } from 'src/app/modules/auth/_services/accompanying.service';
import { EmployeeService } from 'src/app/modules/auth/_services/employee.service';
import { JobStatusService } from 'src/app/modules/auth/_services/jobStatus.service';
import { StorageService } from 'src/app/modules/auth/_services/storage.service';
import { ProductService } from 'src/app/modules/auth/_services/product.service';
import { ServicesService } from 'src/app/modules/auth/_services/services.service';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { async } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { resolve } from '@angular/compiler-cli/src/ngtsc/file_system';
import { promises } from 'fs';
import { element, promise } from 'protractor';
import { DesclaimerService } from 'src/app/modules/auth/_services/desclaimer.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TechnicianService } from 'src/app/modules/auth/_services/technicians.service';
interface Discount {
  id: string;
  name: string;
}
interface BookedBy {
  id: string;
  name: string;
}
interface Customer {
  customerType: string;
}
interface Items {
  id: string;
  name: string;
}
interface Brands {
  id: string;
  name: string;
}
interface ACItems {
  id: string;
  name: string;
}
interface RepairType {
  id: string;
  name: string;
}

interface AssignTo {
  id: string;
  name: string;

}
interface StorageLocation {
  id: string;
  name: string;

}
interface JobStatus {
  id: string;
  name: string;
}
interface TimeType {

  id: string;
  name: string;
}
interface Service {
  id: string;
  name: string;
  price: number;
}
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const API_USERS_URL = `${environment.apiUrl}/services`;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {
  @ViewChild('wizard', { static: true }) el: ElementRef;
  @ViewChild('statusopenModal') statusopenModal: TemplateRef<any>;
  @ViewChild('storageopenModal') storageopenModal: TemplateRef<any>;

  @ViewChild('openModal') openModal: TemplateRef<any>;
  @ViewChild('itemopenModal') itemopenModal: TemplateRef<any>;
  @ViewChild('brandopenModal') brandopenModal: TemplateRef<any>;
  @ViewChild('acItemopenModal') acItemopenModal: TemplateRef<any>;
  @ViewChild('serviceopenModal') serviceopenModal: TemplateRef<any>;
  @ViewChild('productopenModal') productopenModal: TemplateRef<any>;
  @ViewChild('swiper') swiper: ElementRef;
  colorCtr: AbstractControl = new FormControl(null);
  public customerMultiFilterCtrl: FormControl = new FormControl();
  /** list of banks filtered by search keyword for multi-selection */
  public filteredDiscountMulti: ReplaySubject<Discount[]> = new ReplaySubject<Discount[]>(1);
  public filteredCustomerMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredCustomerContactMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredItemMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredBrandMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filteredACItemsMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredbookedByMulti: ReplaySubject<BookedBy[]> = new ReplaySubject<BookedBy[]>(1);

  public filteredcustomerTypeMulti: ReplaySubject<Customer[]> = new ReplaySubject<Customer[]>(1);
  public customerTypeMultiFilterCtrl: FormControl = new FormControl();

  public filteredassignToMulti: ReplaySubject<AssignTo[]> = new ReplaySubject<AssignTo[]>(1);
  public filteredLocationMulti: ReplaySubject<StorageLocation[]> = new ReplaySubject<StorageLocation[]>(1);
  public filteredjobStatusMulti: ReplaySubject<JobStatus[]> = new ReplaySubject<JobStatus[]>(1);

  public filteredtimeTypeMulti: ReplaySubject<RepairType[]> = new ReplaySubject<RepairType[]>(1);

  protected _onDestroy = new Subject<void>();

  public filteredreferralMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public referralMultiFilterCtrl: FormControl = new FormControl();
  private referralsVal: any[] = [];
  minDate = new Date();



  uploader: FileUploader;
  isLoading$
  isLoadingUpdate: Boolean = false;
  model: any = {}
  formGroup: FormGroup;
  jobStatusGroup: FormGroup;
  addressGroup: FormGroup
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  customerGroup: FormGroup;
  customerForm: FormGroup;
  itemTypeGroup: FormGroup;
  brandGroup: FormGroup;
  ACItemsGroup: FormGroup;
  RepairGroup: FormGroup;
  ServiceformGroup: FormGroup;
  productGroup: FormGroup;
  step1FormGroup: FormGroup;
  step2FormGroup: FormGroup;
  locationGroup: FormGroup;

  step3FormGroup: FormGroup;
  public searching: boolean = false;
  submitted = false;
  wizard: any;
  selectedIndex = 0;
  flag: boolean = true;
  flag1: boolean = false;
  flag2: boolean = false;
  flag3: boolean = false;
  files: File[] = [];
  public repaiTypeList = [];
  public dataList: any = [];
  public serviceList: any = [];
  list: any = {}
  job: any = {
    id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    customerType: '',
    contactNo: '',
    companyName: '',
    referredBy: '',
    address: '',
    postCode: '',
    customer: '',
    customerContact: '',
    itemType: '',
    brand: '',
    acItems: '',
    serialNo: '',
    damageAssesment: '',
    password: '',
    itemComment: '',
    warranty: '',

    bookedBy: '',
    repairType: '',
    repairDesc: '',
    assignTo: '',
    estCompletionDate: '',
    barcode: '',
    storageLocation: '',
    jobStatus: '',

    deposit: '',
    price: '',

  };

  product: any = {
    wooProductID: undefined,
    sellPrice: '',
    costPrice: '',
    productName: '',
    isWOOConnected: false
  };
  itemTypeObj: any = {
    itemTypeName: '',
  }

  brandObj: any = {
    brandName: ''
  }

  acItemObj: any = {
    ACItemName: ''
  }

  repairTimeObj: any = {
    repairName: '',
    estTime: '',
    timeType: '',
    repairPrice: '',
    taxRate: ''
  }
  private discountVal: Discount[] = [
    { name: 'Bank A (Switzerland)', id: 'A' },
    { name: 'Bank B (India)', id: 'B' },
  ];

  private customerVal: any[] = [];
  private customerTypeVal: Customer[] = [
    { customerType: 'Retail Customer', },
    { customerType: 'Trade Customer', },
  ];
  private itemVal: any[] = [];

  private brandsVal: any[] = [];

  private acItemsVal: any[] = [];
  private bookedByVal: any[] = [];

  private repairTypeVal: RepairType[] = [
    { name: 'Sample Repair Type', id: '1' },
    { name: 'Laptop Full Upgrade', id: '2' },
    { name: 'windows key', id: '3' },
    { name: 'SSD 250', id: '4' },
  ];
  private assignToVal: any[] = [];
  private storageLocationVal: any[] = [];

  private jobStatusVal: any[] = [];

  private timeType: RepairType[] = [
    { name: 'Hours', id: '1' },
    { name: 'Days', id: '2' },
    { name: 'Weeks', id: '3' },
    { name: 'Months ', id: '4' },

  ];

  private serviceVal: any[] = [];
  private productVal: any[] = [];
  public demoArr: any = ['demoo', 'demo2']
  @ViewChild('singleSelect') singleSelect: MatSelect;

  public discountCtrl: FormControl = new FormControl();
  public discountMultiFilterCtrl: FormControl = new FormControl();


  public customerContactMultiFilterCtrl: FormControl = new FormControl();

  public itemMultiFilterCtrl: FormControl = new FormControl();
  public brandMultiFilterCtrl: FormControl = new FormControl();
  public ACItemsMultiFilterCtrl: FormControl = new FormControl();

  public bookedByMultiFilterCtrl: FormControl = new FormControl();
  public repairTypeMultiFilterCtrl: FormControl = new FormControl();

  public assignToMultiFilterCtrl: FormControl = new FormControl();
  public LocationMultiFilterCtrl: FormControl = new FormControl();

  public jobStatusMultiFilterCtrl: FormControl = new FormControl();

  public timeTypeMultiFilterCtrl: FormControl = new FormControl();

  public filteredServiceMulti: ReplaySubject<Service[]> = new ReplaySubject<Service[]>(1);

  public serviceMultiFilterCtrl: FormControl = new FormControl();
  public filteredProductMulti: ReplaySubject<Product[]> = new ReplaySubject<Product[]>(1);


  public productMultiFilterCtrl: FormControl = new FormControl();

  public toppings = new FormControl();
  token: any = {}
  editMode: any;
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
  user: any = {}
  constructor(private fb: FormBuilder,
    public referredByService: ReferredByService, private toastr: ToastrService,
    private modalService: NgbModal,
    public brandService: BrandService,
    public itemTypeService: ItemTypeService,
    public ACCItemService: AccompanyingService,
    public storageLocationService: StorageService,
    public productService: ProductService,
    public jobStatusService: JobStatusService,
    public servicesService: ServicesService,
    private router: Router,
    private desclaimerService: DesclaimerService,
    public http: HttpClient,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public userService: EmployeeService,
    public technicianService: TechnicianService,
    public customerService: CustomersService, public cdr: ChangeDetectorRef) {
    this.modalService.dismissAll()

    this.uploader = new FileUploader({
      // url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: (item) => {
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
  bookedObj: any = {}

  headerDemo : any;
  ngOnInit(): void {
    var token = JSON.parse(localStorage.getItem('token'))
    this.user = token.user.firstname+' '+token.user.lastname
    this.token = token.accessToken
 
    this.getAllReferredBys();
    this.getAllCustomers();
    this.getAllItemTypes();
    this.getAllBrands();
    this.getAllAccompanyings()
    this.getAllBookedByUser();
    this.getAllAssignToUser();
    this.getAllJobStatus();
    this.getAllStorageLocation();
    this.getAllProducts();
    this.getAllServices();
    this.getDesclaimer();
    // this.fileterCustomerContact()
 
    // load the initial bank list 


    var script = document.createElement('script');
    script.src = './assets/js/components/color.js';
    script.type = 'text/javascript';
    this.elementRef.nativeElement.appendChild(script);

    this.filteredcustomerTypeMulti.next(this.customerTypeVal.slice());

    this.customerTypeMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.fileterTypeCustomer()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });

    this.filteredtimeTypeMulti.next(this.timeType.slice());
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

    this.timeTypeMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filterTimeType()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });

    this.formGroup = this.fb.group({
      id: [''],
      customerType: [this.job.customerType, Validators.compose([Validators.required])],
      firstName: [this.job.firstName, Validators.compose([Validators.required])],
      lastName: [this.job.lastName, Validators.compose([Validators.required])],
      contactNo: [this.job.contactNo,  ],
      referredBy: [this.job.referredBy],
      companyName: [this.job.companyName,],
      email: [this.job.email, ],
      address: [this.job.address, ],
      postCode: [this.job.postCode],
    });


    this.step1FormGroup = this.fb.group({
      id: [''],
      customer: ['', [Validators.required]],
      customerEmail: ['',Validators.compose([  Validators.email])],
      customerContact: [this.job.customerContact, Validators.compose([ Validators.minLength(11), Validators.maxLength(11)])],
      customerAddress: ['']
    })
    this.step2FormGroup = this.fb.group({
      itemType: [this.job.itemType, Validators.compose([Validators.required])],
      brand: [this.job.brand, Validators.compose([Validators.required])],
      acItems: [this.job.acItems, Validators.compose([Validators.required])],
      serialNo: [this.job.serialNo],
      damageAssesment: [this.job.damageAssesment,],
      password: [this.job.password],
      itemComment: [this.job.itemComment,],
      warranty: [this.job.warranty],
    })

    this.step3FormGroup = this.fb.group({

      bookedBy: [this.job.bookedBy, Validators.compose([Validators.required])],
      repairDesc: [this.job.repairDesc],
      estCompletionDate: [''],
      barcode: [this.job.barcode],
      // assignTo: [this.job.assignTo, Validators.compose([Validators.required])],
      storageLocation: [this.job.storageLocation, Validators.compose([Validators.required])],
      jobStatus: [this.job.jobStatus, Validators.compose([Validators.required])],
      service: [''],
      product: [''],
      deposit: [this.job.deposit],
      price: [this.job.price, Validators.compose([Validators.required])],
      additionalNotes: [''],
      technicianNotes: ['']

      // jobApproval: [this.job.jobApproval],
      // quoteRequired: [this.job.quoteRequired],
      // paid: [this.job.paid],
    })

    this.itemTypeGroup = this.fb.group({

      itemTypeName: [this.itemTypeObj.itemTypeName, Validators.compose([Validators.required])]

    });
    this.brandGroup = this.fb.group({

      brandName: [this.brandObj.brandName, Validators.compose([Validators.required])]
    });

    this.ACItemsGroup = this.fb.group({

      accompanyingName: ['', Validators.compose([Validators.required])]

    });

    this.RepairGroup = this.fb.group({

      repairName: [this.repairTimeObj.repairName, Validators.compose([Validators.required])],
      estTime: [this.repairTimeObj.estTime, Validators.compose([Validators.required])],
      timeType: [this.repairTimeObj.timeType, Validators.compose([Validators.required])],
      repairPrice: [this.repairTimeObj.repairPrice, Validators.compose([Validators.required])],
      taxRate: [this.repairTimeObj.taxRate, Validators.compose([Validators.required])]
    });

    this.ServiceformGroup = this.fb.group({
      serviceName: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
    });

    this.productGroup = this.fb.group({
      productName: [this.product.productName, Validators.compose([Validators.required,])],
      sellPrice: [this.product.sellPrice, Validators.compose([Validators.required,])],
      costPrice: [this.product.costPrice],
    });

    this.jobStatusGroup = this.fb.group({
      id: [''],
      statusType: ['', Validators.compose([Validators.required])],
      statusStage: ['', Validators.compose([Validators.required])],
      statusColor: ['', Validators.compose([Validators.required])]

    });
    this.locationGroup = this.fb.group({
      id: [''],
      storageName: ['', Validators.compose([Validators.required])]
    })

    this.step3FormGroup.controls['bookedBy'].setValue(this.user)
    // this.bookedObj = this.user
  }

  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
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
              str = { itemType: element.itemTypeName };
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
  // fileterCustomerContact() {

  //   this.customerContactMultiFilterCtrl.valueChanges
  //     .pipe(
  //       filter(search => !!search),
  //       tap(() => this.searching = true),
  //       takeUntil(this._onDestroy),
  //       debounceTime(200),
  //       map(search => {
  //         if (!this.customerVal) {
  //           return [];
  //         }

  //         // simulate server fetching and filtering data
  //         return this.customerVal.filter(cust => cust.mobile.toString().indexOf(search) > -1);
  //       }),
  //       delay(500)
  //     )
  //     .subscribe(filteredBanks => {
  //       this.searching = false;
  //       this.filteredCustomerContactMulti.next(filteredBanks);

  //     },
  //       error => {
  //         // no errors in our simulated example
  //         this.searching = false;
  //         // handle error...
  //       });
  // }
  selectReferredBy(val) {
    // console.log(val)
  }

  getAllReferredBys() {

    this.referredByService.getAllReferredBys()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.referralsVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { referredBy: element.referredBy };
              list.push(str);
            });
            this.referralsVal = list;
            this.filteredreferralMulti.next(this.referralsVal.slice());
            this.referralMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.filterReferrals()
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


  filterReferrals() {
    if (!this.referralsVal) {
      return;
    }
    // get the search keyword
    let search = this.referralMultiFilterCtrl.value;
    if (!search) {
      this.filteredreferralMulti.next(this.referralsVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredreferralMulti.next(
      this.referralsVal.filter(item => item.referredBy.toLowerCase().indexOf(search) > -1 || item.referredBy.toUpperCase().indexOf(search) > -1)
    );
  }

  getAllCustomers() {

    this.customerService.getAllCustomers()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.customerVal = [];
          } else {
            var list = [];
            var str = {}
            data.result.forEach( element => {
              str = { id: element.id, email: element.email, contactNo: element.contactNo, address: element.address, name: element.firstName + ' ' + element.lastName };
              list.push(str);
            });
            this.customerVal = list;
            // this.filteredCustomerMulti.next(this.customerVal.slice());
            this.customerMultiFilterCtrl.valueChanges
              .pipe(
                takeUntil(this._onDestroy))
              .subscribe(() => {
                this.searching = false;
                this.fileterCustomer()
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



  fileterCustomer() {
    var sch;
    this.customerMultiFilterCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        map( search => {
          if (!this.customerVal) {
            return [];
          } 
          // simulate server fetching and filtering data
          sch =  this.customerVal.filter(cust => cust.name.toLowerCase().indexOf( search.toLowerCase()) > -1 || cust.name.toUpperCase().indexOf( search.toLowerCase()) > -1 );

          
        // this.customerVal.filter(cust => cust.name.toLowerCase().indexOf( search.toLowerCase()) > -1 || cust.name.toUpperCase().indexOf( search.toLowerCase()) > -1 || cust.email.toLowerCase().indexOf( search.toLowerCase()) > -1 || cust.contactNo.toString().indexOf( search.toLowerCase()) > -1);
          // console.log(sch)
        }),
        delay(500)
      )
      .subscribe( filteredCustomer => {
        this.searching = false;
        this.filteredCustomerMulti.next(sch);

      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
  }

  fileterTypeCustomer() {

    this.customerTypeMultiFilterCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        map(search => {
          if (!this.customerTypeVal) {
            return [];
          }

          // simulate server fetching and filtering data
          return this.customerTypeVal.filter(cust => cust.customerType.toLowerCase().indexOf(search) > -1 || cust.customerType.toUpperCase().indexOf(search) > -1);
        }),
        delay(500)
      )
      .subscribe(filteredBanks => {
        this.searching = false;
        this.filteredcustomerTypeMulti.next(filteredBanks);

      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
  }
  filterDiscount() {
    if (!this.discountVal) {
      return;
    }
    // get the search keyword
    let search = this.discountMultiFilterCtrl.value;
    if (!search) {
      this.filteredDiscountMulti.next(this.discountVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredDiscountMulti.next(
      this.discountVal.filter(bank => bank.name.toLowerCase().indexOf(search) > -1 || bank.name.toUpperCase().indexOf(search) > -1)
    );
  }



  //Products
  totalQty: number = 0
  productData: any;
  listPro:any={}
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
            this.toastr.error(data.message)

          } else {
            // console.log(data)
            if (data.result) {
              this.totalQty = data.result[0].totalQty;
              // console.log(data.result[0].totalQty)
            } else {
              this.totalQty = 0
            }
            this.cdr.markForCheck();

            // this.saleQty = data.result[0].saleQty;


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
              str = {serviceID:element.serviceID, service: element.serviceName, price: element.price, id: element.id }

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
          }
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



  editProductModal() {
    this.modalService.open(this.productopenModal);
    this.productGroup.reset();
  }
  closeProductModal() {
    this.modalService.dismissAll(this.productopenModal);
    this.productGroup.reset();
  }

  proOrgPrice: number = 0;
  incPrice: number = 0;
  temp: any;
  async increment(job) {
    // console.log(job)
    var valData = {
      productID: job.id
    }
    this.productService.getAllPurchaseCount(valData)
      .subscribe(async data => {
          this.cdr.markForCheck()
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
                //  this.quantity ++ 
                this.sum = Number(this.sum) + Number(this.productData.sellPrice)
              }
      
              this.dataList.forEach(element => {
      
                if (element.id === this.productData.id) element.price = Number(element.price) + Number(this.productData.sellPrice);
              })
            }
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });

    // if (this.productData == undefined) {
    //   // job.quantity++
    //   // //  this.quantity ++ 
    //   // this.sum = Number(this.sum) + Number(job.price)

    //   // this.dataList.forEach(element => {
    //   //   if (element.id === job.id) element.price = Number(element.price) + Number(job.price);
    //   // })

    //   var id = {
    //     id: job.id
    //   }
    //   this.productService.getProductByProductID(id)
    //     .subscribe(
    //       data => {

    //         if (data.status == 0) {
    //           this.toastr.error(data.message)
    //         } else {

    //           this.incPrice = data.result[0].sellPrice;
    //           // this.toastr.error('Service is already added in job');
    //           job.quantity++
    //           this.sum = Number(this.sum) + Number(this.incPrice);
    //           this.dataList.forEach(element => {
    //             if (element.id === job.id) {
    //               element.price = Number(element.price) + Number(this.incPrice);

    //             }
    //           });
    //           this.cdr.markForCheck()
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
  decrementPrice: number = 0
  async decrement(job) {
    if (job.quantity <= 0 && job.quantity == -1) {
      job.quantity = 1;
      this.sum = 0;
    } else {

      var valData = {
        productID: job.id,
      }

      this.productService.getAllPurchaseCount(valData)
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
                this.sum = Number(this.sum) - Number(this.productData.sellPrice)
                this.dataList.forEach(element => {
      
                  if (JSON.parse(element.id) === this.productData.id) {
                    element.price = Number(element.price) - Number(this.productData.sellPrice);
                  }
                });
                // console.log(this.sum);
              }
      
              // this.JobformGroup.controls['price'].setValue(this.sum)
              this.cdr.markForCheck();
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

      //           this.decrementPrice = data.result[0].sellPrice;

      //           job.quantity--
      //           //  this.quantity ++ 
      //           //  console.log(Number(this.dataList[i].quantity))
      //           //  this.sum = Number(this.dataList[i].quantity) * Number(this.orgPrice)
      //           this.sum = Number(this.sum) - Number(this.decrementPrice)


      //           this.dataList.forEach(element => {
      //             if (element.id === job.id) {

      //               element.price = Number(element.price) - Number(this.decrementPrice);
      //             }

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
      //     this.sum = Number(this.sum) - Number(this.productData.sellPrice)
      //     this.dataList.forEach(element => {

      //       if (JSON.parse(element.id) === this.productData.id) {
      //         element.price = Number(element.price) - Number(this.productData.sellPrice);
      //       }
      //     });
      //     // console.log(this.sum);
      //   }

      //   // this.JobformGroup.controls['price'].setValue(this.sum)
      //   this.cdr.markForCheck();

      // }
    }
  }

  // async decrement(job) {
  //   if (job.quantity <= 0 && job.quantity == -1) {
  //     job.quantity = 1;
  //     this.sum = 0;
  //   } else {

  //     var valData = {
  //       productID: job.id
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
  //     job.quantity--

  //     if (this.productData.id == job.id) {
  //       this.sum = Number(this.sum) - Number(this.productData.sellPrice)

  //       this.dataList.forEach(element => {

  //         if (element.id === this.productData.id) element.price = Number(element.price) - Number(this.productData.sellPrice)
  //       })
  //     }
  //     this.cdr.markForCheck();

  //   }
  // }
  editText: any = {};
  indexVal: number;
  editModeCheck(i, x, data) {
    // console.log(data)
    // this.renderer.selectRootElement('#myInput').focus();

    document.getElementById('myInput').focus()

    this.editMode = !this.editMode

    if (i == x) {
      // this.isShow = true;
      this.editMode = x;
      return false;
    }
  }



  editPrice(item, newPrice) {

    this.dataList.forEach(element => {
      if (element.id == item.id) {
        var total;

        if (Number(newPrice) >= Number(item.price)) {

          var old = this.sum - Number(item.price);
          this.sum = Number(old) + Number(newPrice);
          // var productDetails= this.dataList.filter(p=>p.product.toLowerCase()==productName.toLowerCase());

        }
        if (Number(newPrice <= Number(item.price))) {
          total = Number(item.price) - Number(newPrice)
          this.sum = this.sum - total;
        }
        if (element.id == item.id) {
          element.price = Number(newPrice)
        }
      }

    });

    // this.dataList.push( this.dataList)
    // console.log(this.dataList)


  }
  priceVal: string;

  editModeSave(i, x, item) {
    if(Number(this.priceVal)<=0){
        this.toastr.error('Please enter valid amount')
    }else{

   
    if (this.priceVal == undefined  ) {
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
      // var newPrice = ((document.getElementById("priceVal") as HTMLInputElement).value);
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
  selectDiscount(val) {
    // console.log(val)
  }
  orgPrice: number = 0

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
        // console.log(this.dataList)
        this.step3FormGroup.controls['service'].reset();
        this.sum = Number(this.sum) + Number(this.list.price)
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

                  this.orgPrice = data.result[0].price;
                  // this.toastr.error('Service is already added in job');
                  result.quantity++
                  this.sum = Number(this.sum) + Number(this.orgPrice);
                  this.dataList.forEach(element => {
                    if (element.id === result.id) {
                      element.price = Number(element.price) + Number(this.orgPrice);

                    }
                  });

                  this.step3FormGroup.controls['service'].reset();
                  // this.sum = Number(this.sum) + Number(result.price)
                  result = [];
                  this.list = [];
                  this.cdr.markForCheck()
                }
              },
              error => {
                console.log(error);
              });


        } else {
          this.dataList.push(data)
          this.step3FormGroup.controls['service'].reset();
          this.sum = Number(this.sum) + Number(this.list.price)
          this.list = []
          this.cdr.markForCheck()
        }
      }


    } else {
      this.toastr.error('Please Select Service')

    }

  }

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
        this.step3FormGroup.controls['product'].reset();
        this.sum = Number(this.sum) + Number(this.listPro.price)
        this.listPro = []
        

      } else {

        var result = this.dataList.filter(res => res.name == this.listPro.product)[0];
        if (result != null) {
          // this.toastr.error('Product is already added in job');
          
          if (result.quantity >= this.totalQty) {
            this.toastr.error("Product stock gone its limit")
          } else {
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
                  this.sum = Number(this.sum) + Number(this.proOrgPrice);
                  this.dataList.forEach(element => {
                    if (element.id === result.id) {
                      element.price = Number(element.price) + Number(this.proOrgPrice);

                    }
                  });

                  this.step3FormGroup.controls['product'].reset();
                  // this.sum = Number(this.sum) + Number(result.price)
                  result = [];
                  this.listPro = [];
                  this.cdr.markForCheck();
                }
              },
              error => {
                console.log(error);
              });
            }
        } else {
         
            this.dataList.push(data)
            this.step3FormGroup.controls['product'].reset();
            this.sum = Number(this.sum) + Number(this.listPro.price)
            this.listPro = [];
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
              this.createJobObj.product = this.productGroup.value.productName;
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

  selectItem(items) {
    // console.log(items)
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
  selectBrand(items) {
    // console.log(items)
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
              str = { id: element.id, bookedBy: element.firstname + ' ' + element.lastname };
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
  bookedData:any={}
  selectBookedBy(val) {
    // console.log(val)

    var result = this.bookedByVal.filter(res => res.id == val)[0]
    // this.step3FormGroup.controls['bookedBy'].setValue(result.bookedBy)
    this.bookedData = result;

  }

  selectACItems(val) {
    // console.log(val)
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
              str = {id:element.id, assignTo: element.firstname + ' ' + element.lastname };
              list.push(str);
            });
            this.assignToVal = list; 
            // console.log(this.assignToVal)
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
  assignedToData:any={}
  selectAssignTo(val) {
    console.log(val)
    var result = this.assignToVal.filter(res =>res.id == val)[0];
    this.assignedToData = result;
    console.log(this.assignedToData)
  }

  //Storage Location 

  getAllStorageLocation() {

    this.storageLocationService.getAllStorages()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.storageLocationVal = [];
            this.assignToVal = []
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
    // console.log(val)
  }

  //Job Status

  getAllJobStatus() {

    this.jobStatusService.getAllJobStatus()
      .subscribe(
        data => {
          if (data.status == 0) {
            this.jobStatusVal = [];
            this.assignToVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = {id:element.id,statusStage:element.statusStage, jobStatus: element.statusType };
              list.push(str);
            });
            this.jobStatusVal = list; 
            var result;
             result = this.jobStatusVal.filter(res => res.jobStatus == "pending")[0];
          //  console.log(result) 
            this.createJobObj.jobStatus = result.jobStatus; 
            this.createJobObj.statusStage = result.statusStage
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
   this.createJobObj.jobStatus = result.jobStatus; 
   this.createJobObj.statusStage = result.statusStage
  }

  filterTimeType() {
    if (!this.timeType) {
      return;
    }
    // get the search keyword
    let search = this.timeTypeMultiFilterCtrl.value;
    if (!search) {
      this.filteredtimeTypeMulti.next(this.timeType.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredtimeTypeMulti.next(
      this.timeType.filter(timeType => timeType.name.toLowerCase().indexOf(search) > -1 || timeType.name.toUpperCase().indexOf(search) > -1)
    );
  }

  previousVal: Boolean = false;

  previous() {

    this.previousVal = true;
  }

  steps: any = {}
  demoClick() {
    // this.steps = 1;
    //  console.log(this.steps)
    if (this.steps == 1) {
      this.step1FormGroup.markAllAsTouched();
      if (!this.step1FormGroup.valid) {
        return
      }
    }
    if (this.steps == 2) {
      this.step2FormGroup.markAllAsTouched();
      if (!this.step2FormGroup.valid) {
        return
      }
    }
     if(this.steps == 3){
      this.step3FormGroup.markAllAsTouched();
      if (!this.step3FormGroup.valid) {   
      return   
      }
     }


  }
  ngAfterViewInit() {
    // Initialize form wizard
    // this.setInitialValue();
    this.wizard = new KTWizard(this.el.nativeElement, {
      startStep: this.steps,
      clickableSteps: true,

    });

    // Validation before going to next page
    this.wizard.on('change', (wizardObj) => {

      // console.log(wizardObj.currentStep)
      // console.log(wizardObj.getStep())
      if (this.previousVal == false) {
        // this.step1FormGroup.markAllAsTouched();
        if (wizardObj.currentStep === 1) {
          this.steps = 1
          if (!this.step1FormGroup.valid) {

            wizardObj.stop();


          } else {

            wizardObj.goNext();
          }
        }
        if (wizardObj.currentStep === 2) {
          this.steps = 2
          // this.step2FormGroup.markAllAsTouched();
          if (!this.step2FormGroup.valid) {

            wizardObj.stop();


          } else {

            wizardObj.goNext();
          }
        }
        if (wizardObj.currentStep === 3) {
          this.steps = 3
          // this.step3FormGroup.markAllAsTouched();
          if (!this.step3FormGroup.valid) {

            wizardObj.stop();


          } else {

            return
          }
        }
      } else {
        this.previousVal = false;
        this.steps  ={}
        wizardObj.goPrev();
      }
      // https://angular.io/guide/forms
      // https://angular.io/guide/form-validation

      // validate the form and use below function to stop the wizard's step
      wizardObj.stop();
    });

    // Change event
    this.wizard.on('change', () => {
      setTimeout(() => {
        KTUtil.scrollTop();
      }, 500);
    });

  }

  changeWarranty(item) {
    // console.log(item)
  }

  // Submit() {
  //   this.flag1 = false;
  //   console.log(this.formGroup.value)
  // }

  Submit() {

    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    } else {
      this.flag1 = false;
      const registerUser = this.formGroup.value;
      if (this.formGroup.value.referredBy != undefined && this.formGroup.value.referredBy != null) {
        var referredBy = this.formGroup.value.referredBy

        registerUser.referredBy = referredBy;
      }

      this.isLoading$ = true;
      this.customerService.createCustomer(registerUser)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.getAllCustomers()
              this.formGroup.reset();
              this.formGroup.untouched;
              this.modalService.dismissAll();
              this.customerService.fetch();
              this.isLoading$ = false;
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }



  list1: any = []
  onSubmitService(id) {

    var num = Math.floor(Math.random() * 9000) + 1000;
    var ID = new Date().getFullYear() + num;


    var str = {}
    // this.dataList.forEach(element => {
    //   console.log(element)
    //   if (element.service == '1') {
    //     str = { productID: null, jobID: id, name: element.name, quantity: 1, price: element.price }

    //   } else {
    //     str = { productID: element.id, jobID: id, name: element.name, quantity: element.quantity, price: element.price }

    //   }
    //   this.list1.push(str);

    // });

    this.dataList.forEach(element => {

      if (element.type != 'service') {
        str = { ID: element.ID, productID: element.id, jobID: id, name: element.name, quantity: element.quantity, price: element.price,unitPrice:element.unitPrice  }
      } else {
        str = { ID: element.ID, serviceID: element.id, jobID: id, name: element.name, quantity: element.quantity, price: element.price }
      }
      this.list1.push(str);

    });

    this.serviceList = this.list1;
    // console.log(this.list1)

    if (this.list1.length != null && this.list1 != "") {

      //  alert('done')

      this.isLoading$ = true;
      this.servicesService.createProduct_ServiceFinal(this.list1)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              // this.toastr.success(data.data.message)
              this.dataList = [];
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    } else {

      this.toastr.error('Please Add Items First')

    }


  }

  fileData: File = null;
  fileObj: any = {}
  onFileSelect(event, param) {
    // this.uploadAttachment(1)
    // this.uploader
    // console.log(this.uploader.queue)
    // if (event.target.files.length > 0) {
    //   const file = event.target.files
    //   // this.formData.append('file', file, file.name);  
    //   console.log(file);

    //   // this.step2FormGroup.get('attachment').setValue(file);
    //   this.fileData = file; 

    //   this.fileObj = this.fileData
    //   // this.Addimage(file);
    // }

    // event.addedFiles.forEach(element => {
    //   this.files.push(element)
    // });
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
 uploadAttachment(id) {

    //   if(this.files.length !=0)
    //   {
    //   for (let j = 0; j < this.files.length; j++) {
    //     let data = new FormData();
    //     let fileItem = this.files[j]
    //     data.append('file', fileItem);
    //     this.uploadFile(id, data);
    //   }
    // }  

    // for (let i = 0; i < this.uploader.queue.length; i++) {
    //   let fileItem = this.uploader.queue[i]._file;
    //   if(fileItem.size > 10000000){
    //     alert("Each File should be less than 10 MB of size.");
    //     return;
    //   }
    // }

    for (let j = 0; j < this.uploader.queue.length; j++) {
      let data = new FormData();
      let fileItem = this.uploader.queue[j]._file;
      // console.log(fileItem.name);
      data.append('file', fileItem);
      this.uploadFile(id, data)
      // console.log(data)
    }

  }

  async uploadFile(id, data: FormData) {

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

  await  new Promise(() => {
      // your upload code
      this.http.post<any>(`${API_USERS_URL}/createAttachment/` + id, data, { headers: httpHeaders, reportProgress: true, observe: 'events' })
        .subscribe(async event => {
          if (event.type === HttpEventType.UploadProgress) {
          } else if (event instanceof HttpResponse) {
            if (event.status == 200) {

              if (event.body.data.status == 0) {

              } else {
                this.dataList = [];
                this.step1FormGroup.untouched
                this.step1FormGroup.reset()
                this.step2FormGroup.untouched
                this.step2FormGroup.reset()
                this.step3FormGroup.untouched
                this.step3FormGroup.reset()
                this.createJobObj = {};
                this.isLoading$ = false;
                this.uploader.clearQueue()
                this.router.navigate(['/open-job'])
              }
            }

          }

        },
          error => {
            console.log(error);
            this.dataList = [];
            this.step1FormGroup.untouched
            this.step1FormGroup.reset()
            this.step2FormGroup.untouched
            this.step2FormGroup.reset()
            this.step3FormGroup.untouched
            this.step3FormGroup.reset()
            this.createJobObj = {};
            this.isLoading$ = false;
            this.uploader.clearQueue()
            this.router.navigate(['/open-job'])
            this.toastr.error("Attachment upload filed");
          });
    });


  }


  contact: any = {}
  customerInfo: any = {}
  isContact: boolean = false;
  selectCustomer(val) {
    console.log(val)
    this.customerInfo = val
    var data = val;

    if (data == null && data == undefined && data == "") {
      this.isContact = false;
    } else {
      this.isContact = true;
    }
    this.step1FormGroup['id'] = data.id 
    this.step1FormGroup['customerContact'] = data.contactNo
    this.step1FormGroup['customerEmail'] = data.email
    this.step1FormGroup['customerAddress'] = data.address
    this.step1FormGroup['postCode'] = data.postCode

    this.contact = data;
  }
  onSubmit() {

    // this.step1FormGroup.markAllAsTouched();
    // this.step2FormGroup.markAllAsTouched(); 

    this.step3FormGroup.markAllAsTouched();
    if (!this.step3FormGroup.valid) {
      this.toastr.error('Please Select Item')
      return
    }
    else {
    if (this.dataList.length != 0) {
     
        var allData = new FormData()

        var setval;
        setval = this.step2FormGroup.value.acItems.toString().replace("[", "").replace("]", "");
        var getval = setval.toString()


        // var num = Math.floor(Math.random() * 9000) + 1000;
        // var ID = new Date().getFullYear() + num;
        // allData.append('productID', JSON.stringify(ID));
        allData.append('customerID', this.step1FormGroup.value.customer.id);

        allData.append('customer', this.step1FormGroup.value.customer.name);
        allData.append('customerContact', this.step1FormGroup.value.customerContact);
        allData.append('customerEmail', this.step1FormGroup.value.customerEmail);
        allData.append('postCode', this.step1FormGroup.value.postCode);
        if(this.step1FormGroup.value.customerAddress == "null" ||this.step1FormGroup.value.customerAddress == null ){
          allData.append('address', "");
        }else{
          allData.append('address', this.step1FormGroup.value.customerAddress);
        }
        allData.append('itemType', this.step2FormGroup.value.itemType);
        allData.append('brand', this.step2FormGroup.value.brand);
        allData.append('accompanying', getval);
        allData.append('damageAsses', this.step2FormGroup.value.damageAssesment);
        allData.append('serialNo', this.step2FormGroup.value.serialNo);
        allData.append('password', this.step2FormGroup.value.password);
        allData.append('itemComment', this.step2FormGroup.value.itemComment);
        allData.append('underWarranty', this.step2FormGroup.value.warranty);
        allData.append('file1', '');
        allData.append('bookedBy', this.step3FormGroup.value.bookedBy);
        // allData.append('barcode', this.step3FormGroup.value.barcode);
        // allData.append('assignedTo', this.assignedToData.assignTo);
        // allData.append('assignedToID', this.assignedToData.id); 
        allData.append('jobStatus', this.step3FormGroup.value.jobStatus.toLowerCase());
        allData.append('statusStage',  this.createJobObj.statusStage); 
        allData.append('storageLocation', this.step3FormGroup.value.storageLocation);
        allData.append('estDate', this.step3FormGroup.value.estCompletionDate);
        allData.append('repairDescription', this.step3FormGroup.value.repairDesc);
        allData.append('price', this.step3FormGroup.value.price);
        if(this.step3FormGroup.value.deposit == "" || this.step3FormGroup.value.deposit == null){
          allData.append('deposit','0');
        }else{
         
          allData.append('deposit', this.step3FormGroup.value.deposit);
        }
    
        allData.append('additionalNotes', this.step3FormGroup.value.additionalNotes);
        allData.append('technicianNotes', this.step3FormGroup.value.technicianNotes);

        // allData.append('isjobApproval', this.step3FormGroup.value.jobApproval);
        // allData.append('isQuote', this.step3FormGroup.value.quoteRequired);
        // allData.append('isPaid', this.step3FormGroup.value.paid);

        this.isLoading$ = true;
        //  console.log(this.step3FormGroup.value)

        this.servicesService.createWizardService(allData)
          .subscribe(
            data => {
              // console.log(data.data.status)
              if (data.data.status == 0) {
                this.toastr.error(data.data.message)
                this.isLoading$ = false;
              } else {
                this.onSubmitService(data.data.result1.insertId)
                if (this.uploader.queue.length != 0) {
                  this.uploadAttachment(data.data.result1.insertId)
                  this.toastr.success(data.data.message)
                } else {
                  this.toastr.success(data.data.message)
                  this.dataList = [];
                  this.step1FormGroup.untouched
                  this.step1FormGroup.reset()
                  this.step2FormGroup.untouched
                  this.step2FormGroup.reset()
                  this.step3FormGroup.untouched
                  this.step3FormGroup.reset()
                  this.createJobObj = {};
                  this.isLoading$ = false;

                  this.router.navigate(['/open-job'])
                }


              }
            },
            error => {
              // this.showError(error.statusText);
              console.log(error);
            });
      }

   else {
      this.toastr.error('Please select item first')
    } 
  } 


    // this.step3FormGroup.markAllAsTouched();
    // if (!this.step3FormGroup.valid) {
    //   return;
    // }

    this.submitted = true;
    // this.isLoading$ = true; 


  }
  editModal() {
    this.modalService.open(this.openModal);
    this.formGroup.reset();
  }

  editItemModal() {
    this.modalService.open(this.itemopenModal);
    this.itemTypeGroup.reset();
  }
  closeItemTypeModal() {
    this.modalService.dismissAll(this.itemopenModal);
    this.itemTypeGroup.reset();

  }

  editBrandModal() {
    this.modalService.open(this.brandopenModal);
    this.brandGroup.reset();
  }
  closeBrand() {
    this.modalService.dismissAll(this.brandopenModal);
    this.brandGroup.reset();
  }
  editACItemModal() {
    this.modalService.open(this.acItemopenModal);
    this.ACItemsGroup.reset();
  }
  closeACItem() {
    this.modalService.dismissAll(this.ACItemsGroup);
    this.ACItemsGroup.reset();
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

  editServiceModal() {
    this.modalService.open(this.serviceopenModal);
    this.ServiceformGroup.reset();
  }

  closeServiceModal() {
    this.modalService.dismissAll(this.serviceopenModal);
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
              this.createJobObj.service = this.ServiceformGroup.value.serviceName;
              this.list = {serviceID:data.data.result1.serviceID, id: data.data.result1.id, service: this.ServiceformGroup.value.serviceName, price: this.ServiceformGroup.value.price }
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
              this.createJobObj.storageLocation = this.locationGroup.value.storageName;
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
  selectTimeType(val) {
    // console.log(val)
  }
  saveBasicDetails() {
    if (this.formGroup.value.customerType != null && this.formGroup.value.customerType != "",
      this.formGroup.value.firstName != null && this.formGroup.value.firstName != "",
      this.formGroup.value.lastName != null && this.formGroup.value.lastName != "",
      this.formGroup.value.contactNo != null && this.formGroup.value.contactNo != "",
      this.formGroup.value.email != null && this.formGroup.value.email != ""


    ) {

      // this.moveToSelectedTab('Product List');

    } else {
    }
  }

  selectRepairType(val) {
    // for (let i in val) {
    //   this.repaiTypeList.push(val[i])
    //   this.cdr.markForCheck();
    // }
    var data = {}
    var list = []
    val.forEach(element => {
      data = {
        name: element.name,
        id: element.id
      }
      list.push(data)
    });


    this.repaiTypeList = list;

  }
  attributeDisplay(val1, val) {
    if (val1.id == val.id) {

      return val1.name


    } else {
      return "";

    }
  }
  deleteData(val) {

    const index = this.dataList.indexOf(val, 0);
    if (index > -1) {
      this.dataList.splice(index, 1);
      this.totalQty = 0
    }
    this.sum = Number(this.sum) - Number(val.price)
    // console.log(val)

  }

  next() {
  }
  closeModal() {
    this.modalService.dismissAll();
    this.formGroup.markAsUntouched()

  }
 

  selectCustomerContact(val) {
    // console.log(val.source.value)
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  upadteCustomerInfo() {

    this.isLoadingUpdate = true;
    var data = {
      id: this.customerInfo.id,
      email: this.customerInfo.email,
      contactNo: this.step1FormGroup.value.customerContact

    }


    // console.log(data)
    this.customerService.updateCustomerByEmail(data)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isLoadingUpdate = false;
          } else {
            this.toastr.success(data.data.message);

            this.step1FormGroup['customerContact'] = this.step1FormGroup.value.customerContact
            this.getAllCustomers();
 
          }
          this.isLoadingUpdate = false;
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
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
              this.createJobObj.brand = this.brandGroup.value.brandName;
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

  createJobObj: any = {}
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
              this.createJobObj.itemType = this.itemTypeGroup.value.itemTypeName;
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
  editStorageModal() {
    this.modalService.open(this.storageopenModal);
    this.locationGroup.reset();
  }
  editJobStatus() {

    this.modalService.open(this.statusopenModal)
    // this.jobStatusGroup.reset();

  }
  closeStatus() {
    this.modalService.dismissAll();
    this.jobStatusGroup.reset()

  }

  jobStatusObj: any = {};

  addjobStatus() {
    // console.log(this.jobStatusGroup.value)
    this.jobStatusGroup.markAllAsTouched();
    if (!this.jobStatusGroup.valid) {
      return;
    } else {


      this.isLoading$ = true;
      var Obj = this.jobStatusGroup.value;

      Obj.statusColor = this.jobStatusGroup.value.statusColor.hex
      this.jobStatusService.createStatus(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.createJobObj.jobStatus = this.jobStatusGroup.value.statusType;
              this.getAllJobStatus();
              this.jobStatusGroup.reset();
              this.jobStatusGroup.untouched;
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
  changeJobApproval(val) {
    // console.log(val)
  }
  changeQuoteRequired(val) {
    // console.log(val)
  }

  changePaid(val) {
    // console.log(val)
  }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }



  //customer Form



  //Customer Select Form
  isCustomerSelectControlValid(controlName: string): boolean {
    const control = this.customerForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isCustomerSelectControlInvalid(controlName: string): boolean {
    const control = this.customerForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isCustomerSelectcontrolHasError(validation, controlName): boolean {
    const control = this.customerForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isCustomerSelectControlTouched(controlName): boolean {
    const control = this.customerForm.controls[controlName];
    return control.dirty || control.touched;
  }



  //Step1Form validation
  Step1FormSelectControlValid(controlName: string): boolean {
    const control = this.step1FormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  Step1FormSelectControlInvalid(controlName: string): boolean {
    const control = this.step1FormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  Step1FormSelectcontrolHasError(validation, controlName): boolean {
    const control = this.step1FormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  Step1FormSelectControlTouched(controlName): boolean {
    const control = this.step1FormGroup.controls[controlName];
    return control.dirty || control.touched;
  }
  //Step2Form validation
  Step2FormSelectControlValid(controlName: string): boolean {
    const control = this.step2FormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  Step2FormSelectControlInvalid(controlName: string): boolean {
    const control = this.step2FormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  Step2FormSelectcontrolHasError(validation, controlName): boolean {
    const control = this.step2FormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  Step2FormSelectControlTouched(controlName): boolean {
    const control = this.step2FormGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //Step3Form validation
  Step3FormSelectControlValid(controlName: string): boolean {
    const control = this.step3FormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  Step3FormSelectControlInvalid(controlName: string): boolean {
    const control = this.step3FormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  Step3FormSelectcontrolHasError(validation, controlName): boolean {
    const control = this.step3FormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  Step3FormSelectControlTouched(controlName): boolean {
    const control = this.step3FormGroup.controls[controlName];
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



  //Repair Type Times
  isRepairTypeControlValid(controlName: string): boolean {
    const control = this.RepairGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isRepairTypeControlInvalid(controlName: string): boolean {
    const control = this.RepairGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isRepairTypecontrolHasError(validation, controlName): boolean {
    const control = this.RepairGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isRepairTypeControlTouched(controlName): boolean {
    const control = this.RepairGroup.controls[controlName];
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
  isProductControlValid(controlName: string): boolean {
    const control = this.productGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
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


  //JOb Status Select Form
  jobStatusSelectControlValid(controlName: string): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  jobStatusSelectControlInvalid(controlName: string): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  jobStatusSelectcontrolHasError(validation, controlName): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  jobStatusSelectControlTouched(controlName): boolean {
    const control = this.jobStatusGroup.controls[controlName];
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
}
