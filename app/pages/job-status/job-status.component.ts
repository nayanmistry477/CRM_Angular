import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { JobStatusService } from 'src/app/modules/auth/_services/jobStatus.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
interface stageType{
  stage:string;
}
@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
 
export class JobStatusComponent implements OnInit {

  @ViewChild('statusopenModal') statusopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  colorCtr: AbstractControl = new FormControl(null);

  isLoading$
  model: any = {}
   public searching: boolean = false;
   isLoading: boolean;
  jobStatusObj = {};
  isFlag:number = 1
  protected _onDestroy = new Subject<void>();

  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  jobStatusGroup: FormGroup;
  searchGroup:FormGroup;
  private subscriptions: Subscription[] = [];
  private stageName: stageType[] = [
    { stage: 'closed',},
    { stage: 'open',},
    { stage: 'returned',}
  ];
  public filteredstageMulti: ReplaySubject<stageType[]> = new ReplaySubject<stageType[]>(1); 
  public stageMultiFilterCtrl: FormControl = new FormControl();
  constructor(private fb: FormBuilder, private toastr: ToastrService,
    private modalService: NgbModal,
    public cdr:ChangeDetectorRef,
    public jobStatusService:JobStatusService,
    private elementRef: ElementRef) {

      this.modalService.dismissAll();
      const sb = this.jobStatusService.isLoading$.subscribe(res => this.isLoading = res); 
      this.grouping = this.jobStatusService.grouping;
      this.paginator = this.jobStatusService.paginator;
      this.sorting = this.jobStatusService.sorting;
      this.jobStatusService.fetch();   }

  ngOnInit(): void {

    this.filteredstageMulti.next(this.stageName.slice());


    this.stageMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filterStage()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
    this.searchForm()
    var script = document.createElement('script');
    script.src = './assets/js/components/color.js';
    script.type = 'text/javascript'; 
    this.elementRef.nativeElement.appendChild(script);


    this.jobStatusGroup = this.fb.group({
      id:[''],
      statusType: ['', Validators.compose([Validators.required])],
      statusStage: ['', Validators.compose([Validators.required])],
      statusColor: ['', Validators.compose([Validators.required])]

    })
  }
  selectStage(val){
    console.log(val)
  }
  filterStage() {
    if (!this.stageName) {
      return;
    }
    // get the search keyword
    let search = this.stageMultiFilterCtrl.value;
    if (!search) {
      this.filteredstageMulti.next(this.stageName.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredstageMulti.next(
      this.stageName.filter(item => item.stage.toLowerCase().indexOf(search) > -1 || item.stage.toUpperCase().indexOf(search) > -1)
    );
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
    this.jobStatusService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  editModal() {
    this.isFlag = 1;
    this.modalService.open(this.statusopenModal);
    this.jobStatusGroup.reset();
    this.jobStatusObj = {};
  }

  editJobStatus(data){
    this.isFlag = 2;
    this.modalService.open(this.statusopenModal)
    this.jobStatusGroup.controls['id'].setValue(data.id);   
    this.jobStatusGroup.controls['statusType'].setValue(data.statusType);  
    this.jobStatusGroup.controls['statusStage'].setValue(data.statusStage);   
    this.jobStatusGroup.controls['statusColor'].setValue(data.statusColor);  

  }

  updatejobStatus(){
    this.jobStatusGroup.markAllAsTouched();
    if (!this.jobStatusGroup.valid) {
      return;
    }else{
    this.isLoading$ = true;   
    var obj = this.jobStatusGroup.value 

    obj.statusType = this.jobStatusGroup.value.statusType.toLowerCase();

    obj.statusColor = '#'+this.jobStatusGroup.value.statusColor.hex 
    this.jobStatusService.updateStatus(obj)
      .subscribe(
        data => {
           if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)
            this.jobStatusService.fetch();
            this.jobStatusGroup.reset();
            this.jobStatusGroup.untouched;  
            this.modalService.dismissAll(); 
            this.isLoading$  = false; 
  
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }
  }
  closeStatus() {
    this.modalService.dismissAll(); 
    this.jobStatusObj = {};

  }
  addjobStatus() { 
    // console.log(this.jobStatusGroup.value)
    this.jobStatusGroup.markAllAsTouched();
    if (!this.jobStatusGroup.valid) {
      return;
    }else{
  

    this.isLoading$ = true;   
    var Obj = this.jobStatusGroup.value;

    Obj.statusType = this.jobStatusGroup.value.statusType.toLowerCase();

    Obj.statusColor = '#'+this.jobStatusGroup.value.statusColor.hex 
    this.jobStatusService.createStatus(Obj)
      .subscribe(
        data => {
           if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)
            this.jobStatusService.fetch();
            this.jobStatusGroup.reset();
            this.jobStatusGroup.untouched;  
            this.modalService.dismissAll(); 
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
    this.modalService.open(this.confrimBox);
    this.jobStatusObj = data;
  }
  closeDelete(){
    this.modalService.dismissAll();
  }
  isDeleting:boolean= false;
  deleteJobStatus(){  
    this.isDeleting = true
    this.jobStatusService.deleteStatus(this.jobStatusObj)
      .subscribe(
        data => {
           if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isDeleting = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message)
            this.jobStatusService.fetch();
            this.jobStatusGroup.reset();
            this.jobStatusGroup.untouched;  
            this.modalService.dismissAll();  
            this.isDeleting = false;
            this.cdr.markForCheck();
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
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
      this.jobStatusService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.jobStatusService.patchState({ paginator });
    }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.jobStatusGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
