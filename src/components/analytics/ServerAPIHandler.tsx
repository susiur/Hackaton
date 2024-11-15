// src/components/analytics/ServerAPIHandler.tsx

export async function getPredictionData(userId: string | null, startDate: string, endDate: string) {
  const response = await fetch('http://NEXT_PUBLIC_API_URL/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      start_date: startDate,
      end_date: endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
