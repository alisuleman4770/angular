import {
  Component,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpClientModule,
  HttpParams
} from '@angular/common/http';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs';


/* =========================================================
   ORDER TYPES
   ========================================================= */

interface Order {

  id: string | number;

  orderNumber: string | number;

  dateTime: string;

  customer: string;

  items: number;

  total: number;

  paymentStatus:
    | 'Paid'
    | 'Pending'
    | 'Failed'
    | string;

  orderStatus:
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'Cancelled'
    | string;
}


interface OrderStats {

  allOrders: number;

  needAttention: number;

  completed: number;

  totalSales: number;
}


interface OrdersResponse {

  data: Order[];

  total: number;

  stats: OrderStats;
}


@Component({

  selector: 'app-orders',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './orders.html',

  styleUrl: './orders.css'

})


export class Orders implements OnInit, OnDestroy {


  /* =======================================================
     API
     ======================================================= */

  private readonly apiUrl =
  'https://app.plusonehq.com/orders';


  private readonly destroy$ =
    new Subject<void>();


  private readonly searchSubject =
    new Subject<string>();


  constructor(
    private http: HttpClient
  ) {}


  /* =======================================================
     SIGNALS
     ======================================================= */

  orders = signal<Order[]>([]);

  loading = signal<boolean>(false);

  error = signal<string>('');

  toast = signal<string>('');

  selectedOrder =
    signal<Order | null>(null);

  showDetails =
    signal<boolean>(false);


  /* =======================================================
     FILTER SIGNALS
     ======================================================= */

  search =
    signal<string>('');

  orderStatus =
    signal<string>('All');

  paymentStatus =
    signal<string>('All');


  /* =======================================================
     PAGINATION
     ======================================================= */

  page =
    signal<number>(1);

  limit =
    signal<number>(10);

  total =
    signal<number>(0);


  /* =======================================================
     STATS
     ======================================================= */

  stats = signal<OrderStats>({

    allOrders: 0,

    needAttention: 0,

    completed: 0,

    totalSales: 0

  });


  /* =======================================================
     DROPDOWN OPTIONS
     ======================================================= */

  orderStatuses = [

    'All',

    'Pending',

    'Processing',

    'Completed',

    'Cancelled'

  ];


  paymentStatuses = [

    'All',

    'Paid',

    'Pending',

    'Failed'

  ];


  /* =======================================================
     INIT
     ======================================================= */

  ngOnInit(): void {

    this.setupSearch();

    this.getOrders();

  }


  /* =======================================================
     SEARCH WITH 500ms DEBOUNCE
     ======================================================= */

  setupSearch(): void {

    this.searchSubject

      .pipe(

        debounceTime(500),

        distinctUntilChanged(),

        takeUntil(
          this.destroy$
        )

      )

      .subscribe(value => {

        this.search.set(value);

        this.page.set(1);

        this.getOrders();

      });

  }


  onSearch(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.searchSubject.next(
      input.value
    );

  }


  /* =======================================================
     ORDER STATUS FILTER
     ======================================================= */

  onOrderStatusChange(
    value: string
  ): void {

    this.orderStatus.set(value);

    this.page.set(1);

    this.getOrders();

  }


  /* =======================================================
     PAYMENT STATUS FILTER
     ======================================================= */

  onPaymentStatusChange(
    value: string
  ): void {

    this.paymentStatus.set(value);

    this.page.set(1);

    this.getOrders();

  }


  /* =======================================================
     GET ORDERS API
     ======================================================= */

  getOrders(): void {

    this.loading.set(true);

    this.error.set('');


    let params =
      new HttpParams()

        .set(
          'page',
          this.page()
        )

        .set(
          'limit',
          this.limit()
        );


    /* SEARCH */

    if (
      this.search().trim()
    ) {

      params =
        params.set(
          'search',
          this.search().trim()
        );

    }


    /* ORDER STATUS */

    if (
      this.orderStatus() !== 'All'
    ) {

      params =
        params.set(
          'orderStatus',
          this.orderStatus()
        );

    }


    /* PAYMENT STATUS */

    if (
      this.paymentStatus() !== 'All'
    ) {

      params =
        params.set(
          'paymentStatus',
          this.paymentStatus()
        );

    }


    /* API REQUEST */

    this.http

      .get<OrdersResponse>(
        this.apiUrl,
        { params }
      )

      .pipe(
        takeUntil(
          this.destroy$
        )
      )

      .subscribe({

        next: response => {

          this.orders.set(
            response.data ?? []
          );


          this.total.set(
            response.total ?? 0
          );


          this.stats.set({

            allOrders:
              response.stats?.allOrders ?? 0,

            needAttention:
              response.stats?.needAttention ?? 0,

            completed:
              response.stats?.completed ?? 0,

            totalSales:
              response.stats?.totalSales ?? 0

          });


          this.loading.set(false);

        },


        error: error => {

          console.error(
            'Orders API Error:',
            error
          );


          this.orders.set([]);

          this.loading.set(false);

          this.error.set(
            'Unable to load orders.'
          );

          this.showToast(
            'Failed to load orders. Please try again.'
          );

        }

      });

  }


