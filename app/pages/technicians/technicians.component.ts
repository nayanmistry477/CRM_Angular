import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TechnicianService } from 'src/app/modules/auth/_services/technicians.service';
import { UserRolesService } from 'src/app/modules/auth/_services/userRoles.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-technicians',
  templateUrl: './technicians.component.html',
  styleUrls: ['./technicians.component.scss']
})
 

export class TechniciansComponent implements OnInit {
  @ViewChild('openModal') openModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>; 

  protected _onDestroy = new Subject<void>();
  isLoading: boolean;

  isLoading$
  model: any = {}
  formGroup: FormGroup;
  searchGroup:FormGroup;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
   
  isFlag:number = 1
  public searching: boolean = false;

 
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder,private toastr: ToastrService,
     private modalService: NgbModal,
     public cdr:ChangeDetectorRef, 
     public technicianService: TechnicianService) {
 
    this.modalService.dismissAll()
    const sb = this.technicianService.isLoading$.subscribe(res => this.isLoading = res);

    this.grouping = this.technicianService.grouping;
    this.paginator = this.technicianService.paginator;
    this.sorting = this.technicianService.sorting;
    this.technicianService.fetch();

 
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  ngOnInit(): void {  
    this.searchForm();
    
    this.formGroup = this.fb.group({

      id:[''], 
      firstname: [ '', Validators.compose([Validators.required])],
      lastname: ['', Validators.compose([Validators.required])],
      contactNo: [''], 
      email: [''],
      address: [''], 
    })

  }
  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
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
    this.technicianService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  editModal() {

    this.isFlag = 1;
    this.modalService.open(this.openModal);
    this.formGroup.reset();
    this.technicianData = {};
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
  
    console.log(registerUser)
    this.isLoading$ = true;  
    this.technicianService.createTechnician(registerUser)
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
            this.technicianService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    }
 

  }
  technicianObj:any={}
  editTechnician(data){
    // console.log(data)
    this.isFlag = 2;

    this.technicianObj = data
    this.formGroup.controls['id'].setValue( this.technicianObj.id);  
    this.formGroup.controls['firstname'].setValue( this.technicianObj.firstname); 
    this.formGroup.controls['lastname'].setValue( this.technicianObj.lastname);   
    this.formGroup.controls['contactNo'].setValue( this.technicianObj.contactNo); 
    this.formGroup.controls['email'].setValue( this.technicianObj.email);
    this.formGroup.controls['address'].setValue( this.technicianObj.address); 
  this.modalService.open(this.openModal)

  
    
  }
  technicianData:any={}
  updateTechnician(){ 

    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }else{
      const nData = this.formGroup.value;
      this.isLoading$ = true; 
      this.technicianService.updateTechnician(nData)
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
              this.technicianService.fetch()
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
  }

  isDeleting:boolean = false;
  deleteTechnician(){ 
    this.isDeleting = true;
    this.technicianService.deleteTechnician(this.technicianData)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
          this.cdr.markForCheck();
        } else {
          this.technicianService.fetch() 
          this.technicianObj = {}
          this.toastr.success(data.data.message) 
          this.isDeleting = false;
          this.modalService.dismissAll();
          
          this.cdr.markForCheck();

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
        this.toastr.success(error)
      }); 
  }

 
  editDeletemodal(data){
    this.technicianData = data;
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
      this.technicianService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.technicianService.patchState({ paginator });
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
