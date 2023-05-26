import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './minBar.css';

function MiniNavBar({ distance, duration, totalPrice, ValueArray }) {
  const [showDistance, setShowDistance] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showGasStations, setShowGasStations] = useState(false);
  const [ShowTotalPrice, setShowTotalPrice] = useState(false);

  const handleDistanceClick = () => {
    setShowDistance((prevState) => !prevState);
    setShowDuration(false);
    setShowGasStations(false);
  };

  const handleDurationClick = () => {
    setShowDistance(false);
    setShowDuration((prevState) => !prevState);
    setShowGasStations(false);
  };

  const handleGasStationsClick = () => {
    setShowDistance(false);
    setShowDuration(false);
    setShowGasStations((prevState) => !prevState);
  };


  const handleTotalPriceClick = () => {
    setShowDistance(false);
    setShowDuration(false);
    setShowGasStations(false);
    setShowTotalPrice((prevState) => !prevState);
  };


  console.log("This is ValueArray:", ValueArray);

  return (
    <nav className="mini-navbar">
      <ul>
        <li>
          <a href="#distance" onClick={handleDistanceClick}>
            Distance: {distance} <i className="fa-solid fa-location-dot"></i>
          </a>
        </li>
        <li>
          <a href="#duration" onClick={handleDurationClick}>
            Duration: {duration} <i class="fa-thin fa-timer"></i>
          </a>
        </li>
        <li>
          <a href="#gas-stations" onClick={handleGasStationsClick}>
          <i class="fa-solid fa-gas-pump"></i>Gas Stations 
          </a>
        </li>

        <li>
          <a href="#total-price" onClick={handleTotalPriceClick}>
            Total Price: <i class="fa-solid fa-dollar-sign"></i>{totalPrice} 
          </a>
        </li>

      </ul>
      <div className="mini-navbar-info">
        {showDistance && <p>Distance: {distance}</p>}
        {showDuration && <p>Duration: {duration}</p>}
        {ShowTotalPrice && <p>Total Price: {totalPrice}</p>}
      </div>
      {showGasStations && (
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Stop</th>
                  <th>Gas Station</th>
                  <th>Address</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(ValueArray).map((dist, index) => (
                  <tr key={index}>
                    <td>{index+1}</td>
                    <td>{dist.name}</td>
                    <td>{dist.vicinity}</td>
                    <td>{dist.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MiniNavBar;