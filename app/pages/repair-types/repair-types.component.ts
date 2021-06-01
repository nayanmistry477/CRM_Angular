import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
interface RepairType {
  id: string;
  name: string;
}
@Component({
  selector: 'app-repair-types',
  templateUrl: './repair-types.component.html',
  styleUrls: ['./repair-types.component.scss']
})
export class RepairTypesComponent implements OnInit {

  @ViewChild('repairopenModal') repairopenModal: TemplateRef<any>;

  RepairGroup: FormGroup;
  isLoading$
  public searching: boolean = false;

  public timeTypeMultiFilterCtrl: FormControl = new FormControl();
  public filteredtimeTypeMulti: ReplaySubject<RepairType[]> = new ReplaySubject<RepairType[]>(1);
  protected _onDestroy = new Subject<void>();


  repairTimeObj: any = {
    repairName: '',
    estTime: '',
    timeType: '',
    repairPrice: '',
    taxRate: ''
  }

  private timeType: RepairType[] = [
    { name: 'Hours', id: '1' },
    { name: 'Days', id: '2' },
    { name: 'Weeks', id: '3' },
    { name: 'Months ', id: '4' },

  ];
  constructor(private fb: FormBuilder, private modalService: NgbModal, ) { 
    this.modalService.dismissAll()
  }

  ngOnInit(): void {
    this.filteredtimeTypeMulti.next(this.timeType.slice());

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
    this.RepairGroup = this.fb.group({

      repairName: [this.repairTimeObj.repairName, Validators.compose([Validators.required])],
      estTime: [this.repairTimeObj.estTime, Validators.compose([Validators.required])],
      timeType: [this.repairTimeObj.timeType, Validators.compose([Validators.required])],
      repairPrice: [this.repairTimeObj.repairPrice, Validators.compose([Validators.required])],
      taxRate: [this.repairTimeObj.taxRate, Validators.compose([Validators.required])]
    });
  }

  editRepairTypeModal() {
    this.modalService.open(this.repairopenModal);
    this.RepairGroup.reset();
  }
  closeRepairModal() {
    this.modalService.dismissAll(this.repairopenModal);
    this.RepairGroup.reset();
  }

  selectTimeType(val) {
    console.log(val)
  }

  addRepairType() {
    console.log(this.RepairGroup.value)
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
  
}
