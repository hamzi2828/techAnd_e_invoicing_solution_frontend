// Re-export shared components from create-invoice (they are default exports)
export { default as CustomerSelection } from '../../../create-invoice/components/CustomerSelection';
export { default as CompanySelection } from '../../../create-invoice/components/CompanySelection';
export { default as LineItemsTable } from '../../../create-invoice/components/LineItemsTable';
export { default as QuotationSummary } from '../../../create-invoice/components/InvoiceSummary';
export { default as NewCustomerModal } from '../../../create-invoice/components/NewCustomerModal';

// Quotation-specific components (to be created)
export { QuotationPreview } from './QuotationPreview';
