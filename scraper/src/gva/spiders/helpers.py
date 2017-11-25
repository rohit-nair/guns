import re
from datetime import date
from calendar import monthrange
class helpers(object):
   
    @classmethod
    def parse_element(self, container, tag, text):
        ele = container.find(tag, text=re.compile(text))
        return ele.text.replace(text, '') if ele is not None else None
    

    @classmethod
    def get_day_range_for_quarter(self, year, quarter):
        if quarter is None or quarter > 4 or type(quarter) is not int or type(year) is not int:
            return None
        first_day = date(year, 3*(quarter-1)+1, 1)
        last_day = date(year, 3*quarter, monthrange(year, 3*quarter)[1])

        return (int(first_day.strftime('%j')), int(last_day.strftime('%j')))
