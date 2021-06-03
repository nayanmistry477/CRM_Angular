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

export class JobService extends TableService<any> implements OnDestroy {
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
    return this.http.get<any[]>(`${API_USERS_URL}/getAllJobs`,{headers: httpHeaders,}).pipe(
      map((response:any) => { 
        var res = response.result
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
 
    createJobService(service) {
      const httpHeaders = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        return this.http.post<any>(`${API_USERS_URL}/createJobService`,service, {
          headers: httpHeaders,
        });
  
      // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
    }
//   getAllStorages() {
//     const httpHeaders = new HttpHeaders({
//         Authorization: `Bearer ${this.token}`
//       });
//       return this.http.get<any>(`${API_USERS_URL}/getAllStorages`, {
//         headers: httpHeaders,
//       }); 
 
//   } 
 
updateJobService(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/updateJobService`,service, {
      headers: httpHeaders,
    });

}

// updateJobStatus(service) {
//   const httpHeaders = new HttpHeaders({
//       Authorization: `Bearer ${this.token}`
//     });
//     return this.http.post<any>(`${environment.apiUrl}/services/updateJobStatus`,service, {
//       headers: httpHeaders,
//     });

// }
// updateItemInfo(service) {
//   const httpHeaders = new HttpHeaders({
//       Authorization: `Bearer ${this.token}`
//     });
//     return this.http.post<any>(`${environment.apiUrl}/services/updateItemInfo`,service, {
//       headers: httpHeaders,
//     });

// }
getJobByJobId(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/getJobByJobId`,service, {
      headers: httpHeaders,
    });

}
 
deleteJob(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/deleteJob`,service, {
      headers: httpHeaders,
    });

}
deleteItem(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/deleteItem`,service, {
      headers: httpHeaders,
    });

}
getattachmentsByjobID(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/getattachmentsByjobID`,service, {
      headers: httpHeaders,
    });

}
deleteAttachment(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${environment.apiUrl}/services/deleteAttachment`,service, {
      headers: httpHeaders,
    });

}
updateCustomerinfo(customer) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/updateCustomerinfo`,customer, {
      headers: httpHeaders,
    });

}

getjobsByUserId(data) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getjobsByUserId`,data, {
      headers: httpHeaders,
    });

}
getJobByCustomerID(data) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getJobByCustomerID`,data, {
      headers: httpHeaders,
    });

}
getAllJobs() {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any>(`${environment.apiUrl}/services/getAllJobs`, {
      headers: httpHeaders,
    });

}
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}