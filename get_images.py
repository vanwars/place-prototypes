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
file_data = response.read().decode('utf-8', 'ignore')
soup = BeautifulSoup(file_data)
article_list = []
counter = 1
entry = {}

def apply_advertising_hack(section, entry, counter):
    # hack to account for advertising injections
    hr = section.find('hr')
    if hr is None:
        return
    sib = hr.previous_sibling
    if sib is None:
        return
    sib = sib.previous_sibling
    if sib is not None and sib.name == 'p':
        entry['text_' + str(counter)] = sib.text


for section in soup.findAll('section'):
    apply_advertising_hack(section, entry, counter)

    for hr in section.findAll('hr'):
        counter = 1
        entry = {}
        article_list.append(entry)
        
        sib = hr.next_sibling
        if sib is None:
            continue
        
        # each entry is bounded by the hr tag. So process all siblings
        # until the next hr tag is encountered
        while sib.name != 'hr':
            if sib.name is not None:
                if sib.name in ['p', 'h1', 'h2', 'h3', 'h4']:
                    entry['text_' + str(counter)] = sib.text
                    counter += 1
                elif sib.name == 'figure':
                    image_url = sib.find('img').get('data-src')
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
            sib = sib.next_sibling
            if sib is None:
                break
save_to_file_json(article_list)


# for image_url in image_urls:
#     # get the image
#     response = urlopen(image_url, context=context)
#     file_data = response.read()
#     file_name = image_url.split('/')[-1]

#     # write it to a file
#     f = open('results/' + file_name, 'wb')  #note the 'wb' flag (b is for binary)
#     f.write(file_data)
#     f.close()
#     print('Image written to results/' + file_name + '. Go take a look!')
    
#     # be polite
#     time.sleep(1)