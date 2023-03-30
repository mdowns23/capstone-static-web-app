import logging
import json
import azure.functions as func
import os
from dotenv import load_dotenv

load_dotenv()

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    googleKey = 'notkey'
    if req.method == "GET":
        googleKey = os.environ.get('REACT_APP_GOOGLE_MAPS_API_KEY')
        return func.HttpResponse(json.dumps({"key": googleKey}))

    