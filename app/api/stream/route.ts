import { addSSEClient, removeSSEClient, getGuardianState } from '@/lib/guardian-loop';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial state immediately
      const initialState = getGuardianState();
      const message = { 
        type: 'positions_update', 
        data: initialState.positions, 
        timestamp: new Date().toISOString() 
      };
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      
      // Also send alerts
      if (initialState.alerts.length > 0) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'alert_history',
          data: initialState.alerts,
          timestamp: new Date().toISOString()
        })}\n\n`));
      }

      // Register with guardian loop
      addSSEClient(controller);
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        removeSSEClient(controller);
        try {
          controller.close();
        } catch (e) {
          // Stream already closed
        }
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
