import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {
  @ViewChild('paymentopenModal') paymentopenModal: TemplateRef<any>;
  isLoading$

  paymentMethodGroup: FormGroup;
  constructor(private fb: FormBuilder, private modalService: NgbModal)
     {
    this.modalService.dismissAll()
  }

  ngOnInit(): void {

    this.paymentMethodGroup = this.fb.group({
      paymentName: ['', Validators.compose([Validators.required])], 

    })
  }
  editModal() {
    this.modalService.open(this.paymentopenModal);
    this.paymentMethodGroup.reset();
  }

  closeModal() {
    this.modalService.dismissAll();
    this.paymentMethodGroup.markAsUntouched()

  }

  addpaymentMethod(){

  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.paymentMethodGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.paymentMethodGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.paymentMethodGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.paymentMethodGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
