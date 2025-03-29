import { WeatherData, ApiError } from "@/interfaces/weather";

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = process.env.API_KEY;

export const fetchWeatherbyCity = async (city: string): Promise<WeatherData> => {
    try{
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        console.log(data)
        return data;
    }
    catch(error){
        console.log(error);
        throw new Error("Failed to fetch weather data");
    }
}

