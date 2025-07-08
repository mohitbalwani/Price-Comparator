# 🛒 Universal Price Comparator

A generic tool that fetches product prices from multiple websites based on country and product query.

## 🚀 Features

- **Universal Coverage**: Works across all countries and product categories
- **Multi-Website Scraping**: Searches Amazon, eBay across multiple countries
- **Smart Parsing**: Extracts accurate price and product information
- **Price Sorting**: Results ranked by ascending price
- **Web Interface**: Simple frontend for easy testing
- **API Endpoints**: RESTful API for programmatic access

## 🏗️ Architecture

- **Backend**: Node.js/Express with concurrent web scraping
- **Frontend**: Vanilla HTML/JS interface
- **Deployment**: Docker + Vercel ready
- **Data Parsing**: Cheerio with intelligent selectors

## 📦 Installation

### Option 1: Docker (Recommended)
```bash
docker build -t price-comparator .
docker run -p 5000:5000 price-comparator
```

### Option 2: Local Setup
```bash
npm install
npm start
```

## 🧪 Testing

### Web Interface
Open http://localhost:5000 in your browser

### API Testing
```bash
node test.js
```

### cURL Examples

**Test Case 1: iPhone in US**
```bash
curl -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"country": "US", "query": "iPhone 16 Pro, 128GB"}'
```

**Test Case 2: boAt Airdopes in India**
```bash
curl -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"country": "IN", "query": "boAt Airdopes 311 Pro"}'
```

## 📊 Sample Output

```json
[
  {
    "link": "https://amazon.com/dp/B0CHWV2WYC",
    "price": "999.00",
    "currency": "USD",
    "productName": "Apple iPhone 16 Pro 128GB",
    "website": "amazon"
  },
  {
    "link": "https://ebay.com/itm/123456789",
    "price": "1049.99",
    "currency": "USD",
    "productName": "iPhone 16 Pro 128GB Unlocked",
    "website": "ebay"
  }
]
```

## 🌍 Supported Countries & Websites

| Country | Websites |
|---------|----------|
| US | Amazon, eBay |
| India | Amazon.in, eBay |
| UK | Amazon.co.uk, eBay |

## 🔧 API Endpoints

- `POST /search` - Search products
- `GET /health` - Health check
