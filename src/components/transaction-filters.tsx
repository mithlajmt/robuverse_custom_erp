import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";

export function TransactionFilters({
  categories,
  defaults = {}
}: {
  categories: Array<{ id: string; name: string }>;
  defaults?: Record<string, string | undefined>;
}) {
  return (
    <Card className="mb-4">
      <CardContent>
        <form className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-end">
          <div>
            <Label htmlFor="query">Search</Label>
            <Input id="query" name="query" defaultValue={defaults.query} placeholder="Description, reference, notes" />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={defaults.categoryId ?? ""}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" defaultValue={defaults.from} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" defaultValue={defaults.to} />
          </div>
          <Button className="w-full md:w-auto" type="submit">
            <Search className="h-4 w-4" />
            Filter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
