import logging
import json

import azure.functions as func


def main(req: func.HttpRequest):
    
    if req.method == "GET":
        return func.HttpResponse(json.dumps({"text": "Hello"}))
