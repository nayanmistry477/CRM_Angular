import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { first } from 'rxjs/operators';
import { UserService } from '../_services/user.service';
import { ToastrService } from 'ngx-toastr';
import { EmailSettingsService } from '../_services/emailSettings.service';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public employeeService:UserService,
    public cdr:ChangeDetectorRef,
    public emailService:EmailSettingsService,
    private toastr:ToastrService,
  ) {
     
  }

  ngOnInit(): void {
    this.initForm();
    this.getAllEmailSettings(); 
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        ' ',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
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
  val:any={}
  submit() {
    this.errorState = ErrorStates.NotSubmitted;
   this.val = {
      email:this.f.email.value
    }
    this.isLoading$ = true;
    const forgotPasswordSubscr = this.employeeService.forgotPassword(this.val)
      .pipe(first())
      .subscribe((result) => {
         if(result.status == 0 ){
           this.toastr.error(result.message)
           this.isLoading$ = false;
           this.cdr.markForCheck()
         } else{
          this.toastr.success(result.message)
          this.isLoading$ = false;
          this.cdr.markForCheck()
         }
        // this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
        // console.log(this.f.email.value)
      });
    // this.unsubscribe.push(forgotPasswordSubscr);
  }
}
