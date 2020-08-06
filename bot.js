const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const dateAndTime = require('./lib/dateAndTime');

module.exports = class Bot {
    constructor (auth) {
        let ONE_MINUTE = 60000;

        this.config = require('./config.json');

        this.calendar = google.calendar({version: 'v3', auth});
        
        this.intervalID = setInterval(this.checkEntrys, ONE_MINUTE * 5);
        this.checkEntrys();
    }
    async checkEntrys() {
        console.log('STARTING A SCRAPE');
        console.time('complete');
        const pupBrowser = await puppeteer.launch();
        const page = await pupBrowser.newPage();
        console.log('LOADING PAGE');
        console.time('load');
        await page.goto(this.config.schedule_url, {waitUntil: 'networkidle2', timeout: 60000});
        console.log('LOADED PAGE');
        console.timeEnd('load');

        await page.screenshot({fullPage: true, path: 'crack.png'})

        page.on('console', msg=> {
            let message = msg.text();
            process.stdout.write('\r> '+message)
        })

        console.time('scrape');
        let event = await page.evaluate(() => {
            function mc(match) {
                if (match && match[0] != undefined) {return 1} else {return 0}
            }

            const regex = {
                date: new RegExp('(?<=, )[\\w]* [\\d]*')
            }

            let event = {
                event: document.querySelector('h1').innerText.replace(' Schedule', ''),
                timezone: document.querySelector('#offset-detected').innerText,
                schedule: {},
                counter: 0
            };
            let counter = 0;
            let day, month;

            let rows = document.querySelectorAll('#runTable > tbody > tr');
            rows.forEach((row) => {
                console.log(counter);
                let id = counter.toString();

                if (row.classList.contains('day-split')) {

                    let match = row.querySelector('td').innerText.match(regex.date);
                    if (mc(match)) {
                        month = match[0].split(' ')[0].toLowerCase();
                        day = match[0].split(' ')[1];
                    }

                } else if (row.classList.contains('second-row')) {

                    let infos = row.querySelectorAll('td');
                    let length = infos[0].innerText;
                    let category = infos[1].innerText;
                    let host = infos[2].innerText;

                    event.schedule[id].length = length;
                    event.schedule[id].category = category;
                    event.schedule[id].host = host;

                    counter++;

                } else {
                    
                    let infos = row.querySelectorAll('td');
                    let startTime = infos[0].innerText;
                    let game = infos[1].innerText;
                    let runner = infos[2].innerText;
                    let setupLength = infos[3].innerText;

                    event.schedule[id] = {};
                    event.schedule[id].startTime = startTime;
                    event.schedule[id].game = game;
                    event.schedule[id].runner = runner;
                    event.schedule[id].setupLength = setupLength;
                    event.schedule[id].day = day;
                    event.schedule[id].month = month;

                }
            })

            event.counter = counter;

            return event;
        })
        console.log();
        console.timeEnd('scrape');
        console.log(event.event, event.timezone);

        await pupBrowser.close();

        console.log('SCRAPE DONE');
        console.timeEnd('complete');

        const year = parseInt(event.event.match(new RegExp('[0-9][0-9][0-9][0-9]'))[0]);
        let convertedEvents = [];

        for (let i=0; i<event.counter; i++) {
            let scheduleEvent = event.schedule[i.toString()];

            let tempStartTime = scheduleEvent.startTime.split(' ');
            let startTime = {
                hour: parseInt(tempStartTime[0].split(':')[0]),
                minute: parseInt(tempStartTime[0].split(':')[1]),
                second: 0,
                day: parseInt(scheduleEvent.day),
                year: year
            }
            if (tempStartTime[1] == 'AM') {
                if (startTime.hour == 12) {
                    startTime.hour = 0;
                }
            } else if (tempStartTime[1] == 'PM') {
                if (startTime.hour < 12) {
                    startTime.hour += 12;
                }
            }
            startTime.month = dateAndTime.monthNameToNumber(scheduleEvent.month);

            let endTime = Object.assign({},startTime);
            let length = scheduleEvent.length.replace(' ', '');
            length = length.split(':');
            length.forEach((e, i) => {
                length[i] = parseInt(e);
            });
            for (let k=0; k<length.length; k++) {
                let val = length[length.length-1-k];
                switch (k) {
                    case 0:
                        endTime.second += val;
                        break;
                    case 1:
                        endTime.minute += val;
                        break;
                    case 2:
                        endTime.hour += val;
                        break;
                    case 3:
                        endTime.day += val;
                        break;
                }
            }
            do {
                if (endTime.second>=60) {
                    endTime.second-=60;
                    endTime.minute++;
                }
            } while (endTime.second>=60);
            do {
                if (endTime.minute>=60) {
                    endTime.minute-=60;
                    endTime.hour++;
                }
            } while (endTime.minute>=60);
            do {
                if (endTime.hour>=24) {
                    endTime.hour-=24;
                    endTime.day++;
                }
            } while (endTime.hour>=24);
            do {
                if (endTime.day > dateAndTime.getDaysInMonth(endTime.month, endTime.year)) {
                    endTime.day -= dateAndTime.getDaysInMonth(endTime.month, endTime.year);
                    endTime.month++;
                }
                if (endTime.month>=12) {
                    endTime.month -= 12;
                    endTime.year++;
                }
            } while (endTime.day > dateAndTime.getDaysInMonth(endTime.month, endTime.year));

            startTime.timestamp = `${startTime.year}-${(startTime.month+1<10)?'0'+(startTime.month+1):startTime.month+1}-${startTime.day}T${(startTime.hour<10)?'0'+startTime.hour:startTime.hour}:${(startTime.minute<10)?'0'+startTime.minute:startTime.minute}:${(startTime.second<10)?'0'+startTime.second:startTime.second}`;
            endTime.timestamp = `${endTime.year}-${(endTime.month+1<10)?'0'+(endTime.month+1):endTime.month+1}-${endTime.day}T${(endTime.hour<10)?'0'+endTime.hour:endTime.hour}:${(endTime.minute<10)?'0'+endTime.minute:endTime.minute}:${(endTime.second<10)?'0'+endTime.second:endTime.second}`;

            convertedEvents.push({
                id: i,
                game: scheduleEvent.game,
                category: scheduleEvent.category,
                runner: scheduleEvent.runner,
                host: scheduleEvent.host,
                setupLength: scheduleEvent.setupLength.replace(new RegExp(' ','gm'),'').split(':'),
                startTime: startTime,
                endTime: endTime
            })
        }

        const id_regex = new RegExp('(?<=\\[ID:)\\d+(?=\\])');

        let calendarEntries = [];

        this.calendar.events.list({
            calendarId: 'ou7502s2f9tmmqqv4np8h9sn08@group.calendar.google.com',
            timeMin: (new Date()).toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err || res.data.items.length == 0) return;
            res.data.items.map((event, i) => {
                try {
                    calendarEntries.push({entryID: event.id, gameEventID: event.description.match(id_regex)[0], game: event.summary, start: event.start.dateTime, end: event.end.dateTime, description: event.description});
                }
                catch {}
            })

            insertOrUpdate(calendarEntries, convertedEvents, this.calendar, this.config);
        })

        function insertOrUpdate(calendarEntries, convertedEvents, googleCalendar, config) {
            function toDateNumber({year, month, day, hour, minute}) {
                month++;
                let strings = {
                    year: year.toString(),
                    month: (month<10)?'0'+month:month.toString(),
                    day: (day<10)?'0'+day:day.toString(),
                    hour: (hour<10)?'0'+hour:hour.toString(),
                    minute: (minute<10)?'0'+minute:minute.toString()
                }
                return parseInt(`${strings.year}${strings.month}${strings.day}${strings.hour}${strings.minute}`);
            }

            function eventDesciptionGen(id, game, category, runners, hosts, setupLength) {
                // https://www.google.com/search?q=${host.split(' ').join('+')}
                // https://www.google.com/search?q=${runner.split(' ').join('+')}
                return `<b>GAME:</b> ${game}<br><b>CATEGORY:</b> ${category}<br><b>RUNNER:</b> ${runners}<br><b>HOST:</b> ${hosts}<br><b>SETUPLENGTH:</b> ${setupLength}<br><br>[ID:${id}]`;
            }

            let now = new Date();
            let dateNumber = toDateNumber({year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hour: now.getHours(), minute: now.getMinutes()})
            let dateRegex = new RegExp('[0-9]+-[0-9]+-[0-9]+');
            let timeRegex = new RegExp('(?<=T)[0-9]+:[0-9]+:[0-9]+');
            convertedEvents.forEach((e) => {
                e.startTime.dateNumber = toDateNumber({year: e.startTime.year, month: e.startTime.month, day: e.startTime.day, hour: e.startTime.hour, minute: e.startTime.minute});
                e.endTime.dateNumber = toDateNumber({year: e.endTime.year, month: e.endTime.month, day: e.endTime.day, hour: e.endTime.hour, minute: e.endTime.minute});
                if (e.startTime.dateNumber<dateNumber) {
                    e.active = false;
                } else {
                    e.active = true;
                }
            })

            for (let i=0; i<convertedEvents.length; i++) {
                if (!convertedEvents[i].active) {
                    convertedEvents.splice(i,1);
                    i--;
                }
            }

            calendarEntries.forEach(e => {
                let date = e.start.match(dateRegex);
                let time = e.start.match(timeRegex);
                date = date[0].split('-');
                time = time[0].split(':');
                e.startDateNumber = toDateNumber({year: parseInt(date[0]), month: parseInt(date[1])-1, day: parseInt(date[2]), hour: parseInt(time[0]), minute: parseInt(time[1])});
                date = e.end.match(dateRegex);
                time = e.end.match(timeRegex);
                date = date[0].split('-');
                time = time[0].split(':');
                e.endDateNumber = toDateNumber({year: parseInt(date[0]), month: parseInt(date[1])-1, day: parseInt(date[2]), hour: parseInt(time[0]), minute: parseInt(time[1])});
            })

            let insert = [];
            let update = [];
            convertedEvents.forEach(scrapedEvent=>{
                let isFound = false;
                calendarEntries.forEach(calendarEvent=>{
                    if (calendarEvent.gameEventID==scrapedEvent.id.toString()) {
                        if (calendarEvent.startDateNumber != scrapedEvent.startTime.dateNumber || calendarEvent.endDateNumber != scrapedEvent.endTime.dateNumber || calendarEvent.description != eventDesciptionGen(scrapedEvent.id, scrapedEvent.game, scrapedEvent.category, scrapedEvent.runner, scrapedEvent.host, scrapedEvent.setupLength.join(':'))) {
                            update.push({s: scrapedEvent, c: calendarEvent});
                        }
                        isFound = true;
                    }
                })
                if (!isFound) {
                    insert.push(scrapedEvent);
                }
            })

            //console.log(convertedEvents[5], calendarEntries[5]);

            let dispMessage = true;
            let timeoutCounter = 1;
            insert.forEach(ins => {
                if (dispMessage) {
                    console.log('INSERTING...');
                    dispMessage = false;
                }
                console.time(ins.id);
                setTimeout(()=>{
                    let insertObj = {
                        calendarId: config.calendar_id,
                        sendUpdates: 'all',
                        requestBody: {
                            summary: ins.game,
                            start: {
                                dateTime: ins.startTime.timestamp+'.00+02:00'
                            },
                            end: {
                                dateTime: ins.endTime.timestamp+'.00+02:00'
                            },
                            description: eventDesciptionGen(ins.id, ins.game, ins.category, ins.runner, ins.host, ins.setupLength.join(':'))
                        }
                    }
                    googleCalendar.events.insert(insertObj, (err, res) => {
                        if (err) err.errors.forEach(msg=>{console.log(msg.message)});
                    })
                    console.timeEnd(ins.id);
                }, 300 * timeoutCounter++)
            })

            dispMessage = true;
            update.forEach(u => {
                if (dispMessage) {
                    console.log('UPDATING...');
                    dispMessage = false;
                }
                console.time(u.s.id);
                let tempCount = timeoutCounter;
                setTimeout(()=>{
                    let insertObj = {
                        calendarId: config.calendar_id,
                        eventId: u.c.entryID,
                        sendUpdates: 'all',
                        requestBody: {
                            summary: u.s.game,
                            start: {
                                dateTime: u.s.startTime.timestamp+'.00+02:00'
                            },
                            end: {
                                dateTime: u.s.endTime.timestamp+'.00+02:00'
                            },
                            description: eventDesciptionGen(u.s.id, u.s.game, u.s.category, u.s.runner, u.s.host, u.s.setupLength.join(':'))
                        }
                    }
                    googleCalendar.events.update(insertObj, (err, res) => {
                        if (err) err.errors.forEach(msg=>{console.log(msg.message)});
                    })
                    console.timeEnd(u.s.id);
                    if (timeoutCounter==tempCount) console.log('DONE!!!\n\n')
                }, 300 * timeoutCounter++)
            })

            if (update.length == 0 && insert == 0) {
                console.log('DONE!!!\n\n')
            }
        }
    }
}