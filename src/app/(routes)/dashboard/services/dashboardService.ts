import { getAuthHeader } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

// Types
export interface StatCard {
  title: string;
  value: string;
  rawValue: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface SalesOverview {
  totalRevenue: {
    value: number;
    formatted: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  totalInvoices: {
    value: number;
    formatted: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  activeCustomers: {
    value: number;
    formatted: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  averageInvoice: {
    value: number;
    formatted: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  totalOutstanding?: {
    value: number;
    formatted: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  invoices: number;
  customers: number;
}

export interface InvoiceDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: string;
  rawAmount: number;
  status: string;
  date: string;
}

// API Response type for invoice from backend
interface ApiInvoice {
  _id: string;
  invoiceNumber?: string;
  customer?: {
    customerName?: string;
  };
  customerName?: string;
  total?: number;
  status?: string;
  invoiceDate?: string;
  createdAt?: string;
}

export interface TopCustomer {
  customerId: string;
  name: string;
  revenue: number;
  invoices: number;
}

export interface DashboardData {
  salesOverview: SalesOverview | null;
  monthlyRevenue: MonthlyRevenue[];
  invoiceDistribution: InvoiceDistribution[];
  recentInvoices: RecentInvoice[];
  topCustomers: TopCustomer[];
}

export interface DashboardFilters {
  dateRange?: string;
  companyId?: string;
}

class DashboardService {
  /**
   * Get sales overview statistics
   */
  async getSalesOverview(filters: DashboardFilters = {}): Promise<SalesOverview | null> {
    try {
      const authHeaders = getAuthHeader();
      const params = new URLSearchParams();

      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(
        `${API_BASE_URL}/api/reports/sales/overview?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch sales overview:', response.status);
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching sales overview:', error);
      return null;
    }
  }

  /**
   * Get monthly revenue data for charts
   */
  async getMonthlyRevenue(filters: DashboardFilters = {}): Promise<MonthlyRevenue[]> {
    try {
      const authHeaders = getAuthHeader();
      const params = new URLSearchParams();

      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(
        `${API_BASE_URL}/api/reports/sales/monthly-revenue?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch monthly revenue:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      return [];
    }
  }

  /**
   * Get invoice status distribution for pie chart
   */
  async getInvoiceDistribution(filters: DashboardFilters = {}): Promise<InvoiceDistribution[]> {
    try {
      const authHeaders = getAuthHeader();
      const params = new URLSearchParams();

      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(
        `${API_BASE_URL}/api/reports/sales/invoice-distribution?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch invoice distribution:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching invoice distribution:', error);
      return [];
    }
  }

  /**
   * Get recent invoices for the dashboard table
   */
  async getRecentInvoices(limit: number = 5): Promise<RecentInvoice[]> {
    try {
      const authHeaders = getAuthHeader();
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('page', '1');

      const response = await fetch(
        `${API_BASE_URL}/api/invoices?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch recent invoices:', response.status);
        return [];
      }

      const result = await response.json();

      if (!result.success || !result.data?.invoices) {
        return [];
      }

      // Transform the invoices to match our expected format
      return result.data.invoices.map((invoice: ApiInvoice) => ({
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber || `INV-${invoice._id?.slice(-6)}`,
        customer: invoice.customer?.customerName || invoice.customerName || 'Unknown',
        amount: `SAR ${(invoice.total || 0).toLocaleString()}`,
        rawAmount: invoice.total || 0,
        status: invoice.status || 'draft',
        date: invoice.invoiceDate
          ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
          : invoice.createdAt
            ? new Date(invoice.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
      }));
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      return [];
    }
  }

  /**
   * Get top customers by revenue
   */
  async getTopCustomers(filters: DashboardFilters = {}, limit: number = 5): Promise<TopCustomer[]> {
    try {
      const authHeaders = getAuthHeader();
      const params = new URLSearchParams();

      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.companyId) params.append('companyId', filters.companyId);
      params.append('limit', limit.toString());

      const response = await fetch(
        `${API_BASE_URL}/api/reports/sales/top-customers?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch top customers:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching top customers:', error);
      return [];
    }
  }

  /**
   * Fetch all dashboard data in parallel
   */
  async getDashboardData(filters: DashboardFilters = {}): Promise<DashboardData> {
    const [
      salesOverview,
      monthlyRevenue,
      invoiceDistribution,
      recentInvoices,
      topCustomers,
    ] = await Promise.all([
      this.getSalesOverview(filters),
      this.getMonthlyRevenue(filters),
      this.getInvoiceDistribution(filters),
      this.getRecentInvoices(5),
      this.getTopCustomers(filters, 5),
    ]);

    return {
      salesOverview,
      monthlyRevenue,
      invoiceDistribution,
      recentInvoices,
      topCustomers,
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
