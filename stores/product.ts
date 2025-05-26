import { ReportModel } from "@/models/";
import axios from "@/helpers/axios";

export const UseReportStore = defineStore("reports", {
  state() {
    return {
      request_invoice_report: {
        sale_date: null,
        loading: false,
        agency_id: null as string | null,
      },
      response_invoice_report: [] as ReportModel.GetInvoiceReportResponseItem[],
      response_payment_transactions:
        [] as ReportModel.GetPaymentInvoiceTransactionReportResponseItem[],
      request_payment_transaction: {
        sale_date: null,
        loading: false,
        agency_id: null as string | null,
      },

      request_get_sales: {
        date: {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        loading: false,
      },

      response_get_sales:
        null as ReportModel.GetReportSaleTotalResponseItem | null,
      response_list_data: [] as Array<number | string>,
      request_get_debts: {
        sale_date: null,
        loading: false,
        agency_id: null,
      },

      response_get_debts: [] as ReportModel.GetDebtReportResponseItem[],
      request_get_invoice_not_creates: {
        sale_date: null,
        loading: false,
      },
      response_get_invoice_not_creates:
        [] as ReportModel.GetInvoiceNotCreateResposeItem[],

      request_invoice_totals: {
        sale_date: {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        loading: false,
      },

      response_invoice_totals: [] as ReportModel.GetInvoiceReportResponseItem[],
    };
  },

  actions: {
    async GetInvoiceReport() {
      try {
        this.request_invoice_report.loading = true;
        const dayjs = useDayjs();
        const res = await axios.get<ReportModel.GetInvoiceReportResponse>(
          "/api/v1/reports/invoices/get-data",
          {
            params: {
              ...this.request_invoice_report,
              sale_date:
                this.request_invoice_report.sale_date != null
                  ? dayjs(this.request_invoice_report.sale_date).format(
                      "YYYY-MM-DD"
                    )
                  : "",
            },
          }
        );
        if (res.status === 200) {
          this.response_invoice_report = res.data.items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_invoice_report.loading = false;
      }
    },

    async GetInvoiceTotalReport() {
      try {
        this.request_invoice_totals.loading = true;
        const dayjs = useDayjs();
        const res = await axios.get<ReportModel.GetInvoiceReportResponse>(
          "/api/v1/reports/invoices/get-total",
          {
            params: {
              year: this.request_invoice_totals.sale_date.year,
              month: this.request_invoice_totals.sale_date.month + 1,
            },
          }
        );
        if (res.status === 200) {
          this.response_invoice_totals = res.data.items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_invoice_totals.loading = false;
      }
    },

    async GetReportPaymentTransaction() {
      const dayjs = useDayjs();
      try {
        if (this.request_payment_transaction.sale_date == null) {
          return;
        }

        this.request_payment_transaction.loading = true;
        const res =
          await axios.get<ReportModel.GetPaymentInvoiceTransactionReportResponse>(
            "/api/v1/reports/invoices/payment-transactions",
            {
              params: {
                ...this.request_payment_transaction,
                sale_date:
                  this.request_payment_transaction.sale_date != null
                    ? dayjs(this.request_payment_transaction.sale_date).format(
                        "YYYY-MM-DD"
                      )
                    : null,
              },
            }
          );

        if (res.status === 200) {
          this.response_payment_transactions = res.data.items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_payment_transaction.loading = false;
      }
    },

    async GetReportSaleData() {
      try {
        this.request_get_sales.loading = true;
        const res = await axios.get<ReportModel.GetReportSaleTotalResponse>(
          "/api/v1/reports/sales/get-total",
          {
            params: {
              month: this.request_get_sales.date.month + 1,
              year: this.request_get_sales.date.year,
            },
          }
        );

        if (res.status === 200) {
          this.response_get_sales = res.data.items;
          const headers = res.data.items?.headers ?? [];
          if (headers.length > 0) {
            const dayjs = useDayjs();
            for (let i = 0; i < headers.length; i++) {
              let header = headers[i];
              if (header !== "Row Labels") {
                if (header !== "Grand Total") {
                  this.response_get_sales.headers[i] =
                    dayjs(header).format("DD-MMM-YYYY");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_get_sales.loading = false;
      }
    },

    async GetDebtReportData() {
      try {
        this.request_get_debts.loading = true;
        const dayjs = useDayjs();
        const res = await axios.get<ReportModel.GetDebtReportResponse>(
          "/api/v1/reports/debts/get-data",
          {
            params: {
              ...this.request_get_debts,
              sale_date:
                this.request_get_debts.sale_date != null
                  ? dayjs(this.request_get_debts.sale_date).format("YYYY-MM-DD")
                  : "",
            },
          }
        );
        if (res.status === 200) {
          this.response_get_debts = res.data.items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_get_debts.loading = false;
      }
    },

    async GetInvoiceNotCreateReport() {
      try {
        this.request_get_invoice_not_creates.loading = true;
        const dayjs = useDayjs();
        const res = await axios.get<ReportModel.GetInvoiceNotCreateResponse>(
          "/api/v1/reports/invoices/not-create",
          {
            params: {
              ...this.request_get_invoice_not_creates,
              sale_date: dayjs(
                this.request_get_invoice_not_creates.sale_date
              ).format("YYYY-MM-DD"),
            },
          }
        );

        if (res.status === 200) {
          this.response_get_invoice_not_creates = res.data.items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.request_get_invoice_not_creates.loading = false;
      }
    },
  },
});