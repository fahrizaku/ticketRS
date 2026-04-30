import { NextRequest } from 'next/server';
import { eventBus, EVENTS } from '@/app/lib/events';
import { getSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  // Hanya user yang login yang bisa buka koneksi
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Fungsi untuk mengirim pesan ke client dalam format SSE
      const emit = (eventName: string, data: any) => {
        const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Listener untuk notifikasi baru (khusus untuk user ini)
      const onNotification = (data: { userId: string; notification: any }) => {
        if (data.userId === session.id) {
          emit(EVENTS.NOTIFICATION_NEW, data.notification);
        }
      };

      // Listener untuk update tiket (bisa didengar semua orang/admin)
      const onTicketUpdate = (data: any) => {
        emit(EVENTS.TICKET_UPDATED, data);
      };

      // Pasang listener
      eventBus.on(EVENTS.NOTIFICATION_NEW, onNotification);
      eventBus.on(EVENTS.TICKET_UPDATED, onTicketUpdate);

      // Kirim pesan awal untuk memastikan koneksi terbuka
      emit('connected', { status: 'ok', userId: session.id });

      // Jaga koneksi agar tidak timeout (Keep-alive)
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Bersihkan listener saat koneksi ditutup oleh client
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        eventBus.off(EVENTS.NOTIFICATION_NEW, onNotification);
        eventBus.off(EVENTS.TICKET_UPDATED, onTicketUpdate);
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
