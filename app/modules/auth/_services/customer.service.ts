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
 const API_USERS_URL = `${environment.apiUrl}/customer`;

@Injectable({
  providedIn: 'root',
})
// export class CustomerService  {
//     token:any={}
//   constructor(private http: HttpClient) {
//     var token = JSON.parse(localStorage.getItem('token'))
//       if(token != null){
    
//         this.token = token.accessToken
//       }else{
//         this.token = null
//       }
//    }

 

//   // CREATE =>  POST: add a new user to the server
//   createCustomer(user) {
//     const httpHeaders = new HttpHeaders({
//         Authorization: `Bearer ${this.token}`
//       });
//       return this.http.post<any>(`${API_USERS_URL}/createCustomer`,user, {
//         headers: httpHeaders,
//       });

//     // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
//   }

 


//   // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
// //   forgotPassword(email: string): Observable<boolean> {
// //     return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
// //       email,
// //     });
// //   }

// getAllCustomers()  {
//     const httpHeaders = new HttpHeaders({
//       Authorization: `Bearer ${this.token}`
//     });
//     return this.http.get<any>(`${API_USERS_URL}/getAllCustomers`, {
//       headers: httpHeaders,
//     });
    
//   }
// }


export class CustomersService extends TableService<any> implements OnDestroy {
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
    return this.http.get<any[]>(`${API_USERS_URL}/getAllCustomers`,{headers: httpHeaders,}).pipe(
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
  createCustomer(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createCustomer`,user, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updateCustomer(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateCustomer`,user, {
        headers: httpHeaders,
      });
 
  }
  updateCustomerByEmail(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateCustomerByEmail`,user, {
        headers: httpHeaders,
      });
 
  }
  deleteCustomer(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteCustomer`,user, {
        headers: httpHeaders,
      }); 
 
  }
  getAllCustomers() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${API_USERS_URL}/getAllCustomers`, {
        headers: httpHeaders,
      }); 
 
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}