import { useState, useEffect } from "react";
import axios from "./api/axios";

export default function App() {
  const [data, setData] = useState(() => {
    const storedWeather = localStorage.getItem("lastWeather");
    return storedWeather ? JSON.parse(storedWeather) : {};
  });

  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("weatherHistory");
    return stored ? JSON.parse(stored) : [];
  });

  const API_KEY = import.meta.env.VITE_WEATHER_KEY;

  const saveToHistory = (city) => {
    let updatedHistory = [...history];

    if (!updatedHistory.includes(city)) {
      updatedHistory.unshift(city);
    }

    if (updatedHistory.length > 5) {
      updatedHistory.pop();
    }

    setHistory(updatedHistory);
    localStorage.setItem("weatherHistory", JSON.stringify(updatedHistory));
  };

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case "Clear":
        return "☀️";
      case "Clouds":
        return "☁️";
      case "Rain":
        return "🌧️";
      case "Thunderstorm":
        return "⛈️";
      case "Snow":
        return "❄️";
      default:
        return "🌍";
    }
  };

  const fetchWeather = async (city, save = true) => {
    try {
      setError("");
      const response = await axios.get(
        `/weather?q=${city}&units=metric&appid=${API_KEY}`,
      );
      setData(response.data);
      localStorage.setItem("lastWeather", JSON.stringify(response.data));

      if (save) {
        saveToHistory(city);
      }
    } catch (err) {
      setError("Kota tidak ditemukan!");
    }
  };

  useEffect(() => {
    if (!data.name) {
    fetchWeather("Jakarta", false);
  }
  }, []);

  const searchLocation = (event) => {
    if (event.key === "Enter" && location.trim() !== "") {
      fetchWeather(location);
      setLocation("");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-black text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Weather App 🌤</h1>

      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        onKeyDown={searchLocation}
        placeholder="Masukkan nama kota..."
        className="mb-8 p-4 w-80 rounded-2xl bg-white/10 border border-white/20 outline-none"
      />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex flex-col md:flex-row gap-8">
        {data.name && (
          <div className="w-80 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-3xl p-8 text-center">
            <h2 className="text-2xl tracking-widest">
              {data.name}, {data.sys?.country}
            </h2>

            <div className="my-6">
              <h1 className="text-6xl font-bold">
                {data.main?.temp?.toFixed()}°C
              </h1>
            </div>

            <p className="text-xl flex justify-center gap-3 items-center text-blue-300">
              {data.weather && getWeatherIcon(data.weather[0].main)}
              {data.weather && data.weather[0].main}
            </p>

            <div className="flex justify-between mt-6 pt-6 border-t border-white/10 text-sm">
              <div>💧 {data.main?.humidity}%</div>
              <div>💨 {data.wind?.speed} m/s</div>
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t border-white/10 text-sm">
              <div>Sunrise 🌅: {data.sys && formatTime(data.sys.sunrise)}</div>
              <div>Sunset 🌇: {data.sys && formatTime(data.sys.sunset)}</div>
            </div>
          </div>
        )}

        <div className="w-60 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">History</h3>

          {history.length === 0 && (
            <p className="text-gray-400 text-sm">Belum ada pencarian</p>
          )}

          <ul className="space-y-2">
            {history.map((city, index) => (
              <li
                key={index}
                onClick={() => fetchWeather(city)}
                className="cursor-pointer hover:text-blue-400 transition"
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
