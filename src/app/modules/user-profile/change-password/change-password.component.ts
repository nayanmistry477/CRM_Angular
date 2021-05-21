import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService, UserModel, ConfirmPasswordValidator } from '../../auth';
import { EmployeeService } from '../../auth/_services/employee.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  user: any;
  firstUserState: UserModel;
  subscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;

  constructor(private userService: AuthService,public cdr:ChangeDetectorRef, private fb: FormBuilder,public toastr:ToastrService,private empService:EmployeeService) {
    
    this.isLoading$ = this.userService.isLoadingSubject.asObservable();
  }

  ngOnInit(): void {
    const sb = this.userService.currentUserSubject.asObservable().pipe(
      first(user => !!user)
    ).subscribe(user => {
      this.user = Object.assign({}, user);
      this.firstUserState = Object.assign({}, user);
      this.loadForm();
    });
    this.subscriptions.push(sb);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  loadForm() {
    this.formGroup = this.fb.group({ 
      currentPassword: ['',Validators.required],
      password: ['', Validators.required],
      cPassword: ['', Validators.required]
    }, {
      validator: ConfirmPasswordValidator.MatchPassword
    });
  }

  save() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }

    var data = {
        id:this.user.id,
        oldpassword:this.formGroup.value.currentPassword,
        newpassword:this.formGroup.value.password
    }
    console.log(data)

    this.user.password = this.formGroup.value.password;
    this.userService.isLoadingSubject.next(true);
    setTimeout(() => {
   
      this.empService.changePassword(data)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message) 
            this.userService.isLoadingSubject.next(false);
          } else {
            this.toastr.success(data.data.message)     
            this.userService.currentUserSubject.next(Object.assign({}, this.user));
            this.userService.isLoadingSubject.next(false); 
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
    }, 2000);
  }

  myFunction() {
    // var x = document.getElementById("myInput");
    var x =   document.getElementById('myInput') as HTMLInputElement
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
    var x1 =   document.getElementById('myInput1') as HTMLInputElement
    if (x1.type === "password") {
      x1.type = "text";
    } else {
      x1.type = "password";
    }
    var x2 =   document.getElementById('myInput2') as HTMLInputElement
    if (x2.type === "password") {
      x2.type = "text";
    } else {
      x2.type = "password";
    }
    this.cdr.markForCheck()
  }

  cancel() {
    this.user = Object.assign({}, this.firstUserState);
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
