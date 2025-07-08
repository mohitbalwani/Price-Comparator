import axios from 'axios';
import * as cheerio from 'cheerio';

const WEBSITES = {
  US: [
    { name: 'amazon', url: 'https://www.amazon.com/s?k=', currency: 'USD' },
    { name: 'ebay', url: 'https://www.ebay.com/sch/i.html?_nkw=', currency: 'USD' },
    { name: 'walmart', url: 'https://www.walmart.com/search?q=', currency: 'USD' }
  ],
  IN: [
    { name: 'amazon', url: 'https://www.amazon.in/s?k=', currency: 'INR' },
    { name: 'ebay', url: 'https://www.ebay.com/sch/i.html?_nkw=', currency: 'INR' },
    { name: 'flipkart', url: 'https://www.flipkart.com/search?q=', currency: 'INR' }
  ],
  UK: [
    { name: 'amazon', url: 'https://www.amazon.co.uk/s?k=', currency: 'GBP' },
    { name: 'ebay', url: 'https://www.ebay.com/sch/i.html?_nkw=', currency: 'GBP' }
  ]
};

async function scrapeWebsite(site, query) {
  try {
    const url = site.url + encodeURIComponent(query);

    let finalUrl = url;
    let headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    };
    
    if (site.name === 'amazon') {

      finalUrl = url.replace('www.amazon', 'm.amazon');
      headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    }
    
    const response = await axios.get(finalUrl, {
      headers,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log(`${site.name} response status:`, response.status);
    
    const $ = cheerio.load(response.data);
    const results = [];

    if (site.name === 'ebay') {
      $('.s-item').slice(1, 8).each((i, element) => {
        try {
          const $el = $(element);
          const title = $el.find('.s-item__title').text().trim();
          const price = $el.find('.s-item__price').text().trim();
          const link = $el.find('.s-item__link').attr('href');
          
          if (title && price && link && !title.includes('Shop on eBay')) {
            const priceMatch = price.match(/[\d,]+\.?\d*/);
            if (priceMatch) {
              results.push({
                link: link,
                price: priceMatch[0].replace(/,/g, ''),
                currency: site.currency,
                productName: title,
                website: site.name
              });
            }
          }
        } catch (err) {}
      });
    } else if (site.name === 'amazon') {
      // Check if we got blocked
      if (response.data.includes('Robot Check') || response.data.includes('captcha')) {
        console.log('Amazon blocked the request');
        return [];
      }
      
      // Try mobile Amazon selectors first
      let containers = $('.item-container, .s-result-item, [data-asin]').slice(0, 6);
      
      // Fallback to desktop selectors
      if (containers.length === 0) {
        containers = $('[data-component-type="s-search-result"], .s-result-item').slice(0, 6);
      }
      
      console.log(`Found ${containers.length} Amazon containers`);
      
      containers.each((i, element) => {
        try {
          const $el = $(element);
          
          // Try all possible selectors
          let title = $el.find('h2 a span, .s-size-mini span, [data-cy="title-recipe"], .item-title a').first().text().trim();
          let price = $el.find('.a-price-whole, .a-price .a-offscreen, .item-price, span:contains("$")').first().text().trim();
          let link = $el.find('h2 a, .s-link-style a, .item-title a').first().attr('href');
          
          // Fallback price extraction from any element containing price patterns
          if (!price) {
            $el.find('*').each((j, el) => {
              const text = $(el).text();
              if (text.match(/\$[\d,]+/) && !price) {
                price = text;
              }
            });
          }
          
          console.log(`Amazon item ${i}: title="${title}", price="${price}", link="${link}"`);
          
          // Clean price and validate
          if (price && title) {
            const priceMatch = price.match(/[\d,]+/);
            if (priceMatch) {
              const domain = site.currency === 'INR' ? 'amazon.in' : site.currency === 'GBP' ? 'amazon.co.uk' : 'amazon.com';
              const finalLink = link && link !== 'undefined' ? 
                (link.startsWith('http') ? link : `https://${domain}${link}`) : 
                `https://${domain}/s?k=${encodeURIComponent(query)}`;
              
              results.push({
                link: finalLink,
                price: priceMatch[0].replace(/,/g, ''),
                currency: site.currency,
                productName: title.substring(0, 100),
                website: site.name
              });
              console.log(`✅ Added Amazon result: ${title} - $${priceMatch[0]}`);
            }
          }
        } catch (err) {
          console.log('Amazon parsing error:', err.message);
        }
      });
    }

    console.log(`${site.name} found ${results.length} results`);
    return results;
  } catch (error) {
    console.log(`${site.name} error:`, error.message);
    return [];
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, country } = req.body;

    if (!query || !country) {
      return res.status(400).json({ error: 'Query and country are required' });
    }

    const websites = WEBSITES[country] || WEBSITES.US;
    const promises = websites.map(site => scrapeWebsite(site, query));
    const results = await Promise.allSettled(promises);
    const successfulResults = results.map(r => r.status === 'fulfilled' ? r.value : []).flat();
    
    // Sort results by price
    successfulResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    res.json(successfulResults.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}