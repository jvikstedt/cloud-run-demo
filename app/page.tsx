'use client';

import { useEffect, useState } from 'react';

interface ApiResponse {
  message: string;
  timestamp: string;
  environment: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ItemsResponse {
  items: Item[];
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/items')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
      })
      .then((data: ItemsResponse) => {
        setItems(data.items);
        setItemsLoading(false);
      })
      .catch((err) => {
        setItemsError(err.message);
        setItemsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start gap-8 py-32 px-16 bg-white dark:bg-black">

        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">API Status</h2>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {data && (
              <div>
                <p className="font-bold">Message: {data.message}</p>
                <p className="text-sm">Timestamp: {data.timestamp}</p>
                <p className="text-sm">Environment: {data.environment}</p>
              </div>
            )}
          </div>
        </section>
        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">Items List</h2>

          {itemsLoading && <p>Loading items...</p>}

          {itemsError && (
            <p className="text-red-500">Error: {itemsError}</p>
          )}

          {!itemsLoading && !itemsError && items.length === 0 && (
            <p className="text-gray-500">No items found</p>
          )}

          {!itemsLoading && !itemsError && items.length > 0 && (
            <div className="w-full space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
