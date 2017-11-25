# -*- coding: utf-8 -*-
import re
from helpers import helpers
from bs4 import BeautifulSoup

class IncidentParser(object):

    @classmethod
    def parse_incident(self, response):
        data = {}
        data['geolocation'] = self.parse_geolocation(response)
        data['victims'] = self.parse_victims(response)
        data['district'] = self.parse_district(response)
        return data

    @classmethod
    def parse_geolocation(self, response):
        location = response.find('h2', text='Location')
        if location is None:
            return None
        div_loc = location.parent
        return helpers.parse_element(div_loc, 'span', 'Geolocation: ')

    @classmethod
    def test_parse_geolocation(self, markup=None):
        response = BeautifulSoup(self.test_html if markup is None else markup, 'lxml')
        geo_loc = self.parse_geolocation(response)
        assert geo_loc == '34.6493, -85.7659'
    
    @classmethod
    def parse_victims(self, response):
        data = []
        participants = response.find('h2', text='Participants')
        if participants is None:
            return None

        div_part = participants.parent
        for victim in div_part.find_all('ul', recursive=True):
            vic = {}
            
            if victim.find('li', text=re.compile(r'Type: Victim'),
                            recursive=True) is None:
                continue

            vic['name'] = helpers.parse_element(victim, 'li', 'Name: ')
            vic['age'] = helpers.parse_element(victim, 'li', 'Age: ')
            vic['gender'] = helpers.parse_element(victim, 'li', 'Gender: ')
            vic['status'] = helpers.parse_element(victim, 'li', 'Status: ')
            data.append(vic)

        return data

    @classmethod
    def test_parse_victims(self, markup=None):
        response = BeautifulSoup(self.test_html if markup is None else markup, 'lxml')
        victims = self.parse_victims(response)
        assert victims == [{'status': 'Killed', 'gender': 'Male','age':'47','name': 'Kenneth Shaw'}, 
                        {'status': u'Killed', 'gender': u'female', 'age': u'48', 'name': u'Kenneth Shaw II'}]

    @classmethod
    def parse_district(self, response):
        district = response.find('h2', text='District')
        if district is None:
            return None

        div_dist = district.parent
        return div_dist.text.replace('<br>', '').replace('<h2>District</h2>',
        '').replace('\n', '') if div_dist is not None else None

    @classmethod
    def test_parse_district(self, markup=None):
        response = BeautifulSoup(self.test_html if markup is None else markup, 'lxml')
        district = self.parse_district(response)
        assert district == 'District      Congressional District: 5      State Senate District: 8      State House District: 23'

    test_html = """<div id="block-system-main" class="block block-system">
    <h1>11-14-2015 Alabama Henagar 1-1</h1>
    <div>
    <h2>Location</h2>
    <h3>November 14, 2015</h3>

     <span>Weaver Road</span><br>
      <span>Henagar, Alabama</span><br>
      <span>Geolocation: 34.6493, -85.7659</span> </div>
      <div>
      <h2>Participants</h2>
      <div>
      <ul>
      <li>Type: Victim</li>
      <li>Name: Kenneth Shaw</li> <li>Age: 47</li> <li>Age Group: Adult
      18+</li> <li>Gender: Male</li> <li>Status: Killed</li>
      </ul>
      <ul>
      <li>Type: Victim</li>
      <li>Name: Kenneth Shaw II</li> <li>Age: 48</li> <li>Age Group: Adult
      18+</li> <li>Gender: female</li> <li>Status: Killed</li>
      </ul>
      <ul>
      <li>Type: Subject-Suspect</li>
      <li>Age Group: Adult 18+</li> <li>Status: Unharmed, Arrested</li>
      </ul>
      </div>
      </div>
      <div>
      <h2>Incident Characteristics</h2>
      <ul>
      <li>Shot - Dead (murder, accidental, suicide)</li>
      </ul>
      </div>
      <div>
      <h2>Sources</h2>
      <ul class="no-bullet">
      <li>URL: <a
      href="http://www.waff.com/story/30522340/police-investigating-shooting-death-of-henagar-man"
      target="_new">http://www.waff.com/story/30522340/police-investigating-shooting-death-of-henagar-man</a></li>
      </ul>
      </div>
      <div>
      <h2>District</h2>
      Congressional District: 5<br>
      State Senate District: 8<br>
      State House District: 23<br>
      </div>
      </div>"""
