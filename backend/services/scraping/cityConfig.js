const CITY_URL_CONFIG = {
    'Delhi NCR': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=New-Delhi',
        '99acres': '/search/property/buy/delhi-ncr?city=74',
        housing_com: '/in/buy/searches/P1/delhi-ncr',
        nobroker: '/property/sale/delhi-ncr',
        govt_registry: 'https://doris.delhigovt.nic.in'
    },
    'Mumbai': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Mumbai',
        '99acres': '/search/property/buy/mumbai?city=1',
        housing_com: '/in/buy/searches/P1/mumbai',
        nobroker: '/property/sale/mumbai',
        govt_registry: 'https://igrmaharashtra.gov.in'
    },
    'Bangalore': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Bangalore',
        '99acres': '/search/property/buy/bangalore?city=25',
        housing_com: '/in/buy/searches/P1/bangalore',
        nobroker: '/property/sale/bangalore',
        govt_registry: 'https://karigr.karnataka.gov.in'
    },
    'Pune': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Pune',
        '99acres': '/search/property/buy/pune?city=24',
        housing_com: '/in/buy/searches/P1/pune',
        nobroker: '/property/sale/pune',
        govt_registry: 'https://igrmaharashtra.gov.in'
    },
    'Hyderabad': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Hyderabad',
        '99acres': '/search/property/buy/hyderabad?city=30',
        housing_com: '/in/buy/searches/P1/hyderabad',
        nobroker: '/property/sale/hyderabad',
        govt_registry: 'https://registration.telangana.gov.in'
    },
    'Chennai': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Chennai',
        '99acres': '/search/property/buy/chennai?city=8',
        housing_com: '/in/buy/searches/P1/chennai',
        nobroker: '/property/sale/chennai',
        govt_registry: 'https://tnreginet.gov.in'
    },
    'Gurgaon': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Gurgaon',
        '99acres': '/search/property/buy/gurgaon?city=75',
        housing_com: '/in/buy/searches/P1/gurgaon',
        nobroker: '/property/sale/gurgaon',
        govt_registry: 'https://jamabandi.nic.in'
    },
    'Noida': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Noida',
        '99acres': '/search/property/buy/noida?city=76',
        housing_com: '/in/buy/searches/P1/noida',
        nobroker: '/property/sale/noida',
        govt_registry: 'https://igrsup.gov.in'
    },
    'Ahmedabad': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Ahmedabad',
        '99acres': '/search/property/buy/ahmedabad?city=12',
        housing_com: '/in/buy/searches/P1/ahmedabad',
        nobroker: '/property/sale/ahmedabad',
        govt_registry: 'https://garvi.gujarat.gov.in'
    },
    'Kolkata': {
        magicbricks: '/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=Kolkata',
        '99acres': '/search/property/buy/kolkata?city=7',
        housing_com: '/in/buy/searches/P1/kolkata',
        nobroker: '/property/sale/kolkata',
        govt_registry: 'https://wbregistration.gov.in'
    }
};

const TARGET_CITIES = Object.keys(CITY_URL_CONFIG);

module.exports = { CITY_URL_CONFIG, TARGET_CITIES };
