import { ChangeDetectionStrategy } from '@angular/compiler/src/compiler_facade_interface';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DisclaimerService } from 'src/app/modules/auth/_services/disclaimer.service';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent implements OnInit {
  formGroup:FormGroup;
  isLoading$
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
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
  constructor(private fb: FormBuilder,private cdr:ChangeDetectorRef,private toastr: ToastrService,private disclaimerService:DisclaimerService, private modalService: NgbModal) {
   this.getDesclaimer();
   }

  ngOnInit(): void {

    this.formGroup = this.fb.group({

      disclaimer: [''], 
    })
  }
  onSubmit(){
    this.isLoading$ = true;   
    var Obj = this.formGroup.value; 
    this.disclaimerService.createDisclaimer(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message);
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message);  
            this.getDesclaimer(); 
            this.isLoading$  = false;
            this.cdr.markForCheck()

            }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  getDesclaimer(){

    this.disclaimerService.getDisclaimer()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) { 
          
            this.isLoading$  = false;
          } else {
            var result = data.result[0]; 
            this.formGroup.controls['disclaimer'].setValue(result.disclaimer);   

            }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
}
