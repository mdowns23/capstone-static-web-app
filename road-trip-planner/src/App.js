//import logo from './logo.svg';
//import './App.css';
import './hero.css'
import MinNavBar from './MinNavBar';
import Navigation from "./Navigation";
//import './style.css'
import React, { useState, useEffect, useRef } from 'react';
//import '@google-polyline'
import {Box, Button} from '@chakra-ui/react'
import {useJsApiLoader, GoogleMap, MarkerF, Autocomplete, DirectionsRenderer, Polygon} from '@react-google-maps/api'
/*global google*/ 

// center of space needle 
const center = {lat: 47.6205,lng: -122.3493}

function App() {
  const [startingLocation, setStartingLocation] = useState()
  //variable: destation
  const [destination, setDestination] = useState()

  const [gasType, setGasType] = useState()

  const [Mpg, setMpg] = useState()

  const [TankSize, setTankSize] = useState()

  const [CurrentSize, setCurrentSize] = useState()


  const [isShown, setIsShown] = useState(false);
 
  const [ValueArray, setValueArray] = useState(new Set())

  

  const [gasInformaiton, setGasInformation] = useState([])


  const handleSatringLocationChange = (event) => {
    const value = event.target.value;
    setStartingLocation(value);
    
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
  const [TotalPrice, setTotalPrice] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()

  const contentRef = useRef(null);

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
    
    // Scroll to the bottom of the screen after route calculation
    const scrollToBottom = () => {
      window.scrollTo(0, document.body.scrollHeight);
    };

    // Execute the route calculation
    await calculateRoute();

    // Scroll to the bottom of the screen
    scrollToBottom();
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
    totalGasPrice = 0

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
  let totalGasPrice = 0

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

  var count = 0
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
    console.log("LENGTH: " + waypoints.length)
    for (let i = 0; i < waypoints.length; i+=5){
      const location = { lat: waypoints[i][0], lng: waypoints[i][1] };
      const radius = '50000';
      const type = ['gas_station'];
      console.log("I: " + i)
      try {
        //await delay(250)
        const results = await nearbySearchPromise(service, location, radius, type);
        console.log("RESULTS: "+results)
        await callback(results, google.maps.places.PlacesServiceStatus.OK);
      } catch (error) {
        console.error(error);
      }
    }
    
    
      //console.log("i before the second for loop: " + i)

      function callback(results, status) {
        return new Promise(async (resolve, reject) => {
          if(status === google.maps.places.PlacesServiceStatus.OK){
            for (var j = 0; j < results.length; j+=3){
              if(google.maps.geometry.poly.containsLocation(results[j].geometry.location,pBounds) === true){
                //console.log("J internal for loop :" + j);
                try {
                  //await delay(500)
                  let dist = await distanceCalc(distCoords[distCoords.length-1][0], distCoords[distCoords.length-1][1], results[j].geometry.location.lat(), results[j].geometry.location.lng() );
                  //console.log("j: " +j+ "DISTMILES: " + dist)
                  dist = dist / Mpg;
                  var tmpTankSize = currTankSize - dist
                  var gasLvl = tmpTankSize/TankSize;
                  
                  
                  //console.log("i: " + i + " j: " + j+ " Gasb4: " + gasLvl);
                  console.log("j:" + j + "GASLVL B4: " + gasLvl)
                  var gasLvlR = Math.round(gasLvl *10) / 10;
                  console.log("j:" + j +"GASLVL: " + gasLvl)
                  console.log("GASLVLR: " + gasLvlR)
                  if (gasLvlR <= .5){
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
                      var tgp = await price
                      //console.log("TGP: " + tgp)
                      totalGasPrice = totalGasPrice + ((parseFloat(await tgp)) * ((1-gasLvl)*TankSize))
                      totalGasPrice = Math.round(totalGasPrice *100) / 100;
                      console.log("TGP: " + totalGasPrice)
                      setTotalPrice(totalGasPrice)
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
                    if(j >= (parseInt(results.length/2))){
                      console.log("breaking...")
                      break;
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
      return data
    //}
  }

  async function distanceCalc(lat1, long1, lat2, long2){
    const pt1 = {lat: lat1, lng: long1}
    const pt2 = {lat: lat2, lng: long2}

    try{
    let distanceService = new google.maps.DirectionsService()
    const dist = await distanceService.route({
      origin: pt1,
      destination: pt2, 
      travelMode: google.maps.TravelMode.DRIVING})

      
    
    var miles = dist.routes[0].legs[0].distance.value

    miles = miles/1609.34
    return miles
    }catch(error){
      if (error.code === "OVER_QUERY_LIMIT") {
        console.log("Retrying distanceCalc request...");
        await delay(3000);
        return distanceCalc(lat1, long1, lat2, long2);
      } else {
        throw error;
      }
    }

  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  if(directionResponse){ }

   return (   
    <main className='water'> 
        <div>
          <Navigation />
        </div>

        <div className="HeroSection">
  <video autoPlay loop muted id="video">
    <source src="/Videos/maldivesVideo.mp4" type="video/mp4" />
  </video>
  <div className="overlay"></div>

  <div className="content">
    <h1>Plan your Trip</h1>

    <form className="form" onSubmit={handleMapSubmit}>

      <div className='Tablegroup'>
          <table className='TableInfo'>
              <tr className='tr_1'>
                <td className = 'td_1'>
                  <label htmlFor="startingLocation">Origin:</label>
                </td>

                <td className='td_2'>
                      <Autocomplete>
                      <input
                        className='inputSoruce'
                        type="text"
                        value={startingLocation}
                        // placeholder="Starting Location"
                        ref={originRef}
                        onChange={handleSatringLocationChange}
                      />
                    </Autocomplete>
                </td>
              {/* </tr> */}
            
              {/* <tr> */}
                <td className='td_3'>
                  <label htmlFor="destination">Destination:</label>
                </td>

                <td>

                <Autocomplete>
                    <input
                      type="text"
                      value={destination}
                      ref={destinationRef}
                      // placeholder="Destination"
                      onChange={handleDestinationChange}
                    />
                </Autocomplete>

                </td>
              </tr>
            
          </table>
      </div>

      <div className="gasInputs">
        <div className="gasSide">
          <select value={gasType} onChange={handleSelect}>
            <option value="">GasType</option>
            <option value="Regular">Regular</option>
            <option value="Midgrade">MidGrade</option>
            <option value="Premium">Premium</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        <div className='Tablegroup'>
          <table className='TableInfo1'>
              <tr className='tr_1'>
                <td className = 'td_1'>
                <label htmlFor="Mpg">Enter MPG:</label>
                </td>

                <td className='td_2'>
                <input type="text" value={Mpg} placeholder="Mpg" onChange={handleMPG} />
                </td>
              {/* </tr> */}
            
              {/* <tr> */}
                <td className='td_3'>
                <label htmlFor="TankSize">Tank Size:</label>
                </td>
                <td>
                <input type="text" value={TankSize} placeholder="Tank Size" onChange={handleTanksize} />
                </td>
              </tr>
            
          </table>
          </div>

        
        
        <div className="currentGas">
          <select value={CurrentSize} onChange={handleCurrentSize}>
            <option value="">Current Fuel</option>
            <option value="TFive">25%</option>
            <option value="Fifty">50%</option>
            <option value="SFive">75%</option>
            <option value="Full">100%</option>
          </select>
        </div>
      </div>

      <div className="button">
        <button type="submit" onClick={calculateRoute}>
          Calculate Route <i className="fa-solid fa-route"></i>
        </button>
        <div className='clearbutton'>
        <button type="submit" onClick={clearRoute}>
          Clear <i className="fa-solid fa-xmark"></i>
        </button>
        </div>
      </div>
    </form>
  </div>
</div>

<div className="SecondPage">
  <div id="map">
  <div style={{ height: '2000px' }} id="content" ref={contentRef}>

    <Box position="absolute" left={20} top={900} h="75%" w="95%">
      {/*Google Map Box*/}
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        onLoad={(map) => setMap(map)}
      >
        {/*Display markers*/}
      </GoogleMap>

      {directionResponse && gasMarkerArray && (
        // <div className='minibar' style={{ width: '200px' }}>
          <MinNavBar distance={distance} duration={duration} totalPrice={TotalPrice} ValueArray={ValueArray}/>
        // </div>
        
          
        
      )}
    </Box>
  </div>
  </div>
</div>


      </main>
  //   return null

  )

}

export default App;