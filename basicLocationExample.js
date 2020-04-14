import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

import Axios from "axios";
import BasicMap from "./basicMap";
import { TouchableOpacity } from "react-native-gesture-handler";

const DEVICE_NAME = Constants?.DEVICE_NAME;

export default class BasicLocationExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      places: null,
      errorMessage: null,
    };
  }

  componentDidMount() {
    Axios.get("https://ironrest.herokuapp.com/covid")
      .then((res) => {
        this.setState({ places: res.data });
      })
      .then((res) => {
        if (!this.state.location) {
          this._getLocationAsync();
        }
      });

    TaskManager.isTaskRegisteredAsync("startLocationUpdatesAsync").then(
      (isRegistered) => {
        console.log("task is registered", isRegistered);
      }
    );

    TaskManager.getRegisteredTasksAsync("startLocationUpdatesAsync").then(
      (registeredTasks) => {
        console.log("registeredTasks tasks", registeredTasks);
      }
    );

    TaskManager.getTaskOptionsAsync("startLocationUpdatesAsync").then(
      (taskOptions) => {
        console.log("registered taskOptions", taskOptions);
      }
    );
  }
  startLocation() {
    const location = this.state?.location;

    console.log("startLocation Button pressed");
    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      animal: "Panda and a Penguin",
      DEVICE_NAME,
      location,
    });
  }

  // Expo said they don't support background location updates
  // https://forums.expo.io/t/plist-configuration-options-are-not-recognised/23812/2
  _getLocationAsync = async () => {
    let statusTwo = await Permissions.askAsync(Permissions.LOCATION);
    let { status } = await Location.requestPermissionsAsync();
    console.log("getlocationasync1", { status, state: this.state, statusTwo });

    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    } else {
      let location = await Location.getCurrentPositionAsync({});
      console.log("getlocationasync2", { location });

      this.setState({ location });

      await Location.startLocationUpdatesAsync("startLocationUpdatesAsync", {
        accuracy: Location.Accuracy.Highest,
        showsBackgroundLocationIndicator: true, //iOS only
        timeInterval: 2500, // Android Only
        distanceInterval: 5,
        pausesUpdatesAutomatically: false, //iOS only
        foregroundService: {
          notificationTitle: "yo buddy3",
          notificationBody: "Running gps for locations.",
          notificationColor: "#000000",
        },
      }).catch((err) => {
        console.log("getlocationasync3 caught an error bitch", { err });
        this.setState({ errorMessage: err });
      });
      console.log("startLocationUpdatesAsync registered");
      // this.defineTask("startLocationUpdatesAsync");
    }
  };

  render() {
    const { location, errorMessage, places } = this.state;
    let text = "Waiting..";
    if (errorMessage) {
      text = errorMessage.message;
    } else if (location) {
      text = JSON.stringify(location);
    }

    console.log("render", { location, errorMessage, places, text });

    return (
      <View style={styles.container}>
        {location && places && <BasicMap location={location} places={places} />}
        <TouchableOpacity onPress={this.startLocation}>
          <Text>Post Location to Mongo (Manually)</Text>
        </TouchableOpacity>
        <Text style={styles.paragraph}>{text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center",
  },
});

function ourOwnCallback(...args) {
  console.log("ourOwnCallback", { ...args });
}

console.log("before the task is defined", TaskManager.defineTask);
TaskManager.defineTask("startLocationUpdatesAsync", ({ data, error }) => {
  if (error) {
    console.error("defineTask() err: ", error.message);
    this.setState({ errorMessage: error });

    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      error: error.message,
      deviceName: DEVICE_NAME,
    });

    return;
  }
  console.log("TaskManager.defineTask is returning these", { data, error });

  if (data) {
    const locations = data?.locations;
    console.log("got data in define task", {
      data,
      locations,
      deviceName: DEVICE_NAME,
    });
    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      locations,
      deviceName: DEVICE_NAME,
    })
      .then((res) => {
        console.log("axios response", { res, Constants });
        return;
      })
      .catch((err) => console.log("define task", { err }));
  }
});

// async function status() {
//   await BackgroundFetch.getStatusAsync();
// }

// async function getRegisteredTasksAsync() {
//   await TaskManager.getRegisteredTasksAsync();
// }

// async function registerTaskAsync() {
//   await BackgroundFetch.registerTaskAsync("backgroundWhatever");
// }

// async function setMinimumIntervalAsync() {
//   await BackgroundFetch.setMinimumIntervalAsync(2000);
// }

// switch (status()) {
//   case BackgroundFetch.Status.Restricted:
//   case BackgroundFetch.Status.Denied:
//     console.log("Background execution is disabled");

//   default: {
//     console.debug("Background execution allowed");

//     let tasks = getRegisteredTasksAsync();
//     if (
//       tasks &&
//       tasks.find((f) => f.taskName === "backgroundWhatever") == null
//     ) {
//       console.log("Registering task");
//       registerTaskAsync();

//       tasks = getRegisteredTasksAsync();
//       console.debug("Registered tasks", tasks);
//     } else {
//       console.log(`Task ${"backgroundWhatever"} already registered, skipping`);
//     }

//     console.log("Setting interval to", 2000);
//     setMinimumIntervalAsync(2000);
//   }
// }
// console.log("after the task is defined");
