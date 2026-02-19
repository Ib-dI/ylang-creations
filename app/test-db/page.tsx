import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  try {
    const products = await db
      .select()
      .from(product)
      .orderBy(desc(product.createdAt));
    return (
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Database Test</h1>
        <div className="mb-4">
          <p>Product Count: {products.length}</p>
        </div>
        <pre className="max-h-[500px] overflow-auto rounded bg-gray-100 p-4">
          {JSON.stringify(products, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 p-4">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
        <pre className="text-red-600">{JSON.stringify(error, null, 2)}</pre>
        <p>{String(error)}</p>
      </div>
    );
  }
}
