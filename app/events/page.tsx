import { eventsApi } from '@/lib/api';
import { Event } from '@/types';

async function getEvents(): Promise<Event[]> {
  try {
    return await eventsApi.getAll();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Eventos</h1>

      {events.length === 0 ? (
        <p className="text-gray-600">No se encontraron eventos o falló la carga de eventos.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              {event.description && <p className="text-gray-600 mb-2">{event.description}</p>}
              <p className="text-sm text-gray-500">
                📅 {new Date(event.date).toLocaleDateString('es-MX')}
              </p>
              {event.location && <p className="text-sm text-gray-500">📍 {event.location}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
