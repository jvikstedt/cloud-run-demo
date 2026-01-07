'use client';

import { useQuery } from '@tanstack/react-query';

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
  const {
    data,
    isLoading: loading,
    error: apiError,
  } = useQuery({
    queryKey: ['hello'],
    queryFn: async (): Promise<ApiResponse> =>
      fetch('/api/hello').then((r) => r.json()),
  });

  const {
    data: itemsData,
    isLoading: itemsLoading,
    error: itemsApiError,
  } = useQuery({
    queryKey: ['items'],
    queryFn: async (): Promise<ItemsResponse> =>
      fetch('/api/items').then((r) => r.json()),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start gap-8 py-32 px-16 bg-white dark:bg-black">
        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">API Status</h2>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {loading && <p>Loading...</p>}
            {apiError && (
              <p className="text-red-500">Error: {apiError.message}</p>
            )}
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

          {itemsApiError && (
            <p className="text-red-500">Error: {itemsApiError.message}</p>
          )}

          {!itemsLoading && !itemsApiError && itemsData?.items.length === 0 && (
            <p className="text-gray-500">No items found</p>
          )}

          {!itemsLoading &&
            !itemsApiError &&
            itemsData &&
            itemsData.items.length > 0 && (
              <div className="w-full space-y-4">
                {itemsData.items.map((item) => (
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
