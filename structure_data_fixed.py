from urllib.request import urlopen
from bs4 import BeautifulSoup
import time
import json
import ssl

url = 'https://www.citylab.com/life/2020/04/neighborhood-maps-coronavirus-lockdown-stay-at-home-art/610018/?utm_campaign=socialflow-organic&utm_source=twitter&utm_medium=social&utm_content=citylab'

def save_to_file_json(data, file_name='data.json', subdirectory='results'):
    f = open(subdirectory + '/' + file_name, 'w')
    f.write(json.dumps(data))
    f.close()
    print('JSON file written to ' + subdirectory + '/' + file_name + '. Go take a look!')

def download_image(image_url, file_name):
    # get the image
    response = urlopen(image_url, context=context)
    file_data = response.read()

    # write it to a file
    f = open('results/' + file_name, 'wb')  #note the 'wb' flag (b is for binary)
    f.write(file_data)
    f.close()
    return 'results/' + file_name

context = ssl._create_unverified_context()
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
        start = True
        entry = {}
        entry['paragraphs'] = []
        article_list.append(entry)
        counter = 1
        continue
    elif not start:
        continue
    
    if element.name == 'p':
        entry['paragraphs'].append(element.text)
    elif element.name == 'h4':
        entry['header'] = element.text
    elif element.name == 'figure':
        image_url = element.find('img').get('data-src')
        file_name = image_url.split('/')[-1]
        entry['image_source'] = image_url
        try:
            print('Downloading', image_url, '...')
            local_path = download_image(image_url,  file_name)
            entry['image_local'] = local_path
            # be polite:
            time.sleep(0.5)
        except Exception:
            print('Error downloading file name')

save_to_file_json(article_list)