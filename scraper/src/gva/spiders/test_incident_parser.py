from bs4 import BeautifulSoup
from incident_parser import IncidentParser as iparser

iparser.test_parse_geolocation()

iparser.test_parse_victims()

iparser.test_parse_district()

#print(iparser.parse_incident(BeautifulSoup(iparser.test_html, 'lxml')))
