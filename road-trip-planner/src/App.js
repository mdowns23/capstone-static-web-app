//import logo from './logo.svg';
import './App.css';
import Navigation from "./Navigation";
import './style.css'
import React, { useState, useEffect, useRef } from 'react';
import {Box, Button} from '@chakra-ui/react'
import {useJsApiLoader, GoogleMap, MarkerF, Autocomplete, DirectionsRenderer} from '@react-google-maps/api'
/*global google*/ 

// center of space needle 
const center = {lat: 47.6205,lng: -122.3493}

function App() {
 /*
  const [data, setData] = useState('');

  useEffect(() => {
    (async function () {
      const { text } = await( await fetch(`/api/message`)).json();
      setData(text);
    })();
  });

  return <div>{data}</div>;
*/

// starting and destiton location.

  // variable startingLocation
  const [startingLocation, setStartingLocation] = useState()
  //variable: destation
  const [destination, setDestination] = useState()

  //const [Distance, setDistance] = useState()
  //const [Duration, setDuration] = useState()

//setting the starting location to update
  const handleSatringLocationChange = (event) => {
    const value = event.target.value;
    setStartingLocation(value);
    console.log(`Starting Location: ${value}`);
    //setStartingLocation(e.target.value);
    //console.log("User location" + e.target.value);
  };

  //setting the diestentaion to update
  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    console.log("User Destination" + e.target.value);
  };

    const handleMapSubmit = (e) => {
    e.preventDefault();
    // console.log('Map Starting Location: ', startingLocation);
    // console.log('Map submitted with destination:', destation);
    // You can use the destination value here, for example, to calculate the distance between the starting point and the destination.
  };

    //google maps api key
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries:['places'], 
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionResponse, setDirectionResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()

  if(!isLoaded){
    return(<></>)
  }

  async function calculateRoute(){
    if(originRef.current.value === '' || destinationRef.current.value === ''){
      return
    }
    
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING
    })
    console.log(originRef.current.value)
    console.log(destinationRef.current.value)
    setDirectionResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  function clearRoute() {
    setDirectionResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

   return (   
    <main class = 'water'> 
    <div>
        <Navigation />
      </div>
    <form onSubmit={handleMapSubmit}>
      <table class= 'Value'>
      <h1>Enter starting and Ending</h1>
        <tbody class ='nameValue'>
          <tr class ='t1'>
            <td>Starting Location:</td>
            <td class = 't2'>
              <Autocomplete>
                <input type="text" value={startingLocation} ref={originRef} onChange={handleSatringLocationChange} />
              </Autocomplete>
            </td>
          </tr>
          <tr>
            <td>Destination:</td>
            <td>
              <Autocomplete>
                <input type="text" value={destination} ref={destinationRef} onChange={handleDestinationChange} />
              </Autocomplete>
            </td>
          </tr>
          <tr>
          <td>
            <input type="text" />
            </td>
          </tr>
        </tbody>
        <div class = 'button'>
      <button type="submit" onClick={calculateRoute}>calculate</button>
      <Box position='absolute' left={10} top={400} h='75%' w='95%'>
        {/*Google Map Box*/}
        <GoogleMap center={center} 
                   zoom={15} 
                   mapContainerStyle={{width:'100%', height:'100%'}}
                   onLoad={map => setMap(map)}>
          {/*Display markers*/}
          {directionResponse && (<DirectionsRenderer directions={directionResponse} />)}
        </GoogleMap>
      </Box>
      </div>
      </table>
      
    </form>
    </main>
  //   return null

  )

}

export default App;