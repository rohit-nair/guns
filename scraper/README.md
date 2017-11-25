## SCRAPER

This implementation is based on the tutorial for Scrapy. It uses Selenium web
driver to interact with the page.

### Execution

Sample script to crawl results for 2016 Q1.
Make sure that the `quarter` and `year` variables in `query_spider.py` are
updated accordingly.

```bash

cd scraper/src/gva/spiders

 scrapy crawl gva -o results/2016/q1.json --loglevel INFO --logfile results/2016/q1.log

```

### Results

Results can be found under results folder, collated by year.
Each file contains an array of incident details. A sample incident detail can
be seen below.

```json
{
  "incident_date": "January 21, 2016",
  "city": "Cleveland",
  "victims": [
    {
      "status": "Killed",
      "gender": "Male",
      "age": "35",
      "name": "Rasheed Bandy"
    },
    {
      "status": "Killed",
      "gender": "Male",
      "age": "27",
      "name": "Brandon Lamar James"
    }
  ],
  "district": "DistrictCongressional District: 1State Senate District: 33State
House District: 103",
  "geolocation": "30.6706, -88.086",
  "state": "Ohio",
  "incident_id": "/incident/655052",
  "injured": "0",
  "address": "1200 block of West 9th Street",
  "killed": "2"
}
```
