import datetime as dt
import scrapy
import urlparse
import uuid
import logging
from urllib import urlencode
from bs4 import BeautifulSoup
from incident_parser import IncidentParser

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

class GVASpider(scrapy.Spider):
    name = "gva"

    #def __init__(self):
            #self.driver = webdriver.Firefox()

    def start_requests(self):
        urls = [
            'http://www.gunviolencearchive.org/query'
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        #try:
        week = 1
        day = 273
        year = 2017
        stop_criteria = dt.datetime.now().strftime('%j')
        while day < stop_criteria:
                self.driver = webdriver.Firefox()
                from_date = self.get_date_from_day(year, day)
                to_date = self.get_date_from_day(year, day+6)

                logging.info('#### Calling gva to fetch results for year {} week {} from date {} to date {}.'.format(year, week, from_date, to_date))

                week += 1
                day += 7

                self.driver.get('http://www.gunviolencearchive.org/query')

                wait = WebDriverWait(self.driver, 10)
         
                dd_and = Select(wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
                        '.group-dropdown'))))

                self.driver.execute_script("jQuery('input[name*=query_id]').val('{}')".format(str(uuid.uuid4())))
                #q_id = self.driver.find_element_by_name('query[query_id]')
                #q_id.send_keys(str(uuid.uuid4()))

                dd_and.select_by_value('Or')
                dd_and.select_by_value('And')


                # Fill incident characteristics
                add_rule = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, 'filter-dropdown-trigger')))
                add_rule.click()

                #Click item in dropdown
                incident_char = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
                    ".filter-dropdown a[data-value='IncidentType']")))
                incident_char.click()
                
                dd_incident = Select(wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
                        '.filters-container .filter-row .small-6 select'))))
                dd_incident.select_by_value('2')

                # Fill dates
                add_rule = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, 'filter-dropdown-trigger')))
                add_rule.click()

                #Click item in dropdown
                incident_dt = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
                    ".filter-dropdown a[data-value='IncidentDate']")))
                incident_dt.click()
                
                wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '.filters-container .filter-row:nth-of-type(2) .small-6 input')))

                self.driver.execute_script("jQuery('.filters-container .filter-row:nth-of-type(2) .small-6 input:first()').val('{}')".format(from_date))
                self.driver.execute_script("jQuery('.filters-container .filter-row:nth-of-type(2) .small-6 div:nth-child(2) input').val('{}')".format(to_date))


                ############# SUBMIT ###############
                sub = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
                        '#edit-actions-execute')))
                sub.click()
                #self.driver.find_element_by_class_name('form-submit').click()

                res =wait.until(EC.presence_of_element_located((By.ID, 'gva-entry-results-limiter')))
                
                #incidents_spider = IncidentsSpider()
                res_url = self.driver.current_url
                logging.info('####Query result for year {} week {} from date {} to date {} are at url {}.'
                                .format(year, week,
                                        from_date, to_date, res_url))
                yield response.follow(res_url, callback=self.parse_results,
                                meta=dict(week=week,from_dt=from_date,
                                        to_dt=to_date))


                self.driver.close()


    def parse_results(self, response):
        soup = BeautifulSoup(response.text, 'lxml')

        week = response.meta['week']
        from_dt = response.meta['from_dt']
        to_dt = response.meta['to_dt']

        # Paginate
        if 'page=' not in response.url:
            pager = soup.select("ul.pager")[0]
            last_page = pager.select('li.pager-last.last a')
            last_page_idx = 18 if len(last_page) < 1 else self.getLastPage(last_page[0]['href'])
            logging.info('#### {} results pages for query {} week {} from {} to {}.'.format(last_page_idx, response.url.split('/')[-1],
                            week, from_dt, to_dt))
            url_parts = list(urlparse.urlparse(response.url))
            for pageIdx in range(1, last_page_idx):
                page_param = { 'page': pageIdx }
                query = dict(urlparse.parse_qsl(url_parts[4]))
                query.update(page_param)
                url_parts[4] = urlencode(query)
                page_url = urlparse.urlunparse(url_parts)
                yield response.follow(page_url, callback=self.parse_results,
                        meta=dict(week=week,from_dt=from_dt,
                                to_dt=to_dt))

        # Parse table	
        table = soup.select("#block-system-main")[0]
        for row in table.find_all("tr"):
            cols = row.find_all("td")
            if (len(cols) < 1):
                continue
            data = {}
            data["incident_date"] = cols[0].string

            # Check for GVA shenanigans where the results
            # are corrupt as it includes results from
            # beyond the time window.
            if not self.validate_date(data['incident_date'], from_dt, to_dt):
                continue

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

    def get_date_from_day(self, year, day):
        if day > 364:
            return '12/31/{}'.format(year)

        pdate = dt.datetime.strptime('{} {}'.format(year, day), '%Y %j')
        return pdate.strftime('%m/%d/%Y')

    def validate_date(self, date, from_dt, to_dt):
        pdate = dt.datetime.strptime(date, '%B %d, %Y')
        from_date = dt.datetime.strptime(from_dt, '%m/%d/%Y')
        to_date = dt.datetime.strptime(to_dt, '%m/%d/%Y')
        return False if pdate is None else from_date <= pdate <= to_date
