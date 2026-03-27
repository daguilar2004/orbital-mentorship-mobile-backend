# Orbital Mentorship — MongoDB Schema Design

## Collection Overview

```
┌──────────┐     ┌──────────┐     ┌─────────────┐
│   User   │────▶│  Mentor  │────▶│  Mentorship │
│          │     │          │     │             │
│          │────▶│  Mentee  │────▶│             │
└──────────┘     └──────────┘     └──────┬──────┘
     │                                   │
     │                            ┌──────┴──────┐
     ▼                            │    Task     │
┌──────────┐                      └─────────────┘
│   Note   │
└──────────┘
```

---

## Relationships at a Glance

| From         | Field                  | Points To       | Type        |
|--------------|------------------------|-----------------|-------------|
| User         | mentorId               | Mentor          | One-to-One  |
| User         | menteeId               | Mentee          | One-to-One  |
| Mentor       | currentMentorships[]   | Mentorship      | One-to-Many |
| Mentor       | mentorshipHistory[]    | Mentorship      | One-to-Many |
| Mentor       | menteeRequests[]       | MentorshipReq   | One-to-Many |
| Mentee       | currentMentorship      | Mentorship      | One-to-One  |
| Mentee       | mentorshipHistory[]    | Mentorship      | One-to-Many |
| Mentee       | requestedMentors[]     | MentorshipReq   | One-to-Many |
| Mentorship   | mentorId               | Mentor          | Many-to-One |
| Mentorship   | menteeId               | Mentee          | Many-to-One |
| Mentorship   | tasks[]                | Task            | One-to-Many |
| Task         | mentorshipId           | Mentorship      | Many-to-One |
| Note         | userId                 | User            | Many-to-One |

> Notes are user-scoped (not mentorship-scoped).
> A user owns their notes regardless of which mentorship they're in.

---

## Collection: `users`

```
users
├── _id            ObjectId        PK
├── auth0Id        String          unique — from Auth0
├── email          String          unique
├── username       String
├── firstName      String
├── lastName       String
├── profilePictureURL  String
│
├── role           "mentor" | "mentee" | "admin"
├── currentStep    "roleSelection" | "questionnaire" | "profileSetup" | "connect" | "completed"
├── completedSteps String[]
│
├── mentorId       ObjectId ──────────────────────────────▶ mentors._id
├── menteeId       ObjectId ──────────────────────────────▶ mentees._id
│
├── zip            String
├── active         Boolean
│
├── websiteNotificationSettings  { ... }
├── audioNotificationSettings    { ... }
│
├── createdAt      Date
└── updatedAt      Date
```

---

## Collection: `mentors`

```
mentors
├── _id                ObjectId    PK
├── userId             ObjectId ──▶ users._id
├── name               String
├── badges             Array       (TODO: define badge shape)
│
├── menteeRequests[]   ObjectId[] ▶ MentorshipRequest (not yet modelled)
├── currentMentorships[] ObjectId[] ▶ mentorships._id
├── mentorshipHistory[]  ObjectId[] ▶ mentorships._id
│
├── module             Number      current module (default: 1)
│
├── profile
│   ├── bio            String      (max 2000)
│   ├── headline       String      (max 200)
│   ├── whatIcanProvide String     (max 2000)
│   ├── industryExperience String[]
│   ├── skills         String[]
│   ├── resumeFileURL  String
│   ├── linksURLs      String[]
│   ├── xp             Number
│   ├── questionnaireAns  Object   (TODO: define keys)
│   └── personality    MBTI enum
│
├── createdAt          Date
└── updatedAt          Date
```

---

## Collection: `mentees`

```
mentees
├── _id                ObjectId    PK
├── userId             ObjectId ──▶ users._id
├── name               String
├── badges             Array       (TODO: define badge shape)
│
├── requestedMentors[] ObjectId[] ▶ MentorshipRequest (not yet modelled)
├── currentMentorship  ObjectId ──▶ mentorships._id
├── mentorshipHistory[] ObjectId[] ▶ mentorships._id
│
├── module             Number      current module (default: 1)
│
├── profile
│   ├── bio            String      (max 2000)
│   ├── headline       String      (max 200)
│   ├── goalsForMentorship String  (max 2000)
│   ├── industryInterests String[]
│   ├── desiredSkills  String[]
│   ├── resumeFileURL  String
│   ├── linksURLs      String[]
│   ├── streak         Number
│   ├── rank           "Beginner Adventurer" | "Space explorer" | "Galactic Hero" | "Intergalactic Hero"
│   ├── xp             Number
│   ├── questionnaireAns  Object   (TODO: define keys)
│   └── personality    MBTI enum
│
├── createdAt          Date
└── updatedAt          Date
```

---

## Collection: `mentorships`

```
mentorships
├── _id                   ObjectId    PK
├── mentorId              ObjectId ──▶ mentors._id
├── menteeId              ObjectId ──▶ mentees._id
│
├── streamChatChannelId   String      Stream.io channel for this pair
│
├── tasks[]               ObjectId[] ▶ tasks._id
├── resources[]           ObjectId[] ▶ Resource (not yet modelled)
├── meetings[]            ObjectId[] ▶ Meeting  (not yet modelled)
│
├── trialPeriod           Boolean     true = still in module 2
│
├── moduleProgress[]
│   ├── moduleId          ObjectId ──▶ Module (not yet modelled)
│   ├── role              "mentor" | "mentee"
│   ├── moduleOrder       Number
│   ├── levels[]
│   │   ├── levelOrder    Number
│   │   ├── responses[]   { prompt: String, response: String }
│   │   ├── completedAt   Date
│   │   └── availableAt   Date
│   ├── xpEarned          Number
│   ├── completedAt       Date
│   └── availableAt       Date
│
├── createdAt             Date
└── updatedAt             Date
```

---

## Collection: `tasks`

```
tasks
├── _id               ObjectId    PK
├── mentorshipId      ObjectId ──▶ mentorships._id
│
├── phaseOrder        Number      which phase/module (1, 2, 3...)
├── title             String
├── category          String
├── dueDate           Date
├── status            "pending" | "submitted" | "approved" | "rejected"
├── xpPossible        Number      (default: 100)
├── description       String      mentor-written brief
│
├── submissionText    String      mentee fills this in
├── submissionFiles[] { name, url, sizeBytes, mimeType }  (S3 later)
├── submittedAt       Date
│
├── mentorFeedback    String      (max 2000)
├── reviewedAt        Date
├── completionDate    Date
│
├── createdAt         Date
└── updatedAt         Date
```

---

## Collection: `notes`  

```
notes
├── _id           ObjectId    PK
├── userId        ObjectId ──▶ users._id
├── userRole      "mentor" | "mentee"     role at time of creation
│
├── type          "Pre" | "During" | "Post" | "Daily" | "New"
├── title         String
│
├── sections[]                            replaces old text: Mixed
│   ├── label     String                  the section prompt / question
│   └── text      String                  the user's answer / content
│
├── formatting
│   ├── bold        Boolean  (default: false)
│   ├── italic      Boolean  (default: false)
│   ├── underline   Boolean  (default: false)
│   ├── fontSize    Number   (default: 16, min: 10, max: 32)
│   └── fontColor   String   (default: "#000000")
│
├── favorite      Boolean    (default: false)
├── deletedAt     Date       null = active | Date = soft-deleted
│
├── createdAt     Date
└── updatedAt     Date
```

### Note Types & Their Sections

| type    | label (display)    | userRole  | # sections |
|---------|--------------------|-----------|------------|
| Pre     | Pre-Session        | mentee    | 4          |
| Pre     | Pre-Session        | mentor    | 4 (different prompts) |
| During  | In Session         | both      | 5          |
| Post    | Post-Session       | both      | 1          |
| Daily   | Daily Reflection   | both      | 3          |
| New     | + New Note         | both      | 1 (blank label) |

### Indexes on `notes`

```js
{ userId: 1, deletedAt: 1, createdAt: -1 }       // primary list query
{ userId: 1, type: 1, deletedAt: 1 }              // category filter
{ userId: 1, favorite: 1, deletedAt: 1, createdAt: -1 }  // favorites view
{ title: "text", "sections.text": "text" }        // full-text search
```

---

## API Routes — Notes

```
POST   /api/notes/:userId              create a note
GET    /api/notes/:userId              get all notes (supports query params below)
GET    /api/notes/note/:noteId         get single note
PATCH  /api/notes/:noteId              update note content / formatting
PATCH  /api/notes/:noteId/favorite     toggle favorite (true ↔ false)
DELETE /api/notes/:noteId              soft delete (sets deletedAt)
DELETE /api/notes/:userId/all          soft delete all notes for a user
POST   /api/notes/bulk-delete          soft delete array of note IDs  { ids: [...] }
```

### GET Query Params

| Param      | Example         | Effect                              |
|------------|-----------------|-------------------------------------|
| `type`     | `?type=Pre`     | filter by category (comma-separated ok) |
| `search`   | `?search=hello` | search title + section text         |
| `sort`     | `?sort=az`      | `az` / `za` / omit for newest-first |
| `favorite` | `?favorite=true`| only return favorited notes         |

---

## Collections Still To Be Modelled

| Collection        | Referenced By              | Status    |
|-------------------|----------------------------|-----------|
| MentorshipRequest | Mentor, Mentee             | TODO      |
| Resource          | Mentorship                 | TODO      |
| Meeting           | Mentorship                 | TODO      |
| Module            | Mentorship.moduleProgress  | TODO      |
| Feedback          | (feedback controller exists) | TODO    |
