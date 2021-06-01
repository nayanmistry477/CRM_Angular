import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { UserRolesService } from 'src/app/modules/auth/_services/userRoles.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent implements OnInit {
  @ViewChild('userroleopenModal') userroleopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;
  isLoading$
  userRoleGroup: FormGroup;
  userRoleObj: any = {}
  isLoading: boolean; 
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isFlag:number = 1

  protected _onDestroy = new Subject<void>(); 
  private subscriptions: Subscription[] = [];

  constructor(private fb:FormBuilder,private modalService: NgbModal,
    public userRolesService:UserRolesService, 
    public cdr:ChangeDetectorRef,
    private toastr: ToastrService) {
    this.modalService.dismissAll()
    const sb = this.userRolesService.isLoading$.subscribe(res => this.isLoading = res); 
    this.grouping = this.userRolesService.grouping;
    this.paginator = this.userRolesService.paginator;
    this.sorting = this.userRolesService.sorting;
    this.userRolesService.fetch(); 
   }
   isDeleting:boolean = false;
  ngOnInit(): void {
    this.userRoleGroup = this.fb.group({ 
      id:[''],
      roleName: ['', Validators.compose([Validators.required])],
      description:['']

    });
  }
  editModal() {
    this.isFlag = 1;
    this.modalService.open(this.userroleopenModal);
    this.userRoleObj={};
    this.userRoleGroup.reset();
  }
  closeModal() {
    this.modalService.dismissAll();
    // this.userRoleGroup.reset();
  }

  editUserRole(data){
    this.isFlag = 2;
    this.modalService.open(this.userroleopenModal)
    this.userRoleGroup.controls['id'].setValue(data.id); 
    this.userRoleGroup.controls['roleName'].setValue(data.roleName);
    this.userRoleGroup.controls['description'].setValue(data.description); 

  }

  updateuserRoles(){

    this.userRoleGroup.markAllAsTouched();
    if (!this.userRoleGroup.valid) {
      return;
    } else {
    this.isLoading$ = true;  
    var Obj = this.userRoleGroup.value;
 this.userRolesService.updateUserRole(Obj)
   .subscribe(
     data => {
       // console.log(data.data.status)
       if (data.data.status == 0) { 
         this.toastr.error(data.data.message)
         this.isLoading$  = false;
       } else {
         this.toastr.success(data.data.message)  
         this.userRoleGroup.untouched;  
         this.modalService.dismissAll();
         this.userRolesService.fetch()
         this.isLoading$  = false; 
 
       }
     },
     error => {
       // this.showError(error.statusText);
       console.log(error);
     });
    }
  }
  editDelete(data){
    this.modalService.open(this.confrimBox)
    this.userRoleObj = data;
  }
  closeDelete(){
    this.modalService.dismissAll()
  }
  deleteUserRole(){ 
    this.isDeleting  = true;
     // productObj.isWOOConnected	= this.formGroup.value
  this.userRolesService.deleteUserRole( this.userRoleObj)
    .subscribe(
      data => {
        // console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
        } else {
          this.toastr.success(data.data.message)  
          this.userRoleGroup.untouched;  
          this.modalService.dismissAll();
          this.userRolesService.fetch() 
          this.isDeleting = false;
          this.cdr.markForCheck();
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
  }
  addRole(){
    this.userRoleGroup.markAllAsTouched();
    if (!this.userRoleGroup.valid) {
      return;
    } else {
    this.isLoading$ = true;  
    var Obj = this.userRoleGroup.value;
    // productObj.isWOOConnected	= this.formGroup.value
  this.userRolesService.createUserRole(Obj)
    .subscribe(
      data => {
        // console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)  
          this.userRoleGroup.untouched;  
          this.modalService.dismissAll();
          this.userRolesService.fetch()
          this.isLoading$  = false; 
  
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
    }
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
    this.userRolesService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.userRolesService.patchState({ paginator });
  }
   // helpers for View
   isControlValid(controlName: string): boolean {
    const control = this.userRoleGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.userRoleGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.userRoleGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.userRoleGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
