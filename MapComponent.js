import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
// import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";

import Axios from "axios";
import BasicMap from "./basicMap";
import { TouchableOpacity } from "react-native-gesture-handler";

var LAST = {};
const DEVICE_NAME = Constants?.deviceName;
const DEVICE_ID = Constants?.deviceId;

export function MapComponent() {
  const [currentLocation, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState(null);
  const [lastPlace, setLastPlace] = useState(LAST);
  const [status, setStatus] = useState("Waiting....");
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }
      const placesArr = await getSavedLocations();
      const location = await getCurrentLocation();
      setLocation(location);
      setPlaces(placesArr);
      startBackgroundLocationUpdates();
    })();
  }, [LAST]);

  // --------------------------------------------------------------
  // Detrmine if we are already getting location updates
  const haveStartedGettingUpdates = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync("viru");
    console.log("haveStartedGettingUpdates", started);
    return started;
  };

  // ----------------------------------------------------------------
  // Get current location
  const getCurrentLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location?.coords);
    console.log("getCurrentLocation", { currentLocation });
    return location;
  };

  // ----------------------------------------------------------------
  // Setup and start the background location updates
  const startBackgroundLocationUpdates = async () => {
    const startLocationSync = await Location.startLocationUpdatesAsync("viru", {
      accuracy: Location.Accuracy.Lowest,
      showsBackgroundLocationIndicator: true, //iOS only
      timeInterval: 2500, // Android Only
      distanceInterval: 1,
      pausesUpdatesAutomatically: true, //iOS only
      foregroundService: {
        notificationTitle: "ViruViru",
        notificationBody: "is using GPS for virus tracking.",
        notificationColor: "#000000",
      },
    }).catch((error) => {
      setErrorMsg(error);
    });
    console.log("startBackgroundLocationUpdates", { startLocationSync });

    setStatus("startLocationUpdatesAsync registered");
    return startLocationSync;
  };

  // ----------------------------------------------------------------
  // Get all of the location data we have stored on the database
  const getSavedLocations = async () => {
    const res = await Axios.get("https://ironrest.herokuapp.com/corona");
    setPlaces(res?.data);
    console.log("getSavedLocations");
    return res?.data;
  };

  // ----------------------------------------------------------------
  // Send something to mongo
  const sendObjToMongo = (obj) => {
    try {
      Axios.post("https://ironrest.herokuapp.com/covid/", { ...obj, tasks });

      // Set the status to show the user what is going on
      const statusString = `
        deviceName: ${DEVICE_NAME}
        time: ${new Date()}
        long: ${currentLocation?.coords?.longitude} 
        lat: ${currentLocation?.coords?.latitude}
        accuracy: ${currentLocation?.coords?.accuracy}
      `;
      setStatus(statusString);

      console.log("sendobjtomongo", { status, obj, tasks });

      return status;
    } catch (error) {
      console.error({
        error,
        message: "Penguin failed to send obj",
      });

      setErrorMsg(error);

      Axios.post("https://ironrest.herokuapp.com/covid/", {
        time: new Date(),
        error: errorMsg?.error,
        errorMessage: errorMsg?.message,
        deviceName: DEVICE_NAME,
        obj,
      });
    }
  };

  // ----------------------------------------------------------------
  // Let us know if we registered locations updates
  const updateTasks = async () => {
    const taskState = {};

    const isRegistered = await TaskManager.isTaskRegisteredAsync("viru");
    const registeredTasks = await TaskManager.getRegisteredTasksAsync("viru");
    const taskOptions = await TaskManager.getTaskOptionsAsync("viru");

    taskState.isRegistered = isRegistered;
    taskState.registeredTasks = registeredTasks;
    taskState.taskOptions = taskOptions;

    console.log("updateTasks", taskState);
    return taskState;
  };

  // ----------------------------------------------------------------

  const buttonObj = {
    time: new Date(),
    animal: "Penguin",
    updatedFrom: "button",
    deviceName: DEVICE_NAME,
    currentLocation,
  };

  const currentStatus = !errorMsg ? status : errorMsg?.message;
  const renderMap = currentLocation && places;
  console.log("render map", status);
  return (
    <View style={styles.container}>
      {renderMap && <BasicMap location={currentLocation} places={places} />}
      <TouchableOpacity onPress={() => sendObjToMongo(buttonObj)}>
        <Text style={styles.button}>Post Location to Mongo (Manually)</Text>
      </TouchableOpacity>
      <Text style={styles.paragraph}>{currentStatus}</Text>
      {lastPlace && (
        <Text style={styles.LAST}>{JSON.stringify(lastPlace)}</Text>
      )}
    </View>
  );
}

// ----------------------------------------------------------------
// Expo specifically asks to have the TaskManager defined outside of
// the component scope, because it is running outside of the app's lifecycle
TaskManager.defineTask("viru", ({ data, error }) => {
  console.log("defineTask");
  if (error) {
    Location.stopLocationUpdatesAsync("viru");

    console.error({
      error,
      message: "Penguin had an error definingTask",
    });

    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      data,
      error,
      errorMessage: "Penguin had an error definingTask",
      deviceName: DEVICE_NAME,
    });

    return;
  }

  if (data) {
    console.log("defineTask has data", { data, MapComponent });

    const locations = data?.locations;
    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      locations,
      updatedFrom: "background",
      deviceName: DEVICE_NAME,
      deviceId: 1337, // It should be DEVICE_ID, but waiting til we have a secure endpoint
    })
      .then((res) => {
        // Context Provider instead of using this global var
        LAST = {
          locations,
          deviceName: DEVICE_NAME,
          deviceId: 1337, // It should be DEVICE_ID, but
          res: res?.data,
          insertedCount: res?.data?.insertedCount,
          insertedId: res?.data?.insertedId,
        };
        return console.log({ LAST });
      })

      .catch((error) => {
        console.error("define task error", { error });
        Axios.post("https://ironrest.herokuapp.com/covid/", {
          time: new Date(),
          data,
          error,
          errorMessage: "Penguin had an error getting location data Line:125",
          deviceName: DEVICE_NAME,
        });
      });
  }
});

// ----------------------------------------------------------------
// Styles too should be implmented outside of the scope of this component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
  },
  button: {
    backgroundColor: "#000",
    color: "#fff",
    fontSize: 18,
    borderRadius: 5,
  },
  LAST: {
    fontSize: 8,
    color: "black",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center",
  },
});