  /* =======================================================
     FILTER BUTTON
     ======================================================= */

  applyFilters(): void {

    this.page.set(1);

    this.getOrders();

  }


  /* =======================================================
     CLEAR FILTERS
     ======================================================= */

  clearFilters(): void {

    this.search.set('');

    this.orderStatus.set('All');

    this.paymentStatus.set('All');

    this.page.set(1);

    this.getOrders();

  }


  /* =======================================================
     PAGINATION
     ======================================================= */

  get totalPages(): number {

    return Math.ceil(
      this.total() /
      this.limit()
    );

  }


  get pageNumbers(): number[] {

    const pages =
      this.totalPages;

    const current =
      this.page();

    if (pages <= 5) {

      return Array.from(
        { length: pages },
        (_, i) => i + 1
      );

    }


    if (current <= 3) {

      return [
        1,
        2,
        3,
        4,
        5
      ];

    }


    if (current >= pages - 2) {

      return [
        pages - 4,
        pages - 3,
        pages - 2,
        pages - 1,
        pages
      ];

    }


    return [

      current - 2,

      current - 1,

      current,

      current + 1,

      current + 2

    ];

  }


  previousPage(): void {

    if (
      this.page() > 1
    ) {

      this.page.update(
        value => value - 1
      );

      this.getOrders();

    }

  }


  nextPage(): void {

    if (
      this.page() < this.totalPages
    ) {

      this.page.update(
        value => value + 1
      );

      this.getOrders();

    }

  }


  goToPage(
    pageNumber: number
  ): void {

    if (
      pageNumber < 1 ||
      pageNumber > this.totalPages ||
      pageNumber === this.page()
    ) {

      return;

    }


    this.page.set(
      pageNumber
    );

    this.getOrders();

  }


  /* =======================================================
     VIEW ORDER
     ======================================================= */

  viewOrder(
    order: Order
  ): void {

    this.selectedOrder.set(
      order
    );

    this.showDetails.set(
      true
    );


    /* GET /api/orders/:id */

    this.http

      .get<Order>(
        `${this.apiUrl}/${order.id}`
      )

      .pipe(
        takeUntil(
          this.destroy$
        )
      )

      .subscribe({

        next: response => {

          this.selectedOrder.set(
            response
          );

        },

        error: error => {

          console.error(
            'Order Details Error:',
            error
          );

          this.showToast(
            'Unable to load order details.'
          );

        }

      });

  }


  closeDetails(): void {

    this.showDetails.set(
      false
    );

    this.selectedOrder.set(
      null
    );

  }


  /* =======================================================
     STATUS COLORS
     ======================================================= */

  getStatusClass(
    status: string
  ): string {

    switch (
      status?.toLowerCase()
    ) {

      case 'completed':

        return 'status-completed';


      case 'pending':

        return 'status-pending';


      case 'processing':

        return 'status-processing';


      case 'cancelled':

        return 'status-cancelled';


      default:

        return 'status-default';

    }

  }


  /* =======================================================
     PAYMENT COLORS
     ======================================================= */

  getPaymentClass(
    status: string
  ): string {

    switch (
      status?.toLowerCase()
    ) {

      case 'paid':

        return 'payment-paid';


      case 'pending':

        return 'payment-pending';


      case 'failed':

        return 'payment-failed';


      default:

        return 'payment-default';

    }

  }


  /* =======================================================
     CURRENCY
     ======================================================= */

  formatCurrency(
    value: number
  ): string {

    return new Intl.NumberFormat(
      'en-US',
      {

        style: 'currency',

        currency: 'USD'

      }
    ).format(
      value ?? 0
    );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  showToast(
    message: string
  ): void {

    this.toast.set(
      message
    );


    setTimeout(() => {

      this.toast.set('');

    }, 3000);

  }


  /* =======================================================
     DESTROY
     ======================================================= */

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}
