import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

function App() {
  const [ethData, setEthData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current Ethereum data
        const currentDataResponse = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum');
        setEthData(currentDataResponse.data);

        // Fetch 30 days of historical data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const from = Math.floor(thirtyDaysAgo.getTime() / 1000);
        const to = Math.floor(Date.now() / 1000);

        const historicalDataResponse = await axios.get(
          `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
        );
        
        const formattedHistoricalData = historicalDataResponse.data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: price
        }));
        
        setHistoricalData(formattedHistoricalData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Set up daily updates
    const dailyUpdate = setInterval(fetchData, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(dailyUpdate);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Daily Tracker</h1>
        {ethData && (
          <div>
            <h2>Current Price: ${ethData.market_data.current_price.usd.toFixed(2)}</h2>
            <p>24h Change: {ethData.market_data.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: ${ethData.market_data.market_cap.usd.toLocaleString()}</p>
            <p>24h Trading Volume: ${ethData.market_data.total_volume.usd.toLocaleString()}</p>
          </div>
        )}
        <h2>30 Day Price History</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </header>
    </div>
  );
}

export default App;