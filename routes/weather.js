const express = require('express');
const axios = require('axios');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all weather routes
router.use(isAuthenticated);

router.get('/', async (req, res) => {
    const city = req.query.city || 'Almaty';
    try {
        // Get weather data
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        const weatherData = weatherResponse.data;

        // Get news data
        const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}+weather&apiKey=${process.env.NEWS_API_KEY}&pageSize=3`
        );
        const newsData = newsResponse.data.articles;

        // Get map data
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${weatherData.coord.lon},${weatherData.coord.lat},10,0/600x300?access_token=${process.env.MAPBOX_API_KEY}`;
        
        // Get additional city info from RapidAPI
        const geoDbResponse = await axios.get(
            `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`,
            {
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
                },
                params: { namePrefix: city },
            }
        );
        const geoData = geoDbResponse.data.data[0];

        res.render('weather', {
            title: 'Weather',
            city,
            weather: {
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                feels_like: weatherData.main.feels_like,
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                wind_speed: weatherData.wind.speed,
                country: weatherData.sys.country,
                coordinates: [weatherData.coord.lon, weatherData.coord.lat]
            },
            news: newsData,
            mapUrl,
            geoInfo: geoData ? {
                population: geoData.population,
                region: geoData.region,
                timezone: geoData.timezone,
            } : null,
            error: null
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response data'
        });

        let errorMessage = 'Error fetching weather data. ';
        
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    errorMessage += 'API authentication failed. Please check API keys.';
                    break;
                case 404:
                    errorMessage += 'City not found. Please check the city name.';
                    break;
                case 429:
                    errorMessage += 'Too many requests. Please try again later.';
                    break;
                default:
                    errorMessage += 'Please try again later.';
            }
        } else if (error.request) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else {
            errorMessage += error.message;
        }

        res.render('weather', {
            title: 'Weather',
            error: errorMessage,
            city: city,
            weather: null,
            news: [],
            mapUrl: null,
            geoInfo: null
        });
    }
});

// Keep the POST route for form submission
router.post('/getWeather', isAuthenticated, (req, res) => {
    const city = req.body.city || 'Almaty';
    res.redirect(`/weather?city=${encodeURIComponent(city)}`);
});

module.exports = router;