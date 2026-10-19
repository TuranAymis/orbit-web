# Web API compatibility aliases

Backend routes currently return bare arrays for `/groups`, `/events`, `/notifications`, and `/chats`. The web collection mapper also accepts `{items: [...]}` for pagination and the older named wrappers below. API requests keep the backend's snake_case names.

| Field or response | Aliases accepted | Mapped in |
| --- | --- | --- |
| Group image | `image_url` (list), `cover_image_url` (detail/create), `imageUrl`, `coverImageUrl` | `src/entities/group/mappers.ts` |
| Group list | array, `items`, `data`, `groups` | `src/entities/group/mappers.ts` |
| Event image | `cover_image_url` (backend), `image_url`, `coverImageUrl`, `imageUrl` | `src/entities/event/mappers.ts` |
| Event time | `starts_at`/`ends_at` (list/detail), `start_time`/`end_time` (create/read), `startsAt`/`endsAt` | `src/entities/event/mappers.ts` |
| Event list | array, `items`, `data`, `events` | `src/entities/event/mappers.ts` |
| Notification fields | `created_at`/`createdAt`, `is_read`/`isRead`, `related_entity_type`/`relatedEntityType`, `related_entity_id`/`relatedEntityId` | `src/entities/notification/mappers.ts` |
| Notification list and unread count | array, `items`, `notifications`; `count` (backend), `unreadCount`, number | `src/entities/notification/mappers.ts` |
| Chat message | `group_id`/`event_id` to `channelId`, `user_id` to `userId`, `created_at` to `createdAt` | `src/entities/message/mappers.ts` |
| Chat history | array, `items`, `messages`, `data` | `src/entities/message/mappers.ts` and `src/shared/lib/http/collectionMapper.ts` |
| Chat room state | `room_type`, `room_id`, `is_muted`, `unread_count`, `last_read_message_id`, `last_read_at` | `src/entities/message/mappers.ts` |

These aliases are response compatibility only. The current backend Pydantic schemas and route shapes remain authoritative when adding new fields.
