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
                break;
            case 'febuary':
                return 1;
                break;
            case 'march':
                return 2;
                break;
            case 'april':
                return 3;
                break;
            case 'may':
                return 4;
                break;
            case 'june':
                return 5;
                break;
            case 'july':
                return 6;
                break;
            case 'august':
                return 7;
                break;
            case 'september':
                return 8;
                break;
            case 'october':
                return 9;
                break;
            case 'november':
                return 10;
                break;
            case 'december':
                return 11;
                break;
        }
    }
}