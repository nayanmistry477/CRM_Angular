import { Inject, Injectable, OnDestroy } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { UserModel } from '../../_models/user.model';
import { environment } from '../../../../environments/environment';
import { AuthModel } from '../_models/auth.model';
import { UserModel } from '../_models/user.model';
import { ITableState, TableResponseModel, TableService } from 'src/app/_metronic/shared/crud-table';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { map } from 'rxjs/operators';
 const API_USERS_URL = `${environment.apiUrl}/services`;

@Injectable({
  providedIn: 'root',
}) 

export class ServicesService extends TableService<any> implements OnDestroy {
  token:any={}
   constructor(@Inject(HttpClient) http) {
    super(http);

    var token = JSON.parse(localStorage.getItem('token'))
    if(token != null){
  
      this.token = token.accessToken
    }else{
      this.token = null
    }
  }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<any>> {

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any[]>(`${API_USERS_URL}/getAllServices`,{headers: httpHeaders,}).pipe(
      map((response:any) => { 
        var res = []
        if(response.result == undefined){
            res = []
        }else{
            res = response.result
        }
        const filteredResult = baseFilter(res, tableState);
        const result: TableResponseModel<any> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
    
  }

    // CREATE =>  POST: add a new user to the server
    createService(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createService`,service, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updateService(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateService`,service, {
        headers: httpHeaders,
      });
 
  }

  createProductList(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createProductList`,service, {
        headers: httpHeaders,
      });
 
  }

  deleteService(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteService`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  deleteProductList(product) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteProductList`,product, {
        headers: httpHeaders,
      }); 
 
  }

  createOnlyService(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createOnlyService`,service, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }

  createWizardService(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createWizardService`,service, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }

  createProduct_ServiceFinal(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createProduct_ServiceFinal`,service, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  getAllServices() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${API_USERS_URL}/getAllServices`, {
        headers: httpHeaders,
      }); 
 
  }

  getProducts_ServiceByjobID(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getProducts_ServiceByjobID`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  getProducts_ServiceByinvoiceID(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getProducts_ServiceByinvoiceID`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  // updateSalesService(service) {
  //   const httpHeaders = new HttpHeaders({
  //       Authorization: `Bearer ${this.token}`
  //     });
  //     return this.http.post<any>(`${API_USERS_URL}/updateSalesService`,service, {
  //       headers: httpHeaders,
  //     }); 
 
  // } 

  updateProduct_ServiceFinal(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateProduct_ServiceFinal`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  updateProduct_ServiceFinalInvoice(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateProduct_ServiceFinalInvoice`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  getServiceByServiceID(id) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getServiceByServiceID`,id, {
        headers: httpHeaders,
      }); 
 
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}