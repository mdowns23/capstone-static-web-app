//import logo from './logo.svg';
import './App.css';
import Navigation from "./Navigation";
import './style.css'
import React, { useState, useEffect, useRef } from 'react';
//import '@google-polyline'
import {Box, Button} from '@chakra-ui/react'
import {useJsApiLoader, GoogleMap, MarkerF, Autocomplete, DirectionsRenderer, Polygon} from '@react-google-maps/api'
/*global google*/ 

// center of space needle 
const center = {lat: 47.6205,lng: -122.3493}

function App() {
/*
  const [googleMapsKey, setGoogleMapsKey] = useState('');

  useEffect(() => {
    (async function () {
      const { key } = await( await fetch(`/api/data_function`)).json();
      //console.log(key)
      setGoogleMapsKey(key);
    })();
  });
*/

  //return <div>{data}</div>;

//console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)

// starting and destiton location.
  
  // variable startingLocation
  const [startingLocation, setStartingLocation] = useState()
  //variable: destation
  const [destination, setDestination] = useState()

  const [isShown, setIsShown] = useState(false);
  //const [Distance, setDistance] = useState()
  //const [Duration, setDuration] = useState()

//setting the starting location to update
  const handleSatringLocationChange = (event) => {
    const value = event.target.value;
    setStartingLocation(value);
    //console.log(`Starting Location: ${value}`);
    //setStartingLocation(e.target.value);
    //console.log("User location" + e.target.value);
  };

  //setting the diestentaion to update
  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    //console.log("User Destination" + e.target.value);
  };

    const handleMapSubmit = (e) => {
    e.preventDefault();
    setStartingLocation('')
    setDestination('')
    
    setIsShown(true);
    // console.log('Map Starting Location: ', startingLocation);
    // console.log('Map submitted with destination:', destation);
    // You can use the destination value here, for example, to calculate the distance between the starting point and the destination.
  };

    //google maps api key
  const {isLoaded}=useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries:['places'], 
  })

  
  

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionResponse, setDirectionResponse] = useState(null)
  const [gasPolygon, setGasPolygon] = useState(null)
  const [dirRend, setDirRend] = useState(null)
  const [gasMarkerArray, setGasMarkerArray] = useState([])
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()

  

  if(!isLoaded){
    return(<></>)
  }

  let waypoints = []

  async function calculateRoute(){
    if(originRef.current.value === '' || destinationRef.current.value === ''){
      return
    }
    if(waypoints.length > 0){
      waypoints.length = 0
    }
    
    const directionsService = new google.maps.DirectionsService()
    const directionsRenderer = new google.maps.DirectionsRenderer()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING
    })
    
    //console.log(originRef.current.value)
    //console.log(destinationRef.current.value)
    setDirRend(directionsRenderer)
    setDirectionResponse(results)
    directionsRenderer.setDirections(results);
    directionsRenderer.setMap(map)
 
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    var polyline = require('google-polyline')
    waypoints = polyline.decode(results.routes[0].overview_polyline)
    console.log(waypoints)
    const polygonCoords = polygonPoints()
    const polygonBound = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2, 
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    setGasPolygon(polygonBound)
    polygonBound.setMap(map)
    getStations(polygonBound)
  }

  function clearRoute() {
    setDirectionResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
    if(gasPolygon != null){
      gasPolygon.setMap(null)
    }
    if(dirRend != null){
      dirRend.setMap(null)
    }
    waypoints.length = 0
    //dirService.setMap(null)
    for(let i = 0; i < gasMarkerArray.length; i++){
      gasMarkerArray[i].setMap(null)
    }
    setGasMarkerArray([])
  }

  function polygonArray(latitude){
    const R = 6378137
    const pi = 3.14

    const upper_offset = 1000
    const lower_offset = -1000

    var Lat_up = upper_offset / R
    var Lat_down = lower_offset / R

    var lat_upper = latitude + (Lat_up * 180) / pi
    var lat_lower = latitude + (Lat_down * 180) / pi
    return [lat_upper, lat_lower]
  }

  function polygonPoints(){
    let polypoints = waypoints
    let PolyLength = polypoints.length

    let UpperBound = []
    let LowerBound = []

    for (let j = 0; j <= PolyLength - 1; j++) {
      let NewPoints = polygonArray(polypoints[j][0]);
      UpperBound.push({ lat: NewPoints[0], lng: polypoints[j][1] })
      LowerBound.push({ lat: NewPoints[1], lng: polypoints[j][1] })
      }
    let reversebound = LowerBound.reverse()
    let FullPoly = UpperBound.concat(reversebound)
    return FullPoly
  }

  function getStations(pBounds){
    let gasMarkers = []
    const service = new google.maps.places.PlacesService(map)
    for (let i = 0; i < waypoints.length; i+=40){
      service.nearbySearch({
        location:{ lat: waypoints[i][0], lng:waypoints[i][1]},
        radius: '20000',
        type: ['gas_station']
      }, callback);

      function callback(results, status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
          for (var j = 0; j < results.length; j++){
            if(google.maps.geometry.poly.containsLocation(results[j].geometry.location,pBounds) === true){
              gasMarkers.push(new google.maps.Marker({
                position: results[j].geometry.location, map, 
                title: 'Hello World!'
              }))
            }
          }
        }
      }
    }
    setGasMarkerArray(gasMarkers)
  }

   return (   
    <main className='water'> 
        <div>
          <Navigation />
        </div>
        <form onSubmit={handleMapSubmit}>
          <table className='Value'>
            <h1>Enter starting and Ending</h1>
            <tbody className='nameValue'>
              <tr className='t1'>
                <td className='t2'>
                  <Autocomplete>
                    <input type="text" value={startingLocation} placeholder='Starting Location' ref={originRef} onChange={handleSatringLocationChange} />
                  </Autocomplete>
                </td>
              </tr>
              <tr>
                <td>
                  <Autocomplete>
                    <input type="text" value={destination} ref={destinationRef} placeholder='Destination' onChange={handleDestinationChange} />
                  </Autocomplete>
                </td>
              </tr>
            </tbody>
          </table>
          <div className='button'>
            <button type="submit" onClick={calculateRoute}>calculate</button>
            <button type="submit" onClick={clearRoute}>Clear</button>
              <Box position='absolute' left={10} top={400} h='75%' w='95%'>
              {/*Google Map Box*/}
              <GoogleMap center={center} 
                         zoom={15} 
                         mapContainerStyle={{width:'100%', height:'100%'}}
                         onLoad={map => setMap(map)}>
                {/*Display markers*/}
              </GoogleMap>
              {directionResponse && (
                 <div style={{ textAlign: "center" }}>
                 <table class = 'distance'>
                   <thead>
                     <tr class = 'inner'>
                       <th>Distance: {distance}</th>
                       <th>Duration : {duration}</th>
                     </tr>
                   </thead>
                   <tbody>
                   </tbody>
                 </table>
               </div>
                )}
            </Box>
          </div>
        </form>
      </main>
  //   return null

  )

}

export default App;