# artiCO Shadowing Tool 🎙️

**Shadow. Record. Compare. Repeat.**

ArtiCO is a web-based language learning tool designed to help you improve your speaking skills through the "shadowing" technique. It allows you to practice with YouTube videos, segment transcripts, record your voice, and compare it with the original audio—all synced to the cloud.

## ✨ Features

*   **YouTube Integration**: Practice with any YouTube video (requires API Key) or use the fallback mode for single links.
*   **Smart Segmentation**: Break down videos into practice segments with start/end times and labels.
*   **Shadowing Recorder**: Record your voice (Audio & Video) while watching the original clip.
*   **Dual Mode Storage**:
    *   **Cloud Mode (LoggedIn)**: Syncs Groups, Videos, Segments, and Recordings to Supabase. Accessible across devices.
    *   **Local Mode (Guest)**: Saves data to your browser's IndexedDB. Private and offline-capable.
*   **Library Management**: Organize your practice videos into custom groups with progress tracking.
*   **History**: Track your recent practice sessions.

## 🛠️ Technology Stack

*   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, TypeScript)
*   **Styling**: Tailwind CSS & Shadcn/UI
*   **Backend**: [Supabase](https://supabase.com/)
    *   **Auth**: Email/Password authentication
    *   **Database**: PostgreSQL for relational data (Sessions, Library)
    *   **Storage**: Buckets for storing user audio/video recordings
*   **Local Storage**: `idb-keyval` for offline/guest data

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/thisizkavi-lab/articotool.git
cd artico-shadowing-tool
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory with the following keys:

```env
# Required for Auth & Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for YouTube Search & Playlists (Optional but recommended)
YOUTUBE_API_KEY=your_youtube_data_api_key
```

### 3. Supabase Setup
1.  Create a new Supabase project.
2.  Run the SQL Schema found in `supabase/schema.sql` in your Supabase SQL Editor to create tables.
3.  **Critical Update**: Ensure you run this snippet to enable Cloud Segments:
    ```sql
    alter table library_videos add column if not exists segments jsonb default '[]'::jsonb;
    ```
4.  Create a strict Storage Bucket named `recordings`.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start practicing!

## 🤝 Contributing
1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
