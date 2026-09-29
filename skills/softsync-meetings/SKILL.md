---
name: softsync-meetings
description: "Find calendar events, and manage booking pages: free times, bookings, booking a meeting for someone, rescheduling and cancelling. Use when the user asks when they meet someone, or wants to book, move or cancel a meeting."
---

<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Meetings

Two different things live here: **calendar events** synced from Google and Outlook, and **bookings** made through the workspace's booking pages.

## Calendar events
`list_calendar_events` answers "what meetings do I have this week?", "when did we last meet Acme?" and "who was at the kickoff?".
- A time window: `from` and `to` as ISO 8601 times. Use `order: oldest_first` for what is coming up, `newest_first` for the most recent.
- About a company or contact: look it up with `search_records`, then pass its id as the recordId.
- By words in the title or description: `search`.
- Each event lists its attendees, the video link and the records it is linked to. `get_message_by_id` with the `eventId` returns everything.
Recorded meeting summaries are not calendar events: a saved summary is a note on the company or contact.

## Booking pages
A meeting type is a booking page guests use to book time with the team.
1. `list_meeting_types`: each type, its length and its public `bookingUrl`. Sharing that link is usually all a user needs.
2. `find_meeting_slots`: free times in a window of up to 31 days. For an event type, it returns sessions with seats left and their `sessionId`.
3. `get_meeting_type`: the questions a guest must answer.
4. `book_meeting`: book for a guest with a free `start` and `answers` keyed by question label, e.g. {"Email": "ann@acme.com"}. Pass `sessionId` for an event. If an answer is missing, the error lists the questions.

## Managing bookings
- `list_meeting_bookings`: booked meetings, soonest first, with the guest, the hosts and the video link.
- `reschedule_meeting_booking`: move a booking to a new start time; it keeps its length. Check the time with `find_meeting_slots` first.
- `cancel_meeting_booking`: cancel and notify everyone. For an event session this cancels it for every guest.

## Rules
- Booking, rescheduling and cancelling send invites and emails to real people. Say who, when and what, and wait for a clear yes.
- Rescheduling and cancelling need the Admin role.
- Give times in the user's time zone and say which zone you mean.
