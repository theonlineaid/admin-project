import { CouponsTable } from "./coupons-table";

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Discount Coupons & Promotions</h1>
        <p className="text-muted-foreground mt-1">
          Create, track, and manage promotional codes and order discounts.
        </p>
      </div>

      <CouponsTable />
    </div>
  );
}

