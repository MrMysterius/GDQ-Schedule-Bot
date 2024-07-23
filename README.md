>[!WARNING]
**THIS IS NOW A PUBLIC ARCHIVE, BECAUSE GAMES DONE QUICK UPDATED THEIR SCHEDULE PAGE LAYOUT, SO THIS IS DEFUNCT!!!**

# GDQ-Schedule-Bot
[![CodeFactor](https://www.codefactor.io/repository/github/mrmysterius/gdq-schedule-bot/badge/master)](https://www.codefactor.io/repository/github/mrmysterius/gdq-schedule-bot/overview/master)

Webscrapper for the GamesDoneQuick Schedule that is then turned into a google calendar

## Just adding the Calendar

[![Import](https://img.shields.io/static/v1?label=Import%20Google%20Calendar&style=for-the-badge&color=blue&message=Click%20Here)](https://calendar.google.com/calendar/b/0?cid=b3U3NTAyczJmOXRtbXFxdjRucDhoOXNuMDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ)

You can just add the calendar to your own calendar [here](https://calendar.google.com/calendar/b/0?cid=b3U3NTAyczJmOXRtbXFxdjRucDhoOXNuMDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ).

## For own use

If you want to use it for yourself you need to make a `config.json` file and also add a `credentials.json` file into the root directory. The `credentials.json` file can be downloaded from the site where you make a google application (mainly for google calendar).

### Config Example

This the config.json example that is needed!

```json
{
    "calendar_id": "GOOGLE_CALENDAR_ID",
    "schedule_url": "https://gamesdonequick.com/schedule"
}
```

## Iframe Preview (Only on Pages)

<iframe src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=2&amp;bgcolor=%236b8eff&amp;ctz=Europe%2FBerlin&amp;src=b3U3NTAyczJmOXRtbXFxdjRucDhoOXNuMDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;color=%233F51B5&amp;title&amp;showNav=1&amp;mode=AGENDA&amp;hl=en&amp;showCalendars=0&amp;showTabs=1&amp;showPrint=0&amp;showDate=0" style="border:solid 1px #777" width="400" height="600" frameborder="0" scrolling="no"></iframe>
