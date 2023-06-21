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

enum Weather {
  CLEAR = "clear",
  NOT_GOOD = "not good",
}

const Option = ({ innerProps, label, data }: any) => (
  <div className="p-1" {...innerProps}>
    <div className="flex items-center">
      <img src={data.image} alt={label} className="w-8 h-8" />
      <div className="mr-2" />
      {label}
    </div>
  </div>
);

function App() {
  const [weatherState, setWeatherState] = useState("Enter your city!");
  const [mealType, setMealType] = useState<MealType | undefined>(undefined);
  const [currentTemp, setCurrentTemp] = useState<Temperature | undefined>(
    undefined
  );
  const [weather, setWeather] = useState<Weather | undefined>(undefined);
  const [recipes, setRecipes] = useState<
    Array<{
      name: string;
      imageUrl: string;
      recipeUrl: string;
      sourceWebsite: string;
      calories: number;
      prepTime: number;
      servings: number;
    }>
  >();

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

      // console.log(
      //   "weatherCode",
      //   weatherCode,
      //   "time",
      //   time,
      //   "temperature",
      //   temperature
      // );

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

      setWeather(Weather.NOT_GOOD);
      if (weatherCode >= 0 && weatherCode <= 3) {
        weatherState = "☀ " + weatherState + "clear";
        setWeather(Weather.CLEAR);
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
        setCurrentTemp(Temperature.COLD);
      } else if (temperature >= 20 && temperature <= 25) {
        weatherState += "warm";
        setCurrentTemp(Temperature.WARM);
      } else if (temperature > 30) {
        weatherState += "hot";
        setCurrentTemp(Temperature.HOT);
      }

      weatherState += " ";

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

      function getRandom(strings: string[]) {
        return strings[Math.floor(Math.random() * strings.length)];
      }

      // determine the food
      let food = "";
      if (weather === Weather.CLEAR) {
        if (currentTemp === Temperature.COLD) {
          if (mealType === MealType.BREAKFAST) {
            food = getRandom(["oatmeal", "toast", "breakfast burrito"]);
          } else if (mealType === MealType.LUNCH) {
            food = getRandom(["soup", "sandwich", "chili"]);
          } else if (mealType === MealType.DINNER) {
            food = getRandom(["roast chicken", "stew", "baked salmon"]);
          }
        } else if (currentTemp === Temperature.WARM) {
          if (mealType === MealType.BREAKFAST) {
            food = getRandom(["smoothie", "fruit salad", "yogurt"]);
          } else if (mealType === MealType.LUNCH) {
            food = getRandom(["salad", "wraps", "cold pasta"]);
          } else if (mealType === MealType.DINNER) {
            food = getRandom(["grilled vegetables", "caprese salad", "sushi"]);
          }
        } else if (currentTemp === Temperature.HOT) {
          if (mealType === MealType.BREAKFAST) {
            food = getRandom([
              "smoothie bowl",
              "overnight oats",
              "avocado toast",
            ]);
          } else if (mealType === MealType.LUNCH) {
            food = getRandom(["cold noodles", "gazpacho", "summer rolls"]);
          } else if (mealType === MealType.DINNER) {
            food = getRandom(["barbecue", "ceviche", "watermelon salad"]);
          }
        }
      } else if (weather === Weather.NOT_GOOD) {
        if (currentTemp === Temperature.COLD) {
          if (mealType === MealType.BREAKFAST) {
            food = getRandom(["porridge", "pancakes", "scrambled eggs"]);
          } else if (mealType === MealType.LUNCH) {
            food = getRandom([
              "hot soup",
              "grilled cheese sandwich",
              "shepherd's pie",
            ]);
          } else if (mealType === MealType.DINNER) {
            food = getRandom(["beef stew", "lasagna", "chicken pot pie"]);
          }
        } else if (currentTemp === Temperature.WARM) {
          if (mealType === MealType.BREAKFAST) {
            food = getRandom(["smoothie", "fruit bowl", "muesli"]);
          } else if (mealType === MealType.LUNCH) {
            food = getRandom(["quinoa salad", "cold wraps", "greek salad"]);
          } else if (mealType === MealType.DINNER) {
            food = getRandom(["stir-fry", "pasta salad", "rice bowl"]);
          }
        }
      } else if (currentTemp === Temperature.HOT) {
        if (mealType === MealType.BREAKFAST) {
          food = getRandom(["smoothie", "fruit smoothie bowl", "chia pudding"]);
        } else if (mealType === MealType.LUNCH) {
          food = getRandom([
            "cold sandwiches",
            "salad bowl",
            "cold noodle salad",
          ]);
        } else if (mealType === MealType.DINNER) {
          food = getRandom([
            "grilled vegetables",
            "salmon salad",
            "cold soups",
          ]);
        }
      }

      // console.log(food);

      // get the recipes
      const recipesResponse = await fetch(
        `https://api.edamam.com/search?q=${food}&app_id=${process.env.REACT_APP_EDAMAM_APP_ID}&app_key=${process.env.REACT_APP_EDAMAM_APP_KEY}&random=true&to=3`
      );
      if (!recipesResponse.ok) {
        alert("GET api.edamam.com/search: failed to get recipes");
        return;
      }

      let recipesData:
        | {
            hits: Array<{
              recipe: {
                calories: number;
                image: string; // url
                label: string; // name
                url: string; // recipe url
                totalTime: number; // prep time in minutes
                source: string; // website the recipe was sourced from
                yield: number; // number of servings
              };
            }>;
          }
        | undefined = undefined;
      try {
        recipesData = await recipesResponse.json();
      } catch (error) {
        alert("GET api.edamam.com/search: didn't return valid json");
      }

      if (!recipesData) {
        alert("GET api.edamam.com/search: returned null value");
        return;
      }

      let recipeList: typeof recipes = [];
      for (const recipe of recipesData.hits) {
        recipeList.push({
          name: recipe.recipe.label,
          recipeUrl: recipe.recipe.url,
          imageUrl: recipe.recipe.image,
          sourceWebsite: recipe.recipe.source,
          prepTime: recipe.recipe.totalTime,
          calories: recipe.recipe.calories,
          servings: recipe.recipe.yield,
        });
      }

      setRecipes(recipeList);
      console.log(recipeList);
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
                className="w-96"
                components={{ Option }}
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
                      image: `https://open-meteo.com/images/country-flags/${location.country_code}.svg`,
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
        {recipes && recipes.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="mb-4" />

            <div className="text-h5">
              Here are some {mealType} recipes to lighten the day!
            </div>

            <div className="mb-4" />

            <div className="flex flex-col flex-wrap justify-center">
              {recipes.map((recipe, idx) => (
                <div key={idx}>
                  <div className="flex items-center rounded-md border-secondary border-2 px-6 py-4">
                    <img
                      className="rounded-md w-32 h-32"
                      src={recipe.imageUrl}
                      alt={recipe.name}
                    />

                    <div className="mr-4" />
                    <div className="flex flex-col">
                      <div className="text-h5 font-bold">{recipe.name}</div>
                      <div className="text-p">
                        {Math.floor(recipe.calories) + " "} kcal
                      </div>
                      <div className="text-p">Servings: {recipe.servings}</div>
                      <div className="text-p">
                        Prep time: {recipe.prepTime} minutes
                      </div>
                      <p className="text-p text-gray-500 italic">
                        Source: {recipe.sourceWebsite}
                      </p>

                      <div className="mb-2" />

                      <div className="text-p">
                        <a
                          className="text-blue-500"
                          href={recipe.recipeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
