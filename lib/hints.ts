export const hints = {
  energy:
    "How much fuel you have. Pick-for-me uses it to suggest a task that fits.",
  brainDump:
    "A scratchpad for everything in your head. Not a task list — just get it out.",
  highlight: "The one task that makes today count. Not the whole list.",
  pickForMe:
    "Scores your open tasks by importance, energy, due date, and size, then picks one.",
  micro:
    "A 2-minute action toward a habit. Small enough that starting is easy.",
  sprint:
    "A flexible focus timer. Stop whenever you like; rate how focused you were.",
  overwhelm: "Hides everything except your one highlight and the timer.",
  inbox: "Capture first, decide later. Nothing here needs a decision yet.",
  bucket: "Must, should, could: importance, not urgency.",
  activate: "Moves it into the pool that Today can pick from.",
  someday: "Parks it without deleting it.",
  weekHighlights: "Days you set a highlight and completed it.",
  weekMicro: "2-minute commitments you finished.",
  weekFocus: "Total sprint minutes and how many sprints.",
  weekUrgent:
    "Share of completed tasks that were 'must'. High means firefighting.",
  weekEstimate:
    "What you guessed vs what it took. Teaches you your real speed.",
  review: "Three questions, once a week. No perfect answers needed.",
  goals: "Long-term things and why they matter.",
  projects:
    "Belong to a goal; progress fills as linked tasks are completed.",
  settings: "Your account, agent keys, and calendar.",
  agentKeys:
    "Keys let agents read and write your tasks. Copy a key once, then revoke it anytime.",
  calendar:
    "Share your Google Calendar with the service account, then paste its ID here.",
} as const;

export type HintKey = keyof typeof hints;
