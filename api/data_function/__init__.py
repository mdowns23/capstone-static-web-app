import logging
import json
import requests
import azure.functions as func



def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    text = "not changed"
    if req.method == "POST":
        body = str(req.get_json())
        body1 = req.get_json()
        lat = float(body1.get('lat'))
        lat-=0.0005
        #lat-=0.0347097444
        long = float(body1.get('lng'))
        long-=0.0005
        #long-=0.0702095032
        lat1 = float(lat)
        lat1+=0.0005
        #lat1+=0.0347097444
        long1 = float(long)
        long1+=0.0005
        #long1+=0.0702095032
        #textJ = json.loads(text)
        #print("TEXT: " + body)
        gType = str(body1.get('type'))
        #print("TYPE: " + gType)
        if (gType[0] == 'R'):
            gasT = 1
        elif (gType[0] == 'M'):
            gasT = 2
        elif (gType[0] == 'P'):
            gasT = 3
        else:
            gasT = 4
        
        
        url = 'https://www.gasbuddy.com/gaspricemap/map'
        #url = 'https://www.gasbuddy.com/GBPriceWebService/GBPriceService.asmx/GetPrices'
        #print("URL: " + url)
        headers = {
            'Content-Type': 'application/json'
        }
        data1 = {
            'fuelTypeId': str(gasT),
            'height': 600,
            'maxLat': lat1,
            'maxLng': long1,
            'minLat': lat,
            'minLng': long,
            'width': 818
        }
        #response = requests.post(url, data=data1)
        response = requests.post(url, data=data1)
        res = json.loads(response.content)
        stations = res.get("primaryStations")
        id = stations[0].get("id")
        price = stations[0].get("price")
        lat3 = float(body1.get('lat'))
        long3 = float(body1.get('lng'))
        url2 = 'https://www.gasbuddy.com/gaspricemap/county?lat={lati1}&lng={longi1}&usa=true'.format(lati1=lat3, longi1=long3)
        data = {
            "fuelTypeId": "1",
            "id": id
        }
        response2 = requests.post(url2)
        res2 = json.loads(response2.content)
        print(response2.content)
        if(price == '--'):
            price = str(res2[0].get("Price"))
            price+= " (AVG in County)"
        #print("RES2: " + response2.text)
        return func.HttpResponse(json.dumps(price))
    else:
        return func.HttpResponse(json.dumps(text))

    