import { Form, FormikProvider, useFormik } from "formik";
import { useState } from "react";
import AsyncSelect from "react-select/async";
import "./App.css";
import { Layout } from "./components/Layout";

enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
}

enum Temperature {
  COLD = "cold",
  WARM = "warm",
  HOT = "hot",
}

function App() {
  const [weatherState, setWeatherState] = useState("Enter your city!");
  const [mealType, setMealType] = useState<MealType | undefined>(undefined);
  const [temperature, setTemperature] = useState<Temperature | undefined>(
    undefined
  );

  const formik = useFormik({
    initialValues: {
      city: "",
      latitude: -1,
      longitude: -1,
    },

    onSubmit: async (values) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${values.latitude}&longitude=${values.longitude}&current_weather=true`
      );

      if (!response.ok) {
        alert(
          "GET api.open-meteo.com/v1/forecast: failed to fetch weather data"
        );
        return;
      }

      let weatherData:
        | {
            current_weather: {
              temperature: number;
              is_day: number; // 1 = true
              weathercode: number; // WMO weather code
              time: string; // ISO 8601
            };
          }
        | undefined = undefined;
      try {
        weatherData = await response.json();
      } catch (error) {
        alert("GET api.open-meteo.com/v1/forecast: didn't return valid json");
        return;
      }

      if (!weatherData) {
        alert("GET api.open-meteo.com/v1/forecast: didn't return anything");
        return;
      }

      // change the weather state depending on the weather code
      const weatherCode = weatherData.current_weather.weathercode;
      const time = weatherData.current_weather.time;
      const temperature = weatherData.current_weather.temperature;

      console.log(
        "weatherCode",
        weatherCode,
        "time",
        time,
        "temperature",
        temperature
      );

      let weatherState = "It's a ";

      /*
        https://open-meteo.com/en/docs
        0 = clear
        1, 2, 3 = mainly clear
        45, 48 = fog
        51, 53, 55 = drizzle
        56, 57 = freezing drizzle
        61, 63, 65 = rain
        66, 67 = freezing rain
        71, 73, 75 = snow fall
        77 = snow
        80, 81, 82 = rain showers
        85, 86 = snow showers
        96 = thunderstorm
      */

      if (weatherCode >= 0 && weatherCode <= 3) {
        weatherState = "☀ " + weatherState + "clear";
      } else if (weatherCode === 45 || weatherCode === 48) {
        weatherState = "🌫 " + weatherState + "foggy";
      } else if (
        (weatherCode >= 51 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82)
      ) {
        weatherState = "🌧 " + weatherState + "rainy";
      } else if (
        (weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode === 85 ||
        weatherCode === 86
      ) {
        weatherState = "❄ " + weatherState + "snowy";
      } else if (weatherCode === 96) {
        weatherState = "⛈ " + weatherState + "stormy";
      }

      weatherState += " ";

      /*
        <20 = cold
        20-25 = warm
        >30 = hot
      */
      if (temperature < 20) {
        weatherState += "cold";
        setTemperature(Temperature.COLD);
      } else if (temperature >= 20 && temperature <= 25) {
        weatherState += "warm";
        setTemperature(Temperature.WARM);
      } else if (temperature > 30) {
        weatherState += "hot";
        setTemperature(Temperature.HOT);
      }

      weatherState += " ";

      // morning, afternoon, or night
      const date = new Date(time);
      const hour = date.getHours();
      if (hour >= 6 && hour < 12) {
        weatherState += "morning";
        setMealType(MealType.BREAKFAST);
      } else if (hour >= 12 && hour < 18) {
        weatherState += "afternoon";
        setMealType(MealType.LUNCH);
      } else if ((hour >= 18 && hour < 24) || (hour >= 0 && hour < 6)) {
        weatherState += "evening";
        setMealType(MealType.DINNER);
      }

      weatherState += " in " + values.city;

      setWeatherState(weatherState);
    },
  });

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="text-h3 font-bold">{weatherState}</div>
        <div className="mb-4" />
        <FormikProvider value={formik}>
          <Form>
            <div className="flex">
              <AsyncSelect
                name="city"
                placeholder="City"
                className="w-64"
                loadOptions={(inputValue) =>
                  new Promise<
                    Array<{
                      value: {
                        latitude: number;
                        longitude: number;
                      };
                      label: string;
                    }>
                  >(async (resolve) => {
                    const citiesResponse = await fetch(
                      `https://geocoding-api.open-meteo.com/v1/search?name=${inputValue}`
                    );

                    if (!citiesResponse.ok) {
                      alert("Failed to fetch cities");
                      resolve([]);
                      return;
                    }

                    let cities:
                      | {
                          generationtime_ms: number;
                          results?: Array<{
                            name: string; // San Francisco
                            admin1?: string; // California
                            admin2?: string; // not sure what this is? I think it's for countries that don't have states or smthn
                            country_code: string; // US
                            latitude: number;
                            longitude: number;
                            timezone: string; // America/Los_Angeles
                          }>;
                        }
                      | undefined = undefined;
                    try {
                      cities = await citiesResponse.json();
                    } catch (error) {
                      alert(
                        "GET geocoding-api.open-meteo.com/v1/search: didn't return valid json"
                      );
                      resolve([]);
                      return;
                    }

                    if (!cities || !cities.results) {
                      resolve([]);
                      return;
                    }

                    const options = cities.results.map((location) => ({
                      value: {
                        city: location.name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                      },
                      label: `${location.name}, ${
                        location.admin1 ? location.admin1 : location.admin2
                      }`,
                    }));

                    resolve(options);
                  })
                }
                // weird that webpack thinks `selected` is type {}
                onChange={(selected: any) => {
                  formik.setFieldValue("latitude", selected.value.latitude);
                  formik.setFieldValue("longitude", selected.value.longitude);
                  formik.setFieldValue("city", selected.value.city);
                  formik.submitForm();
                }}
              />
            </div>
          </Form>
        </FormikProvider>
        {mealType && (
          <div className="flex flex-col">
            <div className="">What are you eating for {mealType}?</div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
