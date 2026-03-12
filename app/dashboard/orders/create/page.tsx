import { InvoiceForm } from "../invoice-form";

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create invoice</h1>
        <p className="text-muted-foreground mt-1">Create a new order / invoice for a customer</p>
      </div>
      <InvoiceForm />
    </div>
  );
}
