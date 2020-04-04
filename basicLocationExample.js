import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
import Axios from 'axios';
import BasicMap from './basicMap'
import { TouchableOpacity } from 'react-native-gesture-handler';


export default class BasicLocationExample extends Component {
  state = {
    location: {},
    places: [],
    errorMessage: null,
  };


  // startLocation = () => {
  //   Location.startLocationUpdatesAsync('differentTaskName',  {
  //     accuracy: Location.Accuracy.Highest,
  //     showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
  //     timeInterval: 2500,
  //     distanceInterval: 5,
  //     foregroundService:
  //     {
  //         notificationTitle:"yo buddy2",
  //         notificationBody :"Running gps for locations.",
  //         notificationColor :"#000000"
  //     }
  // }).catch(err => alert({which:"startLocationUpdatesAsync", error: err.message}))
  // TaskManager.defineTask('differentTaskName', ({ data: { locations }, error }) => {
  //     if (error) {
  //         console.error('err: ',error.message)
  //         Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), error:error.message})

  //       // check `error.message` for more details.
  //       return;
  //     }
  //     let constants = Constants; 
  //     Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), locations:locations, constants:constants})
  //     console.log('Received new locations', locations);
  //   }).catch(err => alert({which:"define task", error: err.message}))
  // }

  // componentDidMount() {
  //   Axios.get('https://ironrest.herokuapp.com/corona').then(res => {
  //       this.setState({places:res.data})
  //   })
  //   // await Location.startLocationUpdatesAsync('taskName',  {
  //   //     accuracy: Location.Accuracy.Highest,
  //   //     showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
  //   //     timeInterval: 2500,
  //   //     distanceInterval: 5,
  //   //     foregroundService:
  //   //     {
  //   //         notificationTitle:"yo buddy",
  //   //         notificationBody :"Running gps for locations.",
  //   //         notificationColor :"#000000"
  //   //     }
  //   // }).catch(err => alert('sherwino is the best'))
  //   TaskManager.defineTask('taskName', ({ data: { locations }, error }) => {
  //          console.error('err: ',error.message)
  //           Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), error:error.message})

  //         // check `error.message` for more details.
  //         return;
  //       }
  //       let deviceName = Constants.deviceName; 
  //       Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), locations:locations, deviceName:deviceName})
  //       console.log('Received new locations', locations);
  //     }).catch(err => alert('sherwino is the best'))
  //}

  constructor(props) {
    super(props);
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    // let { status } = await Permissions.askAsync(Permissions.LOCATION);
    let { status } = await Location.requestPermissionsAsync();
    alert('status', status)
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });

    } else {

      Location.startLocationUpdatesAsync('differentTaskName', {
        accuracy: Location.Accuracy.Highest,
        showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
        timeInterval: 2500,
        distanceInterval: 5,
        foregroundService:
        {
          notificationTitle: "yo buddy2",
          notificationBody: "Running gps for locations.",
          notificationColor: "#000000"
        }
      }).catch(err => alert({ which: "startLocationUpdatesAsync", error: err.message }))
      TaskManager.defineTask('differentTaskName', ({ data: { locations }, error }) => {
        if (error) {
          console.error('err: ', error.message)
          Axios.post('https://ironrest.herokuapp.com/corona/', { time: new Date(), error: error.message, deviceName:deviceName })

          // check `error.message` for more details.
          return;
        }
        let constants = Constants;
        let deviceName = Constants.deviceName
        Axios.post('https://ironrest.herokuapp.com/corona/', { time: new Date(), locations: locations, deviceName: deviceName })
        console.log('Received new locations', locations);
      }).catch(err => alert({ which: "define task", error: err.message }))
    }
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  }
  
  
  // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //   accuracy: Location.Accuracy.Balanced,
  // });

//};

//  };

render() {
  let text = 'Waiting..';
  if (this.state.errorMessage) {
    text = this.state.errorMessage;
  } else if (this.state.location) {
    text = JSON.stringify(this.state.location);
  }

  return (
    <View style={styles.container}>
      <BasicMap location={this.state.location} places={this.state.places} />
      <TouchableOpacity onPress={this.startLocation}><Text>startLocation!!!!</Text></TouchableOpacity>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});