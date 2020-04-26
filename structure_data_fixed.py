from urllib.request import urlopen
from urllib.parse import quote
from bs4 import BeautifulSoup
import time
import json
import ssl
context = ssl._create_unverified_context()

url = 'https://www.citylab.com/life/2020/04/neighborhood-maps-coronavirus-lockdown-stay-at-home-art/610018/?utm_campaign=socialflow-organic&utm_source=twitter&utm_medium=social&utm_content=citylab'

def save_to_file_json(data, file_name='data.json', subdirectory='results'):
    f = open(subdirectory + '/' + file_name, 'w')
    f.write(json.dumps(data))
    f.close()
    print('JSON file written to ' + subdirectory + '/' + file_name + '. Go take a look!')

def get_location(place):
    # url = 'https://api.opencagedata.com/geocode/v1/json?key='  + api_key + \
    #     '&q=' + quote(place) + '&limit=2'
    url = 'https://nominatim.openstreetmap.org/search?q=' + quote(place) + '&format=jsonv2&addressdetails=1&namedetails=1'
    print(url)
    # return
    try:
        data = json.loads(urlopen(url, context=context).read())
        r1 = data[0]['address']
        place = {
            'county': r1.get('county'),
            'country': r1.get('country'),
            'state': r1.get('state'),
            'city': r1.get('city'),
            'geometry': {'lat': data[0].get('lat'), 'lng': data[0].get('lon')}
        }
        return place
        
    except Exception as e:
        print(e)
        return None
    # print(data['results'][0]['components']['continent'])
    # print(data['results'][0]['components']['country'])
    # print(data['results'][0]['components']['state'])
    # print(data['results'][0]['geometry'])
    # return data

def download_image(image_url, file_name):
    # get the image
    response = urlopen(image_url, context=context)
    file_data = response.read()

    # write it to a file
    f = open('results/' + file_name, 'wb')  #note the 'wb' flag (b is for binary)
    f.write(file_data)
    f.close()
    return 'results/' + file_name

response = urlopen(url, context=context)
html = response.read().decode('utf-8', 'ignore')
soup = BeautifulSoup(html, features='html.parser')

article = soup.find('article')
article_list = []
counter = 1
start = False
entry = {}
for element in article.find_all(['p', 'h4', 'hr', 'figure']):
    if element.name == 'hr':
        if start:
            footer = entry['paragraphs'].pop()
            entry['footer'] = footer
            entry['place'] = ','.join(footer.split(',')[1:])
            entry['location'] = get_location(entry['place'])
        start = True
        entry = {}
        entry['paragraphs'] = []
        entry['id'] = counter
        counter += 1
        article_list.append(entry)
        continue
    elif not start:
        continue

    if element.name == 'p':
        if len(element.text) > 2:
            entry['paragraphs'].append(element.text)
    elif element.name == 'h4':
        if element.text == 'About the Author':
            break
        entry['header'] = element.text
    elif element.name == 'figure':
        image_url = element.find('img').get('data-src')
        file_name = image_url.split('/')[-1]
        entry['image_source'] = image_url
        # try:
        #     print('Downloading', image_url, '...')
        #     local_path = download_image(image_url,  file_name)
        #     entry['image_local'] = local_path
        #     # be polite:
        #     time.sleep(0.5)
        # except Exception:
        #     print('Error downloading file name')
footer = entry['paragraphs'].pop()
entry['footer'] = footer
entry['place'] = ','.join(footer.split(',')[1:])
entry['location'] = get_location(entry['place'])

save_to_file_json(article_list)