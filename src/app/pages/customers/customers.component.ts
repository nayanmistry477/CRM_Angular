import { C } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'; 
import { CustomersService } from 'src/app/modules/auth/_services/customer.service';
import { ReferredByService } from 'src/app/modules/auth/_services/referredBy.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

interface Referrals {
 
  referredBy: string;
}

interface Customer{
  customerType:string;
}
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  @ViewChild('openModal') openModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;
  public filteredreferralMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public referralMultiFilterCtrl: FormControl = new FormControl();

  public filteredcustomerMulti: ReplaySubject<Customer[]> = new ReplaySubject<Customer[]>(1); 
  public customerMultiFilterCtrl: FormControl = new FormControl();

  protected _onDestroy = new Subject<void>();
  isLoading: boolean;

  isLoading$
  model: any = {}
  formGroup: FormGroup;
  searchGroup:FormGroup;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  customer: any = {
    id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    CustomerType: '',
    contactNo: '',
    companyName: '',
    referredBy: '',
    address: '',
    postCode: '',
    job: '',

  };
  isFlag:number = 1
  public searching: boolean = false;

  private referralsVal: any[] = [];
  private customerVal: Customer[] = [
    { customerType: 'Retail Customer',},
    { customerType: 'Trade Customer',},
  ];

  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder,private toastr: ToastrService,
     private modalService: NgbModal,
     public cdr:ChangeDetectorRef,
     public referredByService:ReferredByService, 
     public customerService: CustomersService) {
 
    this.modalService.dismissAll()
    const sb = this.customerService.isLoading$.subscribe(res => this.isLoading = res);

    this.grouping = this.customerService.grouping;
    this.paginator = this.customerService.paginator;
    this.sorting = this.customerService.sorting;
    this.customerService.fetch();

 
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  ngOnInit(): void {
    this.getAllReferredBys()   
    this.searchForm();
    this.filteredcustomerMulti.next(this.customerVal.slice());


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
    this.formGroup = this.fb.group({

      id:[''],
      customerType: ['', ],   
      firstName: [this.customer.firstName, Validators.compose([Validators.required])],
      lastName: [this.customer.lastName, Validators.compose([Validators.required])],
      contactNo: ['', Validators.compose([ Validators.minLength(11), Validators.maxLength(11)])],
      referredBy: [''],
      companyName: [this.customer.companyName],
      email: [this.customer.email, Validators.compose([  Validators.email])],
      address: [this.customer.address],
      postCode: [this.customer.postCode,],
    })

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
  val:string
  search(searchTerm: string) { 
    console.log(searchTerm)
    this.customerService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  editModal() {

    this.isFlag = 1;
    this.modalService.open(this.openModal);
    this.formGroup.reset();
    this.customerData = {};
  }

  closeModal() {
    this.modalService.dismissAll();
    this.formGroup.markAsUntouched();

  }
  closeDelete(){
    this.modalService.dismissAll(); 
  }
  // Submit(){
  //   console.log(this.formGroup.value)
  // }
  Submit() {

    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }else{
     
  const registerUser = this.formGroup.value; 
    if(this.formGroup.value.referredBy != undefined && this.formGroup.value.referredBy != null){
      var referredBy = this.formGroup.value.referredBy 
   
      registerUser.referredBy = referredBy; 
    }
    console.log(registerUser)
    this.isLoading$ = true;  
    this.customerService.createCustomer(registerUser)
      .subscribe(
        data => {
          console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)

            this.formGroup.reset();
            this.formGroup.untouched;
            this.modalService.dismissAll();
            this.customerService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    }
 

  }
  customerObj:any={}
  editCustomer(data){
    // console.log(data)
    this.isFlag = 2;
    this.modalService.open(this.openModal)
    this.customerObj = data
    this.formGroup.controls['id'].setValue( data.id);  
    this.formGroup.controls['firstName'].setValue( data.firstName); 
    this.formGroup.controls['lastName'].setValue( data.lastName);   
    this.formGroup.controls['contactNo'].setValue( data.contactNo);
    this.formGroup.controls['referredBy'].setValue(data.referredBy) ;
    this.formGroup.controls['companyName'].setValue(data.companyName) ;
    this.formGroup.controls['email'].setValue( data.email);
    this.formGroup.controls['address'].setValue(data.address);
    this.formGroup.controls['postCode'].setValue( data.postCode); 
    this.formGroup.controls['customerType'].setValue(data.customerType); 


  
    
  }
  customerData:any={}
  updateCustomer(){ 

    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }else{
      const nData = this.formGroup.value;
      this.isLoading$ = true; 
      this.customerService.updateCustomer(nData)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) { 
              this.toastr.error(data.data.message)
              this.isLoading$  = false;
              this.cdr.markForCheck()
            } else {
              this.toastr.success(data.data.message)
  
              this.formGroup.reset();
              this.formGroup.untouched;
              this.modalService.dismissAll();
              this.customerService.fetch()
              this.isLoading$  = false;
              this.cdr.markForCheck()
              
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
            this.toastr.success(error)
          });
    }
    // this.cdr.markForCheck()
  }

  isDeleting:boolean = false;
  deleteCustomer(){ 
    this.isDeleting = true;
    this.customerService.deleteCustomer(this.customerData)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
          this.cdr.markForCheck();
        } else {
          this.toastr.success(data.data.message)

          this.formGroup.reset();  
          
          this.isDeleting = false;
          this.modalService.dismissAll();
          this.customerService.fetch() 
          this.cdr.detectChanges();

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
        this.toastr.success(error)
      });
      this.cdr.detectChanges();
  }

 
  editDeletemodal(data){
    this.customerData = data;
   this.modalService.open(this.confrimBox)
  }

    // sorting
    sort(column: string) {
      const sorting = this.sorting;
      const isActiveColumn = sorting.column === column;
      if (!isActiveColumn) {
        sorting.column = column;
        sorting.direction = 'asc';
      } else {
        sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
      }
      this.customerService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.customerService.patchState({ paginator });
    }


  getAllReferredBys() { 

    this.referredByService.getAllReferredBys()
      .subscribe(
        data => { 
          if (data.status == 0) {  
            this.referralsVal = [];
           } else {  
            var list= [];
            var str={}
            data.result.forEach(element => {
              str={referredBy:element.referredBy};
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
  selectReferredBy(val) {
    console.log(val)
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

  filterCustomer() {
    if (!this.referralsVal) {
      return;
    }
    // get the search keyword
    let search = this.customerMultiFilterCtrl.value;
    if (!search) {
      this.filteredcustomerMulti.next(this.customerVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredcustomerMulti.next(
      this.customerVal.filter(item => item.customerType.toLowerCase().indexOf(search) > -1 || item.customerType.toUpperCase().indexOf(search) > -1)
    );
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

}
