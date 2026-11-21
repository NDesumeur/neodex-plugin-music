# NeoMusic

NeoDex's music player: online (streamed) or offline (downloaded) playlists, adding music from YouTube, SoundCloud or Deezer, an equaliser, a visualiser, detailed listening statistics, achievements and levels that unlock themes, shortcuts that work anywhere in Windows and a small floating player.

*Version française : [README.md](README.md)*

## Before you start

Adding and downloading music relies on **yt-dlp**, a free Python tool. If it is missing, NeoMusic says so and gives the command: `python -m pip install -U yt-dlp`.

## Playlists

- **New playlist**: give it a name and choose its mode.
  - **Offline**: each added track is downloaded and plays without a connection.
  - **Online**: only the cover is kept; the music is streamed when played.
- Three playlists are managed by NeoMusic and cannot be deleted:
  - **Favourites**: tracks marked with a heart;
  - **Release radar**: up to 24 new releases from the artists you listen to, updated every week;
  - **Weekly discoveries**: 12 tracks close to your taste, updated every week.
  - The radar only takes what is already out (no announced albums, reissues, compilations or live records), the most played track of each release, and checks that YouTube gives the right song. The **UPDATE** button runs the search right away; if nothing is found, the previous tracks stay.
- Inside a playlist: search by title or artist, filter by duration (under 3 min, 3 to 5 min, over 5 min) and sort (recently added, recently played, alphabetical, artist, release date). The **cover wall** view replaces the list with a grid.
- Select several tracks to add them to another playlist, favourite them or delete them at once. For an offline track, **Show file** opens its folder.

## Adding music

- **Search / import**: type a track name to search YouTube and pick from the results, or paste a link to a YouTube video or playlist, a SoundCloud track or playlist, or a Deezer track or playlist.
- **Find an artist**: lists an artist's tracks, tick the ones to add.
- **Import a playlist**: from a playlist link or a CSV file exported from another service ("Track Name" and artist columns). The import can be cancelled; the summary shows the tracks added, already present and not found.
- **Recommended for you** suggests a track based on your listening; **Suggest another** draws another one.

## Playback

- Play, pause, previous, next, shuffle, progress bar (optionally with the track's waveform), volume and left / right balance.
- A 10-band **equaliser**, from 31 Hz to 16 kHz, with ready-made profiles (Normal, Bass boost, Bass extreme, Treble, Rock, Electronic, Vocal) and a Custom profile as soon as you move a slider; the audio profile arrows switch between profiles.
- A **limiter** against distortion at high volume, and **volume normalisation** between tracks (ReplayGain).
- **Sleep mode**: stops after a number of tracks or a duration in minutes.
- **Music alarm**: playback starts at the chosen time (HH:MM).
- **Mini player**: a small floating window. Drag to move it, click to play or pause, double-click to return to NeoMusic, scroll for volume.

## Global shortcuts

Play / pause, previous and next track, volume up and down, mute, skip forward and back 10 seconds, shuffle, favourite the current track, full screen and mini player. They work anywhere in Windows, even with NeoDex in the background.

In **Options**, click a field then press the combination you want: it must include Ctrl, Alt or Shift, except F1 to F12 which can be used alone. Backspace or Delete disables a shortcut, Escape cancels.

## Statistics

Total plays, time listened, distinct tracks and artists, average length, active days, current and best streak, most active day, plays today, this week and this month, activity over the last 14 days, spread by day of the week, top 10 tracks (by plays and by time), top 10 artists and recent activity.

## Levels and achievements

- Every minute listened raises your **level**; each level takes longer than the last (about 115 hours of listening for level 100).
- 18 colour **themes**, each with its own font (Classic, Terminal, Round or Grimoire; Arcade can be picked in Options), all at the same letter height to stay readable, 7 of which unlock with your level: Onyx (3), Grenat (6), Aube (10), Ambre (16), Abyme (24), Sakura (35) and Néon (50).
- Level 100: the **super visualiser** (reflection, sparks, glow and bass pulse).
- Level 150: the current cover becomes a full **vinyl turntable**, with wood, stone or metal bases and arms to combine, unlocked up to level 190.
- Level 200: the **Deluxe interface**, which changes the app's whole style.
- 34 **achievements** to unlock: number of plays, day streaks, listening at night or on 25 December, favourites, playlists, shortcuts… Click a locked achievement to see how to get it.

## Options

The window has four tabs:

- **Appearance**: the theme (even themes not unlocked yet show their colours, with their level), the font, the **animated ambience** of the theme: a small pixel scene behind the app, different for each theme, sober and crisp like Cyber's code rain: a single motif moving over the whole background (a trip through the stars, diamonds crossed by a wave of light, sunrise and clouds, honeycomb, bubbles, ripples on water, ruby facets, snow over the mountains, gears, lines of waves, sun rays, light trails on a grid, rainy city, pine forest, cherry branch, fireflies…), speeding up with the bass; Cyber stays quiet behind the player, the display (visualiser, vinyl cover, waveform, pixel app, cover wall, mini player, the date shown in the list: none, added or release), the turntable, and your level with what it unlocks next.
- **Sound**: same volume for every track, equaliser, limiter and balance.
- **Shortcuts**: the global shortcuts.
- **More**: the Discord status, the **no covers** mode for slow PCs, maintenance (check library, log, size on disk) and the QR code export.

An empty playlist says what to do, with the SEARCH / IMPORT and FIND AN ARTIST buttons.
- **Bin**: a deleted track can be restored for 7 days.
- **Check library**: finds missing files (to remove or download again), duplicates and files that are in no playlist.
- Error **log** (downloads, playback, imports) and NeoMusic's **size** on disk, broken down by category.
- **Export as QR codes**: the track list of a playlist (YouTube link, otherwise title), to scan with NeoMusic on a phone.
- Every setting is saved as soon as it changes: no button to click.

## Discord status

Your friends see on Discord the song you are listening to ("Listening to NeoMusic"), with the title, the artist, the cover when the song comes from the Internet and the time left; nothing while music is paused. Discord must be open on the same PC. To turn it on: on [discord.com/developers](https://discord.com/developers/applications), **New Application**, name it *NeoMusic*, copy its **Application ID**, then in NeoMusic **Options → Discord** paste it and tick *Show the current song in my Discord status*. An image named "neomusic" in the application's **Rich Presence → Art Assets** is used as the default cover. Everything goes through the Discord app on the PC: no account or password is asked.

## Data and sync

Your library, playlists, statistics, achievements and settings are stored by NeoDex, backed up and synced between your PCs when sync is on. Additions and deletions are merged from both sides; for statistics and level, the highest value wins. On another PC, offline tracks download again on their own.

## Install

In NeoDex: **NeoStore → Discover → NeoMusic → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).

## Version 2.1.0

- Larger text everywhere: lists, settings, statistics, mini player.
- Missing English texts added (New, Favorite, Another, plays).
