from urllib.request import urlopen
from urllib.parse import quote
from bs4 import BeautifulSoup
import time
import json
import ssl
import random

do_downloads = False

tags = {
    'detail': 'details', 
    'nature': 'nature',
    'bird': 'bird', 
    'cat': 'pets',
    'dog': 'pets',
    'animal': 'animals',
    'flower': 'flowers',
    'beer': '', 
    'park': '', 
    'confine': 'confined', 
    'home': '', 
    'neighbor': '', 
    'stranger': '', 
    'street': '', 
    'path': '', 
    'walk': '', 
    'bike': '', 
    'fear': '', 
    'garden': 'gardening', 
    'food': '', 
    'school': '', 
    'kid': 'kids', 
    'sound': '',  
    'squawking': 'sound',
    'lilac': 'flowers',
    'computer': '', 
    'friend': 'friends', 
    'essential': 'essentials', 
    'connect': 'connection', 
    'online': '', 
    'work': '', 
    ' tree': 'trees', 
    'safe': 'safety',  
    'butterflies': 'animals', 
    'lorikeets': 'birds', 
    'transit': '', 
    'window': 'windows', 
    'child': 'kids', 
    'explore': '', 
    'time': '', 
    'lockdown': '', 
    'outside': '', 
    'relationship': 'relationships', 
    'appreciate': '', 
    'love': '', 
    'isolation': '', 
    'apart': '',
    'market': 'shopping',
    'shop': 'shopping',
    'imagine': 'imagination',
    'routine': ''
}
context = ssl._create_unverified_context()


url = 'https://www.citylab.com/life/2020/04/neighborhood-maps-coronavirus-lockdown-stay-at-home-art/610018/?utm_campaign=socialflow-organic&utm_source=twitter&utm_medium=social&utm_content=citylab'
url = 'https://www.bloomberg.com/news/articles/2020-04-15/colorful-maps-of-a-world-in-coronavirus-lockdown'




def save_to_file_json(data, file_name='data.json', subdirectory='results'):
    f = open(subdirectory + '/' + file_name, 'w')
    f.write(json.dumps(data))
    f.close()
    print('JSON file written to ' + subdirectory + '/' + file_name + '. Go take a look!')

def get_tags(entry):
    my_tags = []
    text = ' '.join(entry.get('paragraphs')) or '' + entry.get('header') or '' + entry.get('footer') or ''
    for key in tags:
        if text.find(key) != -1:
            val = tags[key]
            if val == '':
                val = key
            my_tags.append(val)
    return my_tags
    
def get_location(place):
    # url = 'https://api.opencagedata.com/geocode/v1/json?key='  + api_key + \
    #     '&q=' + quote(place) + '&limit=2'
    url = 'https://nominatim.openstreetmap.org/search?q=' + quote(place) + '&format=jsonv2&addressdetails=1&namedetails=1'
    # print(url)
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
        print('location parsing error:', e)
        print(place)
        return None

def download_images(entry):
    try:
        for key in ['image_source', 'image_source_large', 'image_source_orig']:
            path = entry[key]
            print('Downloading', path, '...')
            file_name = path.split('/')[-1]
            local_path = download_image(path, file_name)
            entry[key + '_local'] = local_path
            # be polite:
            time.sleep(1)
    except Exception:
        print('Error downloading file name')

def download_image(image_url, file_name):
    # get the image
    response = urlopen(image_url, context=context)
    file_data = response.read()

    # write it to a file
    f = open('results/' + file_name, 'wb')  #note the 'wb' flag (b is for binary)
    f.write(file_data)
    f.close()
    return 'results/' + file_name

# response = urlopen(url, context=context)
html = open('article.html').read() #.decode('utf-8', 'ignore')
soup = BeautifulSoup(html, features='html.parser')
# print(html)

article = soup.find_all('section', {'class': 'main-column-v2' })[0]
article_list = []
counter = 1
start = False
entry = {}
for element in article.find_all(['p', 'h2', 'hr', 'figure']):
    if element.name == 'hr':
        if start:
            footer = entry['paragraphs'].pop()
            tokens = footer.split(',')
            entry['footer'] = footer
            entry['author'] = tokens[0].replace('—', '')
            entry['place'] = ','.join(tokens[1:])
            entry['location'] = get_location(entry['place'])
            entry['tags'] = get_tags(entry)
        start = True
        entry = {
            'id': counter,
            'header': None,
            'paragraphs': [],
            'tags': []
        }
        article_list.append(entry)
        counter += 1
        continue
    elif not start:
        continue

    if element.name == 'p':
        if len(element.text) > 2:
            entry['paragraphs'].append(element.text)
    elif element.name == 'h2':
        if element.text == 'About the Author':
            break
        entry['header'] = element.text
        print(entry['header'])
    elif element.name == 'figure':
        img = element.find('img')
        if img:
            entry['image_source'] = img.get('data-native-src')
            entry['image_source_large'] = img.get('src')
            print(entry['image_source'], entry['image_source_large'])
            if do_downloads:
                download_images(entry)

footer = entry['paragraphs'].pop()
entry['footer'] = footer
tokens = footer.split(',')
entry['author'] = tokens[0].replace('—', '')
entry['place'] = ','.join(tokens[1:])
entry['location'] = get_location(entry['place'])
entry['tags'] = get_tags(entry)

save_to_file_json(article_list)