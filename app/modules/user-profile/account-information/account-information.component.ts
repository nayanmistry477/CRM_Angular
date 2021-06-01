import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService, UserModel } from '../../auth';
import { UserService } from '../../auth/_services/user.service';
interface DropDownList {
  code: any
  text: any
}

interface CountryList {
  name: any
  code: any
}

interface DateList {
  formate: any
}
interface Language {

  text: any
}
interface TimeZone {
  value: any
  text: any
}
@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.scss']
})
export class AccountInformationComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  user: UserModel;
  firstUserState: UserModel;
  subscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;

  public filteredCountry: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public countryMultiFilterCtrl: FormControl = new FormControl();

  public filteredCurrency: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public currencyMultiFilterCtrl: FormControl = new FormControl();

  public filteredTimeZone: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public timeZoneMultiFilterCtrl: FormControl = new FormControl();

  public filteredLanguage: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public languageMultiFilterCtrl: FormControl = new FormControl();

  protected _onDestroy = new Subject<void>();
  public searching: boolean = false;

  dateList: DateList[] = [
    { formate: "" }
  ]

  public languageVal: Language[] = [
    { text: 'English UK' },
    { text: 'English US' },
    { text: 'German' },
    { text: 'Spanish' },
    { text: 'French' },
    { text: 'Italian' },
    { text: 'Portuguese' },
  ]

  private timeZoneVal: TimeZone[] = [
    {
      "value": -12,
      "text": "(GMT -12:00) Eniwetok, Kwajalein"
    },
    {
      "value": -11,
      "text": "(GMT -11:00) Midway Island, Samoa"
    },
    {
      "value": -10,
      "text": "(GMT -10:00) Hawaii"
    },
    {
      "value": -9,
      "text": "(GMT -9:00) Alaska"
    },
    {
      "value": -8,
      "text": "(GMT -8:00) Pacific Time (US & Canada)"
    },
    {
      "value": -7,
      "text": "(GMT -7:00) Mountain Time (US & Canada)"
    },
    {
      "value": -6,
      "text": "(GMT -6:00) Central Time (US & Canada), Mexico City"
    },
    {
      "value": -5,
      "text": "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima"
    },
    {
      "value": -4,
      "text": "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"
    },
    {
      "value": -3.5,
      "text": "(GMT -3:30) Newfoundland"
    },
    {
      "value": -3,
      "text": "(GMT -3:00) Brazil, Buenos Aires, Georgetown"
    },
    {
      "value": -2,
      "text": "(GMT -2:00) Mid-Atlantic"
    },
    {
      "value": -1,
      "text": "(GMT -1:00) Azores, Cape Verde Islands"
    },
    {
      "value": 0,
      "text": "(GMT) Western Europe Time, London, Lisbon, Casablanca"
    },
    {
      "value": 1,
      "text": "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"
    },
    {
      "value": 2,
      "text": "(GMT +2:00) Kaliningrad, South Africa"
    },
    {
      "value": 3,
      "text": "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"
    },
    {
      "value": 3.5,
      "text": "(GMT +3:30) Tehran"
    },
    {
      "value": 4,
      "text": "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"
    },
    {
      "value": 4.5,
      "text": "(GMT +4:30) Kabul"
    },
    {
      "value": 5,
      "text": "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"
    },
    {
      "value": 5.5,
      "text": "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"
    },
    {
      "value": 5.75,
      "text": "(GMT +5:45) Kathmandu"
    },
    {
      "value": 6,
      "text": "(GMT +6:00) Almaty, Dhaka, Colombo"
    },
    {
      "value": 7,
      "text": "(GMT +7:00) Bangkok, Hanoi, Jakarta"
    },
    {
      "value": 8,
      "text": "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"
    },
    {
      "value": 9,
      "text": "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"
    },
    {
      "value": 9.5,
      "text": "(GMT +9:30) Adelaide, Darwin"
    },
    {
      "value": 10,
      "text": "(GMT +10:00) Eastern Australia, Guam, Vladivostok"
    },
    {
      "value": 11,
      "text": "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"
    },
    {
      "value": 12,
      "text": "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"
    }
  ]

  private countryVal: CountryList[] = [
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Åland Islands', code: 'AX' },
    { name: 'Albania', code: 'AL' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'American Samoa', code: 'AS' },
    { name: 'AndorrA', code: 'AD' },
    { name: 'Angola', code: 'AO' },
    { name: 'Anguilla', code: 'AI' },
    { name: 'Antarctica', code: 'AQ' },
    { name: 'Antigua and Barbuda', code: 'AG' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Armenia', code: 'AM' },
    { name: 'Aruba', code: 'AW' },
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' },
    { name: 'Azerbaijan', code: 'AZ' },
    { name: 'Bahamas', code: 'BS' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Barbados', code: 'BB' },
    { name: 'Belarus', code: 'BY' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Belize', code: 'BZ' },
    { name: 'Benin', code: 'BJ' },
    { name: 'Bermuda', code: 'BM' },
    { name: 'Bhutan', code: 'BT' },
    { name: 'Bolivia', code: 'BO' },
    { name: 'Bosnia and Herzegovina', code: 'BA' },
    { name: 'Botswana', code: 'BW' },
    { name: 'Bouvet Island', code: 'BV' },
    { name: 'Brazil', code: 'BR' },
    { name: 'British Indian Ocean Territory', code: 'IO' },
    { name: 'Brunei Darussalam', code: 'BN' },
    { name: 'Bulgaria', code: 'BG' },
    { name: 'Burkina Faso', code: 'BF' },
    { name: 'Burundi', code: 'BI' },
    { name: 'Cambodia', code: 'KH' },
    { name: 'Cameroon', code: 'CM' },
    { name: 'Canada', code: 'CA' },
    { name: 'Cape Verde', code: 'CV' },
    { name: 'Cayman Islands', code: 'KY' },
    { name: 'Central African Republic', code: 'CF' },
    { name: 'Chad', code: 'TD' },
    { name: 'Chile', code: 'CL' },
    { name: 'China', code: 'CN' },
    { name: 'Christmas Island', code: 'CX' },
    { name: 'Cocos (Keeling) Islands', code: 'CC' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Comoros', code: 'KM' },
    { name: 'Congo', code: 'CG' },
    { name: 'Congo, The Democratic Republic of the', code: 'CD' },
    { name: 'Cook Islands', code: 'CK' },
    { name: 'Costa Rica', code: 'CR' },
    { name: 'Cote D\'Ivoire', code: 'CI' },
    { name: 'Croatia', code: 'HR' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Cyprus', code: 'CY' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Djibouti', code: 'DJ' },
    { name: 'Dominica', code: 'DM' },
    { name: 'Dominican Republic', code: 'DO' },
    { name: 'Ecuador', code: 'EC' },
    { name: 'Egypt', code: 'EG' },
    { name: 'El Salvador', code: 'SV' },
    { name: 'Equatorial Guinea', code: 'GQ' },
    { name: 'Eritrea', code: 'ER' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Ethiopia', code: 'ET' },
    { name: 'Falkland Islands (Malvinas)', code: 'FK' },
    { name: 'Faroe Islands', code: 'FO' },
    { name: 'Fiji', code: 'FJ' },
    { name: 'Finland', code: 'FI' },
    { name: 'France', code: 'FR' },
    { name: 'French Guiana', code: 'GF' },
    { name: 'French Polynesia', code: 'PF' },
    { name: 'French Southern Territories', code: 'TF' },
    { name: 'Gabon', code: 'GA' },
    { name: 'Gambia', code: 'GM' },
    { name: 'Georgia', code: 'GE' },
    { name: 'Germany', code: 'DE' },
    { name: 'Ghana', code: 'GH' },
    { name: 'Gibraltar', code: 'GI' },
    { name: 'Greece', code: 'GR' },
    { name: 'Greenland', code: 'GL' },
    { name: 'Grenada', code: 'GD' },
    { name: 'Guadeloupe', code: 'GP' },
    { name: 'Guam', code: 'GU' },
    { name: 'Guatemala', code: 'GT' },
    { name: 'Guernsey', code: 'GG' },
    { name: 'Guinea', code: 'GN' },
    { name: 'Guinea-Bissau', code: 'GW' },
    { name: 'Guyana', code: 'GY' },
    { name: 'Haiti', code: 'HT' },
    { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
    { name: 'Holy See (Vatican City State)', code: 'VA' },
    { name: 'Honduras', code: 'HN' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Hungary', code: 'HU' },
    { name: 'Iceland', code: 'IS' },
    { name: 'India', code: 'IN' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Iran, Islamic Republic Of', code: 'IR' },
    { name: 'Iraq', code: 'IQ' },
    { name: 'Ireland', code: 'IE' },
    { name: 'Isle of Man', code: 'IM' },
    { name: 'Israel', code: 'IL' },
    { name: 'Italy', code: 'IT' },
    { name: 'Jamaica', code: 'JM' },
    { name: 'Japan', code: 'JP' },
    { name: 'Jersey', code: 'JE' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Kiribati', code: 'KI' },
    { name: 'Korea, Democratic People\'S Republic of', code: 'KP' },
    { name: 'Korea, Republic of', code: 'KR' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Kyrgyzstan', code: 'KG' },
    { name: 'Lao People\'S Democratic Republic', code: 'LA' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Lebanon', code: 'LB' },
    { name: 'Lesotho', code: 'LS' },
    { name: 'Liberia', code: 'LR' },
    { name: 'Libyan Arab Jamahiriya', code: 'LY' },
    { name: 'Liechtenstein', code: 'LI' },
    { name: 'Lithuania', code: 'LT' },
    { name: 'Luxembourg', code: 'LU' },
    { name: 'Macao', code: 'MO' },
    { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
    { name: 'Madagascar', code: 'MG' },
    { name: 'Malawi', code: 'MW' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Maldives', code: 'MV' },
    { name: 'Mali', code: 'ML' },
    { name: 'Malta', code: 'MT' },
    { name: 'Marshall Islands', code: 'MH' },
    { name: 'Martinique', code: 'MQ' },
    { name: 'Mauritania', code: 'MR' },
    { name: 'Mauritius', code: 'MU' },
    { name: 'Mayotte', code: 'YT' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Micronesia, Federated States of', code: 'FM' },
    { name: 'Moldova, Republic of', code: 'MD' },
    { name: 'Monaco', code: 'MC' },
    { name: 'Mongolia', code: 'MN' },
    { name: 'Montserrat', code: 'MS' },
    { name: 'Morocco', code: 'MA' },
    { name: 'Mozambique', code: 'MZ' },
    { name: 'Myanmar', code: 'MM' },
    { name: 'Namibia', code: 'NA' },
    { name: 'Nauru', code: 'NR' },
    { name: 'Nepal', code: 'NP' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Netherlands Antilles', code: 'AN' },
    { name: 'New Caledonia', code: 'NC' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Nicaragua', code: 'NI' },
    { name: 'Niger', code: 'NE' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Niue', code: 'NU' },
    { name: 'Norfolk Island', code: 'NF' },
    { name: 'Northern Mariana Islands', code: 'MP' },
    { name: 'Norway', code: 'NO' },
    { name: 'Oman', code: 'OM' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Palau', code: 'PW' },
    { name: 'Palestinian Territory, Occupied', code: 'PS' },
    { name: 'Panama', code: 'PA' },
    { name: 'Papua New Guinea', code: 'PG' },
    { name: 'Paraguay', code: 'PY' },
    { name: 'Peru', code: 'PE' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Pitcairn', code: 'PN' },
    { name: 'Poland', code: 'PL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Puerto Rico', code: 'PR' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Reunion', code: 'RE' },
    { name: 'Romania', code: 'RO' },
    { name: 'Russian Federation', code: 'RU' },
    { name: 'RWANDA', code: 'RW' },
    { name: 'Saint Helena', code: 'SH' },
    { name: 'Saint Kitts and Nevis', code: 'KN' },
    { name: 'Saint Lucia', code: 'LC' },
    { name: 'Saint Pierre and Miquelon', code: 'PM' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC' },
    { name: 'Samoa', code: 'WS' },
    { name: 'San Marino', code: 'SM' },
    { name: 'Sao Tome and Principe', code: 'ST' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'Senegal', code: 'SN' },
    { name: 'Serbia and Montenegro', code: 'CS' },
    { name: 'Seychelles', code: 'SC' },
    { name: 'Sierra Leone', code: 'SL' },
    { name: 'Singapore', code: 'SG' },
    { name: 'Slovakia', code: 'SK' },
    { name: 'Slovenia', code: 'SI' },
    { name: 'Solomon Islands', code: 'SB' },
    { name: 'Somalia', code: 'SO' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
    { name: 'Spain', code: 'ES' },
    { name: 'Sri Lanka', code: 'LK' },
    { name: 'Sudan', code: 'SD' },
    { name: 'Suriname', code: 'SR' },
    { name: 'Svalbard and Jan Mayen', code: 'SJ' },
    { name: 'Swaziland', code: 'SZ' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Syrian Arab Republic', code: 'SY' },
    { name: 'Taiwan, Province of China', code: 'TW' },
    { name: 'Tajikistan', code: 'TJ' },
    { name: 'Tanzania, United Republic of', code: 'TZ' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Timor-Leste', code: 'TL' },
    { name: 'Togo', code: 'TG' },
    { name: 'Tokelau', code: 'TK' },
    { name: 'Tonga', code: 'TO' },
    { name: 'Trinidad and Tobago', code: 'TT' },
    { name: 'Tunisia', code: 'TN' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Turkmenistan', code: 'TM' },
    { name: 'Turks and Caicos Islands', code: 'TC' },
    { name: 'Tuvalu', code: 'TV' },
    { name: 'Uganda', code: 'UG' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'United States', code: 'US' },
    { name: 'United States Minor Outlying Islands', code: 'UM' },
    { name: 'Uruguay', code: 'UY' },
    { name: 'Uzbekistan', code: 'UZ' },
    { name: 'Vanuatu', code: 'VU' },
    { name: 'Venezuela', code: 'VE' },
    { name: 'Viet Nam', code: 'VN' },
    { name: 'Virgin Islands, British', code: 'VG' },
    { name: 'Virgin Islands, U.S.', code: 'VI' },
    { name: 'Wallis and Futuna', code: 'WF' },
    { name: 'Western Sahara', code: 'EH' },
    { name: 'Yemen', code: 'YE' },
    { name: 'Zambia', code: 'ZM' },
    { name: 'Zimbabwe', code: 'ZW' }
  ];


  CurrencyList: DropDownList[] = [
    { code: "AFN", text: "Afghanistan Afghanis – AFN" },
    { code: "ALL", text: "Albania Leke – ALL" },
    { code: "DZD", text: "Algeria Dinars – DZD" },
    { code: "ARS", text: "Argentina Pesos – ARS" },
    { code: "AUD", text: "Australia Dollars – AUD" },
    { code: "ATS", text: "Austria Schillings – ATS" },
    { code: "BSD", text: "Bahamas Dollars – BSD" },
    { code: "BHD", text: "Bahrain Dinars – BHD" },
    { code: "BDT", text: "Bangladesh Taka – BDT" },
    { code: "BBD", text: "Barbados Dollars – BBD" },
    { code: "BEF", text: "Belgium Francs – BEF" },
    { code: "BMD", text: "Bermuda Dollars – BMD" },
    { code: "BRL", text: "Brazil Reais – BRL" },
    { code: "BGN", text: "Bulgaria Leva – BGN" },
    { code: "CAD", text: "Canada Dollars – CAD" },
    { code: "XOF", text: "CFA BCEAO Francs – XOF" },
    { code: "XAF", text: "CFA BEAC Francs – XAF" },
    { code: "CLP", text: "Chile Pesos – CLP" },
    { code: "CNY", text: "China Yuan Renminbi – CNY" },
    { code: "COP", text: "Colombia Pesos – COP" },
    { code: "XPF", text: "CFP Francs – XPF" },
    { code: "CRC", text: "Costa Rica Colones – CRC" },
    { code: "HRK", text: "Croatia Kuna – HRK" },
    { code: "CYP", text: "Cyprus Pounds – CYP" },
    { code: "CZK", text: "Czech Republic Koruny – CZK" },
    { code: "DKK", text: "Denmark Kroner – DKK" },
    { code: "DEM", text: "Deutsche (Germany) Marks – DEM" },
    { code: "DOP", text: "Dominican Republic Pesos – DOP" },
    { code: "NLG", text: "Dutch (Netherlands) Guilders - NLG" },
    { code: "XCD", text: "Eastern Caribbean Dollars – XCD" },
    { code: "EGP", text: "Egypt Pounds – EGP" },
    { code: "EEK", text: "Estonia Krooni – EEK" },
    { code: "EUR", text: "Euro – EUR" },
    { code: "FJD", text: "Fiji Dollars – FJD" },
    { code: "FIM", text: "Finland Markkaa – FIM" },
    { code: "FRF", text: "France Francs – FRF" },
    { code: "DEM", text: "Germany Deutsche Marks – DEM" },
    { code: "XAU", text: "Gold Ounces – XAU" },
    { code: "GRD", text: "Greece Drachmae – GRD" },
    { code: "GTQ", text: "Guatemalan Quetzal – GTQ" },
    { code: "NLG", text: "Holland (Netherlands) Guilders – NLG" },
    { code: "HKD", text: "Hong Kong Dollars – HKD" },
    { code: "HUF", text: "Hungary Forint – HUF" },
    { code: "ISK", text: "Iceland Kronur – ISK" },
    { code: "XDR", text: "IMF Special Drawing Right – XDR" },
    { code: "INR", text: "India Rupees – INR" },
    { code: "IDR", text: "Indonesia Rupiahs – IDR" },
    { code: "IRR", text: "Iran Rials – IRR" },
    { code: "IQD", text: "Iraq Dinars – IQD" },
    { code: "IEP", text: "Ireland Pounds – IEP" },
    { code: "ILS", text: "Israel New Shekels – ILS" },
    { code: "ITL", text: "Italy Lire – ITL" },
    { code: "JMD", text: "Jamaica Dollars – JMD" },
    { code: "JPY", text: "Japan Yen – JPY" },
    { code: "JOD", text: "Jordan Dinars – JOD" },
    { code: "KES", text: "Kenya Shillings – KES" },
    { code: "KRW", text: "Korea (South) Won – KRW" },
    { code: "KWD", text: "Kuwait Dinars – KWD" },
    { code: "LBP", text: "Lebanon Pounds – LBP" },
    { code: "LUF", text: "Luxembourg Francs – LUF" },
    { code: "MYR", text: "Malaysia Ringgits – MYR" },
    { code: "MTL", text: "Malta Liri – MTL" },
    { code: "MUR", text: "Mauritius Rupees – MUR" },
    { code: "MXN", text: "Mexico Pesos – MXN" },
    { code: "MAD", text: "Morocco Dirhams – MAD" },
    { code: "NLG", text: "Netherlands Guilders – NLG" },
    { code: "NZD", text: "New Zealand Dollars – NZD" },
    { code: "NOK", text: "Norway Kroner – NOK" },
    { code: "OMR", text: "Oman Rials – OMR" },
    { code: "PKR", text: "Pakistan Rupees – PKR" },
    { code: "XPD", text: "Palladium Ounces – XPD" },
    { code: "PEN", text: "Peru Nuevos Soles – PEN" },
    { code: "PHP", text: "Philippines Pesos – PHP" },
    { code: "XPT", text: "Platinum Ounces – XPT" },
    { code: "PLN", text: "Poland Zlotych – PLN" },
    { code: "PTE", text: "Portugal Escudos – PTE" },
    { code: "QAR", text: "Qatar Riyals – QAR" },
    { code: "RON", text: "Romania New Lei – RON" },
    { code: "ROL", text: "Romania Lei – ROL" },
    { code: "RUB", text: "Russia Rubles – RUB" },
    { code: "SAR", text: "Saudi Arabia Riyals – SAR" },
    { code: "XAG", text: "Silver Ounces – XAG" },
    { code: "SGD", text: "Singapore Dollars – SGD" },
    { code: "SKK", text: "Slovakia Koruny – SKK" },
    { code: "SIT", text: "Slovenia Tolars – SIT" },
    { code: "ZAR", text: "South Africa Rand – ZAR" },
    { code: "KRW", text: "South Korea Won – KRW" },
    { code: "ESP", text: "Spain Pesetas – ESP" },
    { code: "XDR", text: "Special Drawing Rights (IMF) – XDR" },
    { code: "LKR", text: "Sri Lanka Rupees – LKR" },
    { code: "SDD", text: "Sudan Dinars – SDD" },
    { code: "SEK", text: "Sweden Kronor – SEK" },
    { code: "CHF", text: "Switzerland Francs – CHF" },
    { code: "TWD", text: "Taiwan New Dollars – TWD" },
    { code: "THB", text: "Thailand Baht – THB" },
    { code: "TTD", text: "Trinidad and Tobago Dollars – TTD" },
    { code: "TND", text: "Tunisia Dinars – TND" },
    { code: "TRY", text: "Turkey New Lira – TRY" },
    { code: "AED", text: "United Arab Emirates Dirhams – AED" },
    { code: "GBP", text: "United Kingdom Pounds – GBP" },
    { code: "USD", text: "United States Dollars – USD" },
    { code: "VEB", text: "Venezuela Bolivares – VEB" },
    { code: "VND", text: "Vietnam Dong – VND" },
    { code: "ZMK", text: "Zambia Kwacha – ZMK" },
  ]

  constructor(private userService: AuthService, public employeeService: UserService, private cdr: ChangeDetectorRef, private toastr: ToastrService, private fb: FormBuilder) {
    this.isLoading$ = this.userService.isLoadingSubject.asObservable();
    this.getCompanyDetails();
  }


  ngOnInit(): void {


    this.filteredCountry.next(this.countryVal.slice());

    this.countryMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filteredCountryList()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });


    this.filteredCurrency.next(this.CurrencyList.slice());

    this.currencyMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filteredCurrencyList();
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });

    this.filteredTimeZone.next(this.timeZoneVal.slice());

    this.timeZoneMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filteredTimeZoneList();
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
    this.filteredLanguage.next(this.languageVal.slice());

    this.countryMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.searching = false;
        this.filteredlanguageList()
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });

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
      // username: [this.user.username, Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      language: [''],
      timeZone: [''],
      companyName: [''],
      regNo: [''],
      phone: [''],
      website: [''],
      vatNo: [''],
      streetAddress1: [''],
      streetAddress2: [''],
      town: [''],
      city: [''],
      postCode: [''],
      country: [''],
      paymentTerms: [''],
      paymentDetails: [''],
      currency: [''],
      dateFormat: [''],
    });
  }

  isDataSaved: boolean = false;
  save() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }
    this.isDataSaved = true;
    const formValues = this.formGroup.value;

    this.employeeService.updateCompanySettings(formValues)
      .subscribe(
        data => {
          console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isDataSaved = false;
          } else {
            this.toastr.success(data.data.message)

            this.formGroup.reset();
            this.formGroup.untouched;
            this.isDataSaved = false;
            this.getCompanyDetails();
            // this.cdr.markForCheck();
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
          this.toastr.success(error)
        })
    // prepar user
    console.log(formValues)


    // Do request to your server for user update, we just imitate user update there

    // setTimeout(() => {
    //   this.userService.currentUserSubject.next(Object.assign({}, this.user));
    //   this.userService.isLoadingSubject.next(false);
    // }, 2000);
  }
  getCompanyDetails() {

    this.employeeService.getCompanyDetails()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) {


          } else {
            var result = data.result[0];
            console.log(result)
            // this.formGroup.controls['disclaimer'].setValue(result.disclaimer);
            this.formGroup.controls['email'].setValue(result.email);
            this.formGroup.controls['language'].setValue(result.language);
            this.formGroup.controls['timeZone'].setValue(result.timeZone);
            this.formGroup.controls['companyName'].setValue(result.companyName);
            this.formGroup.controls['regNo'].setValue(result.regNo);
            this.formGroup.controls['phone'].setValue(result.phone);
            this.formGroup.controls['website'].setValue(result.website);
            this.formGroup.controls['vatNo'].setValue(result.vatNo);
            this.formGroup.controls['streetAddress1'].setValue(result.streetAddress1);
            this.formGroup.controls['streetAddress2'].setValue(result.streetAddress2);
            this.formGroup.controls['town'].setValue(result.town);
            this.formGroup.controls['city'].setValue(result.city);
            this.formGroup.controls['postCode'].setValue(result.postCode);
            this.formGroup.controls['country'].setValue(result.country);
            this.formGroup.controls['paymentTerms'].setValue(result.paymentTerms);
            this.formGroup.controls['paymentDetails'].setValue(result.paymentDetails);
            this.formGroup.controls['currency'].setValue(result.currency);
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  cancel() {
    // this.user = Object.assign({}, this.firstUserState);
    // this.loadForm();
    this.getCompanyDetails()
  }
  selectCountry(val) {

  }

  selectCurrency(val) {

  }
  selectTimeZone(val) {

  }
  selectLanguage(val) {

  }
  filteredCountryList() {
    if (!this.countryVal) {
      return;
    }
    // get the search keyword
    let search = this.countryMultiFilterCtrl.value;
    if (!search) {
      this.filteredCountry.next(this.countryVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCountry.next(
      this.countryVal.filter(item => item.name.toLowerCase().indexOf(search) > -1 || item.name.toUpperCase().indexOf(search) > -1)
    );
  }

  filteredlanguageList() {
    if (!this.languageVal) {
      return;
    }
    // get the search keyword
    let search = this.languageMultiFilterCtrl.value;
    if (!search) {
      this.filteredLanguage.next(this.languageVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLanguage.next(
      this.languageVal.filter(item => item.text.toLowerCase().indexOf(search) > -1 || item.text.toUpperCase().indexOf(search) > -1)
    );
  }

  filteredCurrencyList() {
    if (!this.CurrencyList) {
      return;
    }
    // get the search keyword
    let search = this.currencyMultiFilterCtrl.value;
    if (!search) {
      this.filteredCurrency.next(this.CurrencyList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCurrency.next(
      this.CurrencyList.filter(item => item.text.toLowerCase().indexOf(search) > -1 || item.text.toUpperCase().indexOf(search) > -1)
    );
  }

  filteredTimeZoneList() {
    if (!this.timeZoneVal) {
      return;
    }
    // get the search keyword
    let search = this.timeZoneMultiFilterCtrl.value;
    if (!search) {
      this.filteredTimeZone.next(this.timeZoneVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredTimeZone.next(
      this.timeZoneVal.filter(item => item.text.toLowerCase().indexOf(search) > -1 || item.text.toUpperCase().indexOf(search) > -1)
    );
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
}
