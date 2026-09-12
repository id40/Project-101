import urllib.request
import json
import os

query = """
[out:json][timeout:35];
(
  way["building"](31.242,75.695,31.265,75.712);
  relation["building"](31.242,75.695,31.265,75.712);
  way["highway"](31.242,75.695,31.265,75.712);
  way["leisure"](31.242,75.695,31.265,75.712);
  way["landuse"](31.242,75.695,31.265,75.712);
  way["amenity"](31.242,75.695,31.265,75.712);
  node["amenity"](31.242,75.695,31.265,75.712);
);
out body;
>;
out skel qt;
"""

import urllib.parse

data_payload = urllib.parse.urlencode({'data': query}).encode('utf-8')
url = 'https://overpass-api.de/api/interpreter'
req = urllib.request.Request(url, data=data_payload, headers={'User-Agent': 'Antigravity3DApp/1.0'})

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Total elements:", len(data.get("elements", [])))
        with open("lpu_osm_raw.json", "w", encoding="utf-8") as f:
            json.dump(data, f)
        print("Saved lpu_osm_raw.json")
except Exception as e:
    print("Error:", e)
