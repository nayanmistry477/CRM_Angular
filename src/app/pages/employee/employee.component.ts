import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EmployeeService } from 'src/app/modules/auth/_services/employee.service';
import { UserRolesService } from 'src/app/modules/auth/_services/userRoles.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {


  @ViewChild('openModal') openModal : TemplateRef<any>;
  @ViewChild('openUpdateModal') openUpdateModal : TemplateRef<any>;

  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;


  public filteredUserMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public userMultiFilterCtrl: FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();

  isLoading$
  model: any = {}
  formGroup: FormGroup; 
  updateformGroup: FormGroup; 
  private subscriptions: Subscription[] = [];
  searchGroup: FormGroup;

  isLoading: boolean;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  emp: any = {
    id: undefined,
    firstName: '',
    lastName: '',  
    email: '', 
    jobTitle:'',
    userRole:'', 
    contactNo: '', 
    password:''

  };

  private employeeVal: any[] = [];
  isFlag:number = 1;
  employee:any={};
  public searching: boolean = false;
  isDeleting:boolean =false;
  constructor(private fb: FormBuilder,private toastr: ToastrService,
    public employeeService:EmployeeService,
    public userRoleService:UserRolesService,
    public cdr:ChangeDetectorRef,
     private modalService: NgbModal) { 
    this.modalService.dismissAll();
    const sb = this.employeeService.isLoading$.subscribe(res => this.isLoading = res);

    this.grouping = this.employeeService.grouping;
    this.paginator = this.employeeService.paginator;
    this.sorting = this.employeeService.sorting;
    this.employeeService.fetch();
    console.log(employeeService.items$)
    this.cdr.markForCheck()
  }
user:any = {}
token={}
  ngOnInit(): void {

    var token = JSON.parse(localStorage.getItem('token'));
    this.token = token.accessToken
    this.user = token.user
    this.getAlluserRoles();
    this.searchForm();
    this.formGroup = this.fb.group({ 
      id:[''],
      firstname: [this.emp.firstname, Validators.compose([Validators.required])],
      lastname: [this.emp.lastname, Validators.compose([Validators.required])], 
      jobTitle: [this.emp.jobTitle, Validators.compose([Validators.required])],
      email: [this.emp.email, Validators.compose([Validators.required, Validators.email])], 
      userRole: [this.emp.userRole, Validators.compose([Validators.required])], 
      password: [this.emp.password, Validators.compose([Validators.required])],  
      contactNo: [this.emp.contactNo, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
   
    });

    this.updateformGroup = this.fb.group({ 
      id:[''],
      firstname: [this.emp.firstname, Validators.compose([Validators.required])],
      lastname: [this.emp.lastname, Validators.compose([Validators.required])], 
      jobTitle: [this.emp.jobTitle, ],
      email: [this.emp.email, Validators.compose([Validators.required, Validators.email])], 
      userRole: [this.emp.userRole, Validators.compose([Validators.required])], 
      contactNo: [this.emp.contactNo, Validators.compose([  Validators.minLength(11), Validators.maxLength(11)])],
      password: [this.emp.password],  
    });
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
  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  val:string
  search(searchTerm: string) { 
    this.employeeService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  getAlluserRoles() { 

    this.userRoleService.getAllUserRoles()
      .subscribe(
        data => { 
          if (data.status == 0) {  
            this.employeeVal = [];
           } else {  
            var list= [];
            var str={}
            data.result.forEach(element => {
              str={roleName:element.roleName};
              list.push(str);
            });
            this.employeeVal = list;
            this.filteredUserMulti.next(this.employeeVal.slice()); 
            this.userMultiFilterCtrl.valueChanges
            .pipe(
              takeUntil(this._onDestroy))
            .subscribe(() => {
              this.searching = false;
              this.filterEmployee()
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

  filterEmployee() {
    if (!this.employeeVal) {
      return;
    }
    // get the search keyword
    let search = this.userMultiFilterCtrl.value;
    if (!search) {
      this.filteredUserMulti.next(this.employeeVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUserMulti.next(
      this.employeeVal.filter(item => item.roleName.toLowerCase().indexOf(search) > -1 || item.roleName.toUpperCase().indexOf(search) > -1)
    );
  }
  editModal(){ 
    this.formGroup.reset()
    this.formGroup.markAsUntouched()
    this.modalService.open(this.openModal);
    this.employee = {};
 
 }
 closeModal(){
  this.formGroup.reset() 
   this.modalService.dismissAll(); 
   this.formGroup.markAsUntouched();

 }
 Submit(){

  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  } else {
  // console.log(this.formGroup.value)

  var Obj = this.formGroup.value;
  this.isLoading$ = true;
  this.employeeService.createUser(Obj)
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
        this.employeeService.fetch()
        this.isLoading$  = false;
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
      this.toastr.success(error)
    });
  }
}
 editUser(data){ 
  this.modalService.open(this.openUpdateModal);
  this.updateformGroup.controls['id'].setValue(data.id); 
  this.updateformGroup.controls['firstname'].setValue(data.firstname);
  this.updateformGroup.controls['lastname'].setValue(data.lastname); 
  this.updateformGroup.controls['jobTitle'].setValue(data.jobTitle);
  this.updateformGroup.controls['email'].setValue(data.email);
  this.updateformGroup.controls['userRole'].setValue(data.userRole);
  this.updateformGroup.controls['contactNo'].setValue(data.contactNo); 
  this.updateformGroup.controls['password'].setValue(data.password); 
 }
 updateEmployee(){

  this.updateformGroup.markAllAsTouched();
  if (!this.updateformGroup.valid) {
    return;
  } else {
  this.isLoading$ = true;

   var Obj = this.updateformGroup.value;
  this.employeeService.updateUser(Obj)
  .subscribe(
    data => {
      console.log(data.data.status)
      if (data.data.status == 0) { 
        this.toastr.error(data.data.message)
        // this.isLoading$  = false;
      } else {
        this.toastr.success(data.data.message)

        this.formGroup.reset();
        this.formGroup.untouched;
        this.modalService.dismissAll();
        this.employeeService.fetch()
        this.isLoading$  = false;
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
      this.toastr.success(error)
    });
  }
 }

editDelete(data){ 
 
  this.modalService.open(this.confrimBox)
  this.employee = data;
}
 deleteUser(){ 
  this.isDeleting = true;
  this.employeeService.deleteUser(this.employee)
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
        this.formGroup.untouched;
        this.modalService.dismissAll();
        this.employeeService.fetch() 
        this.isDeleting = false;
        this.cdr.markForCheck();
      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
      this.toastr.success(error)
    });
 }
 selectRole(val){

  console.log(val)
 }
 closeDelete(){
   this.modalService.dismissAll();
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
    this.employeeService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.employeeService.patchState({ paginator });
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

    //For UpateForm

       // helpers for View
       isUpdateControlValid(controlName: string): boolean {
        const control = this.updateformGroup.controls[controlName];
        return control.valid && (control.dirty || control.touched);
      }
    
      isUpdateControlInvalid(controlName: string): boolean {
        const control = this.updateformGroup.controls[controlName];
        return control.invalid && (control.dirty || control.touched);
      }
    
      UpdatecontrolHasError(validation, controlName): boolean {
        const control = this.updateformGroup.controls[controlName];
        return control.hasError(validation) && (control.dirty || control.touched);
      }
    
      isUpdateControlTouched(controlName): boolean {
        const control = this.updateformGroup.controls[controlName];
        return control.dirty || control.touched;
      }
}
