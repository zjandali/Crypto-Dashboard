// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Bell, DollarSign, TrendingUp, BarChart2, Calendar, Repeat, AlertTriangle
} from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'; // Custom CSS for additional styling
// index.js or App.js
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap components
import {
  Navbar, Nav, Container, Row, Col, Card, Button, Form, Alert
} from 'react-bootstrap';

// Import Three.js Background
import ThreeBackground from './ThreeBackground';

function App() {
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertPrice, setAlertPrice] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [convertAmount, setConvertAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionType, setConversionType] = useState('usdToCoin');
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // Default to Bitcoin

  // List of popular cryptocurrencies
  const coinOptions = [
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'litecoin', name: 'Litecoin' },
    { id: 'ripple', name: 'Ripple' },
    { id: 'cardano', name: 'Cardano' },
    { id: 'dogecoin', name: 'Dogecoin' },
    // Add more coins as needed
  ];

  useEffect(() => {
    fetchData();
    // Set up daily updates
    const dailyUpdate = setInterval(fetchData, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    return () => clearInterval(dailyUpdate);
  }, [startDate, endDate, selectedCoin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current coin data
      const currentDataResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCoin}`);
      setCoinData(currentDataResponse.data);

      // Fetch historical data
      const from = Math.floor(startDate.getTime() / 1000);
      const to = Math.floor(endDate.getTime() / 1000);

      const historicalDataResponse = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart/range`,
        {
          params: {
            vs_currency: 'usd',
            from: from,
            to: to,
          },
        }
      );

      const formattedHistoricalData = historicalDataResponse.data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: price,
      }));

      setHistoricalData(formattedHistoricalData);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setError('Failed to fetch data. Please try again later.');
    }
  };

  useEffect(() => {
    if (
      coinData &&
      alertPrice &&
      coinData.market_data.current_price.usd >= parseFloat(alertPrice)
    ) {
      setShowAlert(true);
    }
  }, [coinData, alertPrice]);

  const handleSetAlert = () => {
    setAlertPrice(parseFloat(alertPrice));
    setShowAlert(false);
  };

  const handleConvert = () => {
    if (coinData) {
      let converted;
      if (conversionType === 'usdToCoin') {
        converted = parseFloat(convertAmount) / coinData.market_data.current_price.usd;
      } else {
        converted = parseFloat(convertAmount) * coinData.market_data.current_price.usd;
      }
      setConvertedAmount(converted);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-dark">
        <div className="text-white text-2xl animate-pulse">Loading {selectedCoin.charAt(0).toUpperCase() + selectedCoin.slice(1)} Data...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-white">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="bg-opacity-75">
        <Container>
          <Navbar.Brand href="#dashboard">{coinData.name} Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <Form.Select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="me-3 bg-secondary text-white border-0"
                style={{ width: '150px' }}
              >
                {coinOptions.map((coin) => (
                  <option key={coin.id} value={coin.id}>{coin.name}</option>
                ))}
              </Form.Select>
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#history">History</Nav.Link>
              <Nav.Link href="#converter">Converter</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Spacer for fixed navbar */}
      <div style={{ marginTop: '80px' }}></div>

      {/* Alert Notification */}
      {showAlert && (
        <Container className="mt-3">
          <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible>
            <Alert.Heading>
              <AlertTriangle className="me-2" />
              Price Alert!
            </Alert.Heading>
            <p>
              {coinData.name} price has reached ${alertPrice}!
            </p>
          </Alert>
        </Container>
      )}

      {/* Error Message */}
      {error && (
        <Container className="mt-3">
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <Alert.Heading>
              <AlertTriangle className="me-2" />
              Error
            </Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      )}

      {/* Dashboard */}
      <Container id="dashboard" className="mt-4">
        <Row className="g-4">
          {/* Current Price */}
          <Col xs={12} md={6} lg={3}>
            <Card bg="secondary" text="white" className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <DollarSign className="me-2" size={24} />
                  <Card.Title>Current Price</Card.Title>
                </div>
                <Card.Text style={{ fontSize: '1.5rem' }}>
                  ${coinData.market_data.current_price.usd.toFixed(2)}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* 24h Change */}
          <Col xs={12} md={6} lg={3}>
            <Card bg="secondary" text="white" className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <TrendingUp className="me-2" size={24} />
                  <Card.Title>24h Change</Card.Title>
                </div>
                <Card.Text
                  style={{ fontSize: '1.5rem' }}
                  className={coinData.market_data.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}
                >
                  {coinData.market_data.price_change_percentage_24h.toFixed(2)}%
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Market Cap */}
          <Col xs={12} md={6} lg={3}>
            <Card bg="secondary" text="white" className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <BarChart2 className="me-2" size={24} />
                  <Card.Title>Market Cap</Card.Title>
                </div>
                <Card.Text style={{ fontSize: '1.5rem' }}>
                  ${coinData.market_data.market_cap.usd.toLocaleString()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Set Price Alert */}
          <Col xs={12} md={6} lg={3}>
            <Card bg="secondary" text="white" className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Bell className="me-2" size={24} />
                  <Card.Title>Set Price Alert</Card.Title>
                </div>
                <Form>
                  <Form.Group controlId="alertPrice" className="mb-3">
                    <Form.Control
                      type="number"
                      placeholder="Enter alert price"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      min="0"
                    />
                  </Form.Group>
                  <Button variant="danger" onClick={handleSetAlert} className="w-100">
                    Set Alert
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Historical Data */}
      <Container id="history" className="mt-5 bg-secondary p-4 rounded">
        <Row className="mb-4">
          <Col xs={12} md={6}>
            <h2>{coinData.name} Price Chart</h2>
          </Col>
          <Col xs={12} md={6} className="d-flex align-items-center">
            <Calendar className="me-2" />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="form-control me-2"
              style={{ maxWidth: '150px' }}
            />
            <span className="me-2">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="form-control me-2"
              style={{ maxWidth: '150px' }}
            />
            <Button variant="primary" onClick={fetchData}>
              <Repeat className="me-2" />
              Update
            </Button>
          </Col>
        </Row>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Container>

      {/* Converter */}
      <Container id="converter" className="mt-5">
        <Card bg="secondary" text="white" className="p-4">
          <Card.Body>
            <Card.Title className="mb-4">Currency Converter</Card.Title>
            <Row className="align-items-center">
              <Col xs={12} md={8}>
                <Form className="d-flex flex-column flex-md-row align-items-center">
                  <Form.Group controlId="convertAmount" className="mb-3 mb-md-0 me-md-3 w-100">
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      min="0"
                    />
                  </Form.Group>
                  <Form.Group controlId="conversionType" className="mb-3 mb-md-0 me-md-3">
                    <Form.Select
                      value={conversionType}
                      onChange={(e) => setConversionType(e.target.value)}
                    >
                      <option value="usdToCoin">USD to {coinData.symbol.toUpperCase()}</option>
                      <option value="coinToUsd">{coinData.symbol.toUpperCase()} to USD</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="selectCoin" className="mb-3 mb-md-0 me-md-3">
                    <Form.Select
                      value={selectedCoin}
                      onChange={(e) => {
                        setSelectedCoin(e.target.value);
                        setConvertAmount('');
                        setConvertedAmount(null);
                      }}
                    >
                      {coinOptions.map((coin) => (
                        <option key={coin.id} value={coin.id}>{coin.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button variant="success" onClick={handleConvert}>
                    Convert
                  </Button>
                </Form>
              </Col>
            </Row>
            {convertedAmount !== null && (
              <Row className="mt-4">
                <Col>
                  <h5>
                    {conversionType === 'usdToCoin'
                      ? `$${convertAmount} USD = ${convertedAmount.toFixed(6)} ${coinData.symbol.toUpperCase()}`
                      : `${convertAmount} ${coinData.symbol.toUpperCase()} = $${convertedAmount.toFixed(2)} USD`}
                  </h5>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-center text-white py-4 mt-5">
        © {new Date().getFullYear()} {coinData.name} Tracker. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
