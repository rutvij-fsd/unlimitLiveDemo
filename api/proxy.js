

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const endpoint = req.query.endpoint;
    const url = require('url');

    const parsedUrl = url.parse(req.url, true);
    const queryString = new URLSearchParams(parsedUrl.query).toString().replace("endpoint=" + encodeURIComponent(endpoint), "");
    const apiUrl = `https://api-sandbox.gatefi.com${endpoint}?${queryString}`;
    
    
    console.log("Incoming headers:", req.headers);
    console.log("API URL:", apiUrl);
    console.log("Request:", req);
    try {
        const response = await fetch(apiUrl, {
            method: req.method,
            headers: {
                "signature": req.headers.signature,
                "api-key": req.headers["api-key"],
            }
        });

        const contentType = response.headers.get("content-type");



        console.log("Response from external API:", response);
        console.log("Response headers from external API:", [...response.headers]);

        const externalApiUrl = response.url;
        res.setHeader('X-External-Api-Url', externalApiUrl);


        
        // Extract the X-Final-Url header from the original response
        const finalUrl = response.headers.get('X-Final-Url');

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            // Check if the endpoint is /onramp/v1/buy before setting the header
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl); // Set the header in the proxy response
            }
            res.status(200).json(data);
        } else {
            const rawText = await response.text();
            // Check if the endpoint is /onramp/v1/buy before setting the header
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl); // Set the header in the proxy response
            }
            res.status(200).send(rawText);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Unable to fetch data' });
    }
};





