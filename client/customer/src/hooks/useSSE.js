import { useEffect } from 'react';
import { API_BASE_URL } from '../config';

export function useSSE(url, onMessage) {
  useEffect(() => {
    if (!url) return;

    let eventSource;
    
    try {
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource?.close();
      };
    } catch (err) {
      console.error('SSE connection error:', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [url, onMessage]);
}
