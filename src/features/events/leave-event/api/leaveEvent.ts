export async function leaveEvent(eventId: string) {
  throw new Error(
    `Leaving events is not supported by the local backend yet for event ${eventId}.`,
  );
}
