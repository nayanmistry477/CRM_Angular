import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmPasswordValidator } from 'src/app/modules/auth';
import { EmployeeService } from 'src/app/modules/auth/_services/employee.service';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit,OnDestroy {
  formGroup: FormGroup;
  user: any; 
  subscriptions: Subscription[] = [];
  isLoading$:  boolean;
  constructor( private router:Router, private fb: FormBuilder,private activatedRoute: ActivatedRoute,public toastr:ToastrService,public cdr:ChangeDetectorRef,private empService:EmployeeService) {
    
   
  }
  id:any={}
  ngOnInit(): void {
    this.loadForm() 
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.id )
  }
  loadForm() {
    this.formGroup = this.fb.group({  
      password: ['', Validators.required],
      cPassword: ['', Validators.required]
    }, {
      validator: ConfirmPasswordValidator.MatchPassword
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  save() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }

    var data = {
        id:this.id, 
        newpassword:this.formGroup.value.password
    } 
    this.isLoading$ = true;
    setTimeout(() => {
   
      this.empService.recoveryPassword(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)  
            this.isLoading$ = false 
            this.cdr.markForCheck()
          } else {
            this.toastr.success(data.data.message)    
            this.isLoading$ = false
            this.router.navigate(['/auth/login'])
            this.cdr.markForCheck()
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    }, 2000);
  }

  cancel() { 
    this.loadForm();
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
