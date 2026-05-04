import json
import re

filepath = r'c:\Users\HP\Documents\projet touristique\dataset\itineraires.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data_str = f.read()

# Replace LT0XX with lieu_0XX
data_str = re.sub(r'"LT(\d{3})"', r'"lieu_\1"', data_str)

# Replace RT0XX with resto_0XX
data_str = re.sub(r'"RT(\d{3})"', r'"resto_\1"', data_str)

# Replace AC0XX with act_0XX
data_str = re.sub(r'"AC(\d{3})"', r'"act_\1"', data_str)

# Replace HT0XX with hotel_0XX
data_str = re.sub(r'"HT(\d{3})"', r'"hotel_\1"', data_str)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(data_str)

print('itineraires.json IDs updated successfully.')
