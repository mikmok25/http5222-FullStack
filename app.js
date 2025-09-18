const express = require("express");
const axios = require("axios");
const path = require("path");
require('dotenv').config()
const { formatDate } = require("./modules");

const app = express();
app.use(express.static("public"));

// Set up Pug as the view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PAGE_SIZE = 10;

app.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const city = "Toronto";

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.APP_ID}&units=metric`
    );

    const weatherData = weatherResponse.data;

    // Fetch 5-day forecast data
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.APP_ID}&units=metric`
    );
    const forecastData = forecastResponse.data;

    // Process the forecast data to get daily summaries
    const dailyForecast = [];
    for (let i = 0; i < forecastData.list.length; i += 8) {
      dailyForecast.push({
        date: formatDate(forecastData.list[i].dt_txt),
        description: forecastData.list[i].weather[0].description,
        temperature: forecastData.list[i].main.temp.toFixed(),
        icon: forecastData.list[i].weather[0].icon,
      });
    }

    // Fetch news data related to weather in the city
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=${city} Weather&apiKey=${process.env.NEWS_API}`
    );

    const newsData = newsResponse.data.articles || [];

    // Calculate pagination
    const totalArticles = newsData.length;
    const totalPages = Math.ceil(totalArticles / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedNews = newsData.slice(startIndex, startIndex + PAGE_SIZE);

    res.render("index", {
      title: "Weather News App",
      city,
      weather: {
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp.toFixed(),
        icon: weatherData.weather[0].icon,
        date: formatDate(new Date().toLocaleDateString()),
        forecast: dailyForecast,
      },
      news: paginatedNews.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: formatDate(new Date(article.publishedAt)), // Format the date
      })),
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/fetch-data", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const city = req.query.city || "Toronto";

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APP_ID}&units=metric`
    );

    const weatherData = weatherResponse.data;

    // Fetch 5-day forecast data
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APP_ID}&units=metric`
    );
    const forecastData = forecastResponse.data;

    // Process the forecast data to get daily summaries
    const dailyForecast = [];
    for (let i = 0; i < forecastData.list.length; i += 8) {
      dailyForecast.push({
        date: formatDate(forecastData.list[i].dt_txt),
        description: forecastData.list[i].weather[0].description,
        temperature: forecastData.list[i].main.temp.toFixed(),
        icon: forecastData.list[i].weather[0].icon,
      });
    }

    // Fetch news data related to weather in the city
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=weather ${city}&apiKey=${NEWS_API}`
    );

    const newsData = newsResponse.data.articles || [];

    // Calculate pagination
    const totalArticles = newsData.length;
    const totalPages = Math.ceil(totalArticles / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedNews = newsData.slice(startIndex, startIndex + PAGE_SIZE);

    res.render("index", {
      title: "Weather News App",
      city,
      weather: {
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp.toFixed(),
        icon: weatherData.weather[0].icon,
        date: formatDate(new Date().toLocaleDateString()),
        forecast: dailyForecast,
      },
      news: paginatedNews.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: formatDate(new Date(article.publishedAt)), // Format the date
      })),
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`<h1>Couldn't found city</h1> <a href="/">Go back</a>`);
  }
});

app.get("/news/:id", async (req, res) => {
  try {
    const articleUrl = decodeURIComponent(req.params.id);

    // Fetch news data related to weather in the city
    const city = req.query.city || "Toronto";

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APP_ID}&units=metric`
    );

    const weatherData = weatherResponse.data;

    // Fetch 5-day forecast data
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APP_ID}&units=metric`
    );
    const forecastData = forecastResponse.data;

    // Process the forecast data to get daily summaries
    const dailyForecast = [];
    for (let i = 0; i < forecastData.list.length; i += 8) {
      dailyForecast.push({
        date: formatDate(forecastData.list[i].dt_txt),
        description: forecastData.list[i].weather[0].description,
        temperature: forecastData.list[i].main.temp.toFixed(),
        icon: forecastData.list[i].weather[0].icon,
      });
    }

    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=weather ${city}&apiKey=${NEWS_API}`
    );
    const newsData = newsResponse.data.articles;

    // Find the article by URL
    const article = newsData.find((a) => a.url === articleUrl);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    res.render("news-details", {
      title: article.title,
      article,
      city,
      weather: {
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp.toFixed(),
        icon: weatherData.weather[0].icon,
        date: formatDate(new Date().toLocaleDateString()),
        forecast: dailyForecast,
      },
    });
  } catch (error) {
    console.error("Error fetching article details:", error.message);
    res.status(500).send("Error fetching article details");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
