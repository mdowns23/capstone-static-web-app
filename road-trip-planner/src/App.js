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

  const [gasType, setGasType] = useState()

  const [Mpg, setMpg] = useState()

  const [TankSize, setTankSize] = useState()

  const [CurrentSize, setCurrentSize] = useState()


  const [isShown, setIsShown] = useState(false);
  //const [Distance, setDistance] = useState()
  //const [Duration, setDuration] = useState()

  

  const [ValueArray, setValueArray] = useState(new Set())

  

  const [gasInformaiton, setGasInformation] = useState([])

//setting the starting location to update
  const handleSatringLocationChange = (event) => {
    const value = event.target.value;
    setStartingLocation(value);
    //console.log(`Starting Location: ${value}`);
    //setStartingLocation(e.target.value);
    //console.log("User location" + e.target.value);
  };

  const handleCurrentSize= (event) => {
    setCurrentSize(event.target.value);
  }

  const handleMPG= (event) => {
    setMpg(event.target.value);
  }


  const handleTanksize= (event) => {
    setTankSize(event.target.value);
  }

  const handleSelect= (event) => {
    setGasType(event.target.value);
  }
  //setting the diestentaion to update
  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    //console.log("User Destination" + e.target.value);
  };

    const handleMapSubmit = (e) => {
    e.preventDefault();
    setStartingLocation('')
    setDestination('')
    setCurrentSize('')
    setGasType('')
    setMpg('')
    setTankSize('')
    
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

  let GasInformation = []

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
    //console.log(waypoints[waypoints.length-1])
    //console.log(await distanceCalc(48,122,47,122.5))
    //console.log("mpg: " + Mpg + " ts: " + TankSize + " gt: " + gasType + " cs: " + CurrentSize )
    const polygonCoords = polygonPoints()
    const polygonBound = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0,
      strokeWeight: 2, 
      fillColor: '#FF0000',
      fillOpacity: 0
    });
    setGasPolygon(polygonBound)
    polygonBound.setMap(map)
    getStations(polygonBound)
    
  }

  function clearRoute() {
    setDirectionResponse(null)
    setDistance('')
    setDuration('')
    distCoords.length = 0
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
    setGas = new Set()
    setValueArray(new Set())
    GasInformation.length = 0

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

  var distCoords = []
  let setGas = new Set()
  let GasSet = []
  let gasIndex = {}

  function nearbySearchPromise(service, location, radius, type) {
    return new Promise((resolve, reject) => {
      service.nearbySearch({ location, radius, type }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(status));
        }
      });
    });
  }

  async function getStations(pBounds){
    
    let gasMarkers = []
    var currTankSize = 0
    if (CurrentSize === "TFive"){
      currTankSize = TankSize*.25
      console.log("currTSIZE: " + currTankSize)
    } 
    else if(CurrentSize === "Fifty"){
      currTankSize = TankSize *.5
      console.log("currTSIZE: " + currTankSize)
    }
    else if(CurrentSize === "SFive"){
      currTankSize = TankSize*.75
      console.log("currTSIZE: " + currTankSize)
    }
    else{ currTankSize = TankSize
      console.log("currTSIZE: " + currTankSize)}
    distCoords.push([waypoints[0][0], waypoints[0][1]])
    var distTrack = 0
    
    const service = new google.maps.places.PlacesService(map)
    const searchPromises = [];
    for (let i = 0; i < waypoints.length; i+=40){
      const location = { lat: waypoints[i][0], lng: waypoints[i][1] };
      const radius = '20000';
      const type = ['gas_station'];
      try {
        const results = await nearbySearchPromise(service, location, radius, type);
        console.log(i)
        await callback(results, google.maps.places.PlacesServiceStatus.OK);
      } catch (error) {
        console.error(error);
      }
    }
    
    
      //console.log("i before the second for loop: " + i)

      function callback(results, status) {
        return new Promise(async (resolve, reject) => {
          if(status === google.maps.places.PlacesServiceStatus.OK){
            for (var j = 0; j < results.length; j++){
              if(google.maps.geometry.poly.containsLocation(results[j].geometry.location,pBounds) === true){
                console.log("J internal for loop :" + j);
                try {
                  let dist = await distanceCalc(distCoords[distCoords.length-1][0], distCoords[distCoords.length-1][1], results[j].geometry.location.lat(), results[j].geometry.location.lng() );
                  console.log("j: " +j+ "DISTMILES: " + dist)
                  dist = dist / Mpg;
                  var tmpTankSize = currTankSize - dist
                  var gasLvl = tmpTankSize/TankSize;
                  
                  
                  //console.log("i: " + i + " j: " + j+ " Gas: " + gasLvl);
                  console.log("j:" + j + "GASLVL B4: " + gasLvl)
                  gasLvl = Math.round(gasLvl *10) / 10;
                  console.log("j:" + j +"GASLVL: " + gasLvl)
                  if (gasLvl <= .5){
                    currTankSize = currTankSize - dist;
                    distCoords.push([results[j].geometry.location.lat(), results[j].geometry.location.lng()]);
                    distTrack+=1;
                    currTankSize = TankSize;
                    gasMarkers.push(new google.maps.Marker({
                      position: results[j].geometry.location, map, 
                      title: results[j]['name']
                    }));
                    if(!setGas.has(results[j]['vicinity'])){
                      var price = getGasStationInfo(results[j].geometry.location.lat(), results[j].geometry.location.lng());
                    }
                    var info = {
                      name: results[j]['name'],
                      vicinity: results[j]['vicinity'],
                      price: await price
                    };
                    if(!setGas.has(results[j]['vicinity'])){
                      GasInformation.push(info);
                      setGas.add(results[j]['vicinity']);
                      console.log("INLOOP:" + GasInformation);
                      GasSet = Array.from(new Set(GasInformation));
                      setValueArray(GasSet);
                    }
                  }
                } catch (error) {
                  reject(error);
                }
              }
            }
            resolve();
          } else {
            reject(new Error("Failed to get places."));
          }
        });
      }
      
    //}
    setGasMarkerArray(gasMarkers)
    
  }
  //console.log("Variable data "+GasInformation);
  //console.log("UseState" + ValueArray);

   //    GasInformation.push({name : results[j]['name'], vicinity :results[j]['vicinity']})
              //     console.log("Zie of the value" +GasInformation)
              // //  // setValueArray([GasInformation])
              //     console.log("ARRAY: " + GasInformation[j]['name'] +" " + GasInformation[j]['vicinity'])
              // //    //console.log(ValueArray)

  async function getGasStationInfo(lat, long) {
    //for (var i = 1; i < distCoords.length ; i++){
      //console.log("COORDS: " + distCoords)
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: lat,
          lng: long,
          type: gasType })};

      const response = await fetch('api/data_function', requestOptions);
      const data = await response.json();
      //console.log("DATA:" + data)
      return data
    //}
  }

  async function distanceCalc(lat1, long1, lat2, long2){
    const pt1 = {lat: lat1, lng: long1}
    const pt2 = {lat: lat2, lng: long2}

    let distanceService = new google.maps.DirectionsService()
    const dist = await distanceService.route({
      origin: pt1,
      destination: pt2, 
      travelMode: google.maps.TravelMode.DRIVING})
    
    var miles = dist.routes[0].legs[0].distance.value

    miles = miles/1609.34
    //console.log("MILES: " + miles)
    return miles


  }


  //console.log("The vlaue of the ValueArray: " + ValueArray)
  // console.log("Beginning")

  //   console.log("End")

  // console.log("Gas Size" + GasInformation.length)
  // const gasListItems = GasInformation.map((gas, index) => (
  //   <li key={index}>
  //     <div>Name: {gas.name}</div>
  //     <div>Address: {gas.vicinity}</div>
  //   </li>
  // ));

  // console.log(gasListItems)

  //console.log("Value array:" + ValueArray);
    // console.log(renderList);
  //console.log(distCoords[0][1])
  if(directionResponse){
    //console.log(distCoords);
  }

   return (   
    <main className='water'> 
        <div>
          <Navigation />
        </div>

        <form onSubmit={handleMapSubmit}>
          <div className = "Overlay"></div>

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

          <div class ='gasInputs'>
          <div class = 'gasSide'>

            <select value={gasType} onChange={handleSelect}>
              <option value="">GasType</option>
              <option value="Regular">Regular</option>
              <option value="Midgrade">MidGrade</option>
              <option value="Premium">Premium</option>
              <option value="Diesel">Diesel</option>
            </select>

          </div>
          

          <div class = 'mpgside'>
            <input type="text" value={Mpg} placeholder='Mpg' onChange={handleMPG} />
          </div>

          <div class = 'Tankside'>
            <input type="text" value={TankSize} placeholder='Tank Size' onChange={handleTanksize} />
          </div>
          
          <div class = 'CurrentGas'>

            <select value={CurrentSize} onChange={handleCurrentSize}>
                <option value="">Current Fuel</option>
                <option value="TFive">25%</option>
                <option value="Fifty">50%</option>
                <option value="SFive">75%</option>
                <option value="Full">100%</option>
            </select>
          </div>
        </div>

        
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
              {directionResponse && gasMarkerArray && (
                //  <div style={{ textAlign: "center" }}>
                <div>
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

                    {/* <table className="trip-info">
                      <thead>
                        <tr className="trip-info-row">
                          <th className="trip-info-label">Distance:</th>
                          <td className="trip-info-value">{distance}</td>
                          <th className="trip-info-label">Duration:</th>
                          <td className="trip-info-value">{duration}</td>
                        </tr>
                      </thead>
                      <tbody>
                      </tbody>
                    </table> */}
                {/* <div>
              <h2>Gas Stations</h2>
              <ul>{Array.from(ValueArray).map((dist, index) => {
                  //console.log("Length value array" +  ValueArray.length)
                  //console.log("Name: "+ dist.name +" Vicinity " + dist.vicinity)
                  return(<li key={index}>{dist.name} - {dist.vicinity} - {dist.price}</li>)
                })}</ul>
            </div> */}


                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>Fill</th>
                          <th>Gas Station</th>
                          <th>Address</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(ValueArray).map((dist, index) => (
                          <tr key={index}>
                            <td>{index}</td>
                            <td>{dist.name}</td>
                            <td>{dist.vicinity}</td>
                            <td>{dist.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>


                {/* <div>
                  <h2>Gas Stations</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Vicinity</th>
                      </tr>
                    </thead>
                    <tbody>
                      { ValueArray.length > 0 && ValueArray.map((dist, index) => {
                        console.log("Name: "+ dist.name +" Vicinity " + dist.vicinity)
                        return(
                          <tr key={index}>
                            <td>{dist.name}</td>
                            <td>{dist.vicinity}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div> */}
                
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