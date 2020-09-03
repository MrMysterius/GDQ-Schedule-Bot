module.exports = {
    getDaysInMonth: (month, year) => {
        const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
        const DAYS_IN_MONTH_LEAP_YEAR = [31,29,31,30,31,30,31,31,30,31,30,31];
        let leap_year = false;
        if (year % 400 == 0 || year % 4 == 0) {
            return DAYS_IN_MONTH_LEAP_YEAR[month];
        } else {
            return DAYS_IN_MONTH[month];
        }
    },
    
    monthNameToNumber: (monthName) => {
        switch(monthName.toLowerCase()) {
            case 'january':
                return 0;
            case 'febuary':
                return 1;
            case 'march':
                return 2;
            case 'april':
                return 3;
            case 'may':
                return 4;
            case 'june':
                return 5;
            case 'july':
                return 6;
            case 'august':
                return 7;
            case 'september':
                return 8;
            case 'october':
                return 9;
            case 'november':
                return 10;
            case 'december':
                return 11;
        }
    }
}
