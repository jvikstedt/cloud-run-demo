'use client';

import { useEffect, useState } from 'react';

interface ApiResponse {
  message: string;
  timestamp: string;
  environment: string;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <p>Hello World!</p>
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
      </main>
    </div>
  );
}
