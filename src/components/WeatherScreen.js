import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WeatherScreen.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloud,
    faSun,
    faCloudRain,
    faSnowflake,
    faBolt,
    faSmog,
    faWind,
    faDroplet,
    faThermometerHalf,
    faCompass,
    faLocationArrow
} from "@fortawesome/free-solid-svg-icons";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function WeatherScreen() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCelsius, setIsCelsius] = useState(true); // Estado para unidades de temperatura
    const navigate = useNavigate();
    


    const apiKey = "8131bccb7b19623b8eab03600c725abd"; // Substitua pela sua chave da OpenWeatherMap

    const fetchWeatherData = async (latitude, longitude) => {
        try {
            const units = isCelsius ? "metric" : "imperial";
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}&lang=pt`
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar os dados do clima");
            }
            const data = await response.json();
            setWeather(data);
            setError(null); // Clear any previous error
            fetchForecastData(latitude, longitude);
        } catch (err) {
            setError(err.message);
            setWeather(null); // Clear weather data if there's an error
        } finally {
            setLoading(false);
        }
    };

    const fetchForecastData = async (latitude, longitude) => {
        try {
            const units = isCelsius ? "metric" : "imperial";
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}&lang=pt`
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar os dados de previsão do tempo");
            }

            const data = await response.json();
            setForecast(data.list);
        } catch (error) {
            console.error("Erro ao buscar os dados de previsão do tempo:", error);
            setForecast(null);
        }
    };

    const handleLocationSearch = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=1&appid=${apiKey}`
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar a localização");
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLocation({ lat, lon });
                await fetchWeatherData(lat, lon);
            } else {
                throw new Error("Localização não encontrada");
            }
        } catch (err) {
            setError(err.message);
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lon: longitude });
                    fetchWeatherData(latitude, longitude);
                },
                (err) => {
                    setError("Erro ao obter localização");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocalização não suportada");
            setLoading(false);
        }
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleLocationSearch(searchQuery);
    };

    const getLocalTime = () => {
        if (!weather || !weather.timezone) return null;

        const now = new Date();
        const offset = weather.timezone; //seconds
        const localTime = new Date(
            now.getTime() + offset * 1000 + now.getTimezoneOffset() * 60 * 1000
        );
        return localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getWeatherIcon = (weather) => {
        if (!weather || !weather.length) return null;
        const condition = weather[0].main.toLowerCase();

        switch (condition) {
            case "clouds":
                return faCloud;
            case "clear":
                return faSun;
            case "rain":
                return faCloudRain;
            case "snow":
                return faSnowflake;
            case "thunderstorm":
                return faBolt;
            case "mist":
            case "haze":
            case "fog":
                return faSmog;
            default:
                return faSun;
        }
    };

    const toggleTemperatureUnit = () => {
        setIsCelsius(!isCelsius);
    };
    const convertTemperature = (temp) => {
        if (isCelsius) return temp;
        // Convertendo para Fahrenheit se não for Celsius
        return (temp * 9) / 5 + 32;
    };

    const temperatureUnit = isCelsius ? "°C" : "°F";

    const formatXAxis = (tickItem) => {
        if (!tickItem) return "";

        const date = new Date(tickItem * 1000);

        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    function MapView() {
        const map = useMap();
        useEffect(() => {
            if (location) {
                map.setView([location.lat, location.lon], 10);
            }
        }, [location, map]);

        return null;
    }

    const temperatureData = forecast
        ? forecast.map((item) => ({
              time: item.dt,
              temperature: convertTemperature(item.main.temp).toFixed(1),
          }))
        : [];

    return (
        <div className="weather-screen">
            <div className="search-container">
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Buscar localidade"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">
                        <FontAwesomeIcon icon={faLocationArrow} />
                    </button>
                </form>
                <button className="toggle-unit-btn" onClick={toggleTemperatureUnit}>
                    {isCelsius ? "Mostrar em °F" : "Mostrar em °C"}
                </button>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : weather ? (
                <div className="weather-container">
                    <div className="map-container">
                        <MapContainer
                            center={[location.lat, location.lon]}
                            zoom={10}
                            style={{ height: "300px", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapView />
                            <Marker position={[location.lat, location.lon]}></Marker>
                        </MapContainer>
                    </div>
                    <div className="chart-container">
                        {forecast && (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={temperatureData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" tickFormatter={formatXAxis} label={{ value: "Hora", position: 'insideBottom', offset: -5 }}/>
                                    <YAxis label={{ value: `Temperatura (${temperatureUnit})`, angle: -90, position: 'insideLeft', offset: 10}}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Hora"/>
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="weather-info">
                        <h2>{weather.name}</h2>
                        {getLocalTime() && (
                            <p className="local-time">Hora local: {getLocalTime()}</p>
                        )}

                        <div className="weather-condition">
                            <FontAwesomeIcon icon={getWeatherIcon(weather.weather)} size="3x" />
                            <p>{weather.weather[0].description}</p>
                        </div>
                        <p>
                            Temperatura: {convertTemperature(weather.main.temp).toFixed(1)}
                            {temperatureUnit}
                        </p>
                        <p>
                            <FontAwesomeIcon icon={faThermometerHalf} />
                            Sensação térmica:{" "}
                            {convertTemperature(weather.main.feels_like).toFixed(1)}{" "}
                            {temperatureUnit}
                        </p>
                        <p>
                            <FontAwesomeIcon icon={faDroplet} /> Humidade: {weather.main.humidity}%
                        </p>
                        <p>
                            <FontAwesomeIcon icon={faWind} /> Vento: {weather.wind.speed} m/s
                        </p>
                        <p>
                            <FontAwesomeIcon icon={faCompass} /> Pressão: {weather.main.pressure} hPa
                        </p>

                        <div className="temp-range">
                            <p>
                                Temp. Máxima:{" "}
                                {convertTemperature(weather.main.temp_max).toFixed(1)}
                                {temperatureUnit}
                            </p>
                            <p>
                                Temp. Mínima:{" "}
                                {convertTemperature(weather.main.temp_min).toFixed(1)}
                                {temperatureUnit}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default WeatherScreen;