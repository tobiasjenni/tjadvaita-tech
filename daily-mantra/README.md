# Daily Mantra

A small, reusable Baba Nam Kevalam meditation timer. [Open Daily Mantra](https://tobiasjenni.github.io/daily-mantra-meditation/) and press **Start meditation**.

- Day one is six minutes and begins only with the first actual Start.
- Every calendar day after that adds one minute, including skipped days. Calendar dates use the timezone recorded at the first Start, avoiding daylight-saving and travel surprises.
- Change today's duration (1–180 minutes), restore the suggestion, or restart progression. A timer reset keeps the original practice start date.
- Pause, resume, and refresh recovery use an absolute deadline rather than counting interval callbacks. The page catches up after background suspension. Changing the device clock during a running session can change the remaining time.
- The mantra is spoken exactly once on each new session's Start gesture using browser speech synthesis. Resume, reload, and tab synchronization do not speak it again. A Hindi voice is preferred with “बाबा नाम केवलम्”; otherwise an Indian-English or English voice receives “Baba Naam Kevalam”. Pronunciation and voice availability depend on the device. No recorded or looping mantra audio is included.
- **Your soundscape** has independent switches for the opening voice, ending gong, and ambient background music, plus **All sounds off**. All choices are remembered. Enabling the voice during a session never speaks it again.
- Choose an available Hindi or English opening voice, including a natural voice if your device provides one. No paid voice service or subscription is required.
- The gong is a single synthesized struck-metal sound with adjustable volume and an optional preview before a session. The original ambient music is a sustained, gently modulated instrumental chord generated in the browser, with no recordings, vocals, or external streaming. It fades in, pauses with the timer, and stops on reset, mute, or completion. Its oscillators are also scheduled to stop at the deadline independently of timer callbacks.
- A screen wake lock is requested where supported. Mobile browsers can suspend pages/audio when locked or backgrounded: this is not a guaranteed alarm. A reload restores timing and offers **Enable session audio** when a new user gesture is needed. This never replays the opening voice. When another tab changes the shared practice, this tab stops its audio to avoid duplicate playback.
- Preferences and the current session use localStorage. Nothing is sent to an application server. Clearing browser data removes the practice; separate browsers/devices have separate progress.

## Run and test

No build or application dependencies. Serve this folder with any static web server. ES modules require HTTP(S), rather than opening the HTML as a local file. Run `npm test` with Node 20+ for timing, calendar-date, persistence, and speech behavior tests.

Publish this folder on a static host. GitHub Pages serves this repository’s main branch from its root. The relative asset paths support repository subpaths. Fonts load from Google Fonts with local fallback fonts when unavailable.
