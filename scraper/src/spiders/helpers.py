import re

class helpers(object):
   
    @classmethod
    def parse_element(self, container, tag, text):
        ele = container.find(tag, text=re.compile(text))
        return ele.text.replace(text, '') if ele is not None else None
    

