import { ReviewsTable } from "./reviews-table";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customer Reviews Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Monitor, approve, and manage customer product ratings and reviews.
        </p>
      </div>

      <ReviewsTable />
    </div>
  );
}

