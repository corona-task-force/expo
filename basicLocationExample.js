import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";
import Axios from "axios";
import BasicMap from "./basicMap";
import { TouchableOpacity } from "react-native-gesture-handler";

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
  }
  startLocation(location) {
    console.log("startLocation Button pressed");
    Axios.post("https://ironrest.herokuapp.com/covid/", {
      time: new Date(),
      animal: "Panda and a Penguin",
      deviceName,
      location: this.state.location,
    });
  }

  defineTask(taskName) {
    TaskManager.defineTask(taskName, ({ data: { locations }, error }) => {
      if (error) {
        console.error("defineTask() err: ", error.message);
        this.setState({ errorMessage: error });

        Axios.post("https://ironrest.herokuapp.com/covid/", {
          time: new Date(),
          error: error.message,
          deviceName: deviceName,
        });

        return;
      }

      // let constants = Constants;
      let deviceName = Constants.deviceName;
      Axios.post("https://ironrest.herokuapp.com/covid/", {
        time: new Date(),
        locations: locations,
        deviceName: deviceName,
      });
      console.log("Received new locations", { locations });
    })
      .then((res) => {
        console.log("axios response", { res, Constants });
        return;
      })
      .catch((err) => console.log("define task", { err }));
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
        pausesUpdatesAutomatically: true, //iOS only
        foregroundService: {
          notificationTitle: "yo buddy3",
          notificationBody: "Running gps for locations.",
          notificationColor: "#000000",
        },
      })
        .then((result) => {
          console.log("startLocationUpdatesAsync registered", { result });
          this.defineTask("startLocationUpdatesAsync");

          return;
        })
        .catch((err) => {
          console.log("getlocationasync3", { err });
          this.setState({ errorMessage: err });
        });
    }
  };

  // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //   accuracy: Location.Accuracy.Balanced,
  // });

  //};

  //  };

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
