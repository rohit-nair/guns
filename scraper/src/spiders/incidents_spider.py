import scrapy
import urlparse
from urllib import urlencode
from bs4 import BeautifulSoup
from incident_parser import IncidentParser

class IncidentsSpider(scrapy.Spider):
    name = "incidents"

    def start_requests(self):
        urls = [
            'http://www.gunviolencearchive.org/last-72-hours'
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        # Paginate
        if 'page=' not in response.url:
            pager = soup.select("ul.pager")[0]
            last_page = pager.select('li.pager-last.last a')
            last_page_idx = 18 if len(last_page) < 1 else self.getLastPage(last_page[0]['href'])
            self.log(last_page_idx)
            url_parts = list(urlparse.urlparse(response.url))
            for pageIdx in range(1, last_page_idx):
                page_param = { 'page': pageIdx }
                query = dict(urlparse.parse_qsl(url_parts[4]))
                query.update(page_param)
                url_parts[4] = urlencode(query)
                page_url = urlparse.urlunparse(url_parts)
                self.log('##### {}'.format(page_url))
                yield response.follow(page_url) 		

        # Parse table	
        table = soup.select("#block-system-main")[0]
        for row in table.find_all("tr"):
            cols = row.find_all("td")
            if (len(cols) < 1):
                continue
            data = {}
            data["incident_date"] = cols[0].string	
            data["state"] = cols[1].string	
            data["city"] = cols[2].string	
            data["address"] = cols[3].string	
            data["killed"] = cols[4].string	
            data["injured"] = cols[5].string	
            
            data['geolocation'] = None
            data['victims'] = None
            data['district'] = None
           
            # Get incident data
            found_incident = False
            #for link in cols[6].select("li.first a[text=/'View Incident/'"):
            for link in cols[6].findAll('a', href=True, text='View Incident'):
                data["incident_id"] = link["href"]
                found_incident = True
            if not found_incident:
                data["incident_id"] = None
                yield data
            
            yield response.follow(data['incident_id'],
                    callback=self.parse_incident, meta=dict(item=data))

    def getLastPage(self, href):
        if href is None:
            return 18
        url = urlparse.urlparse(href)
        qs = urlparse.parse_qs(url.query)
        return int(qs['page'][0])+1 if 'page' in qs else 18 

    def parse_incident(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        table = soup.select("#block-system-main")[0]
        incident = IncidentParser.parse_incident(table)
        data = response.meta['item']
        data.update(incident)
        yield data
