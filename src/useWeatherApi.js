import { useState, useEffect, useCallback } from "react";

const fetchForecastWeather = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-C5DA3586-C554-4983-B9AB-87A83E5F3099&locationName=${cityName}&elementName=Wx,PoP,CI&sort=time`
  )
    .then((response) => response.json())
    .then((data) => {
      //console.log("fetchForecastWeather", data);
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, el) => {
          neededElements[el.elementName] = el.time[0].parameter;
          return neededElements;
        },
        {}
      );
      return {
        locationName: locationData.locationName,
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    });
};

const fetchCurrentWeather = () => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-C5DA3586-C554-4983-B9AB-87A83E5F3099&locationName=%E6%96%B0%E5%B1%8B"
  )
    .then((response) => response.json())
    .then((data) => {
      //console.log("fetchCurrentWeather", data);
      let Obj = {
        observationTime: new Date(),
        temperature: 0,
        windSpeed: 0,
        humid: 0
      };

      const locationData = data.records.location[0];
      if (Object.keys(data.records.location).length > 0) {
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, el) => {
            if (["WDSD", "TEMP", "HUMD"].includes(el.elementName)) {
              neededElements[el.elementName] = el.elementValue;
            }
            return neededElements;
          },
          {}
        );

        Obj = {
          observationTime: locationData.time.obsTime,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD
        };
      }
      return Obj;
    });
};

const useWeatherApi = (currentLocation) => {
  const { locationName, cityName } = currentLocation;
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    description: "",
    weatherCode: 0,
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true
  });
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      // 使用asmyc, Promise.all 搭配 await 等待兩個 API 都取得回應後才繼續
      const [currentWeather, forecastWeather] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchForecastWeather(cityName)
      ]);
      // currentWeather有時候會沒有資料, 為了避免顯示錯誤, 若溫度是0, 就撈上次的資料
      setWeatherElement((preState) => {
        const obj =
          currentWeather.temperature > 0
            ? {
                ...currentWeather,
                ...forecastWeather,
                isLoading: false
              }
            : { ...preState, ...forecastWeather };
        return obj;
      });
      console.log("fetch data", currentWeather, forecastWeather);
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true
    }));
    fetchingData();
  }, [locationName, cityName]);
  //↑將 locationName 和 cityName 帶入 useCallback 的 dependencies 中
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherApi;
