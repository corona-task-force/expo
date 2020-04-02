import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
import Axios from 'axios';
import BasicMap from './basicMap'


export default class BasicLocationExample extends Component {
  state = {
    location: {},
    places: [],
    errorMessage: null,
  };

  componentDidMount() {
    Axios.get('https://ironrest.herokuapp.com/corona').then(res => {
        this.setState({places:res.data})
    })
    Location.startLocationUpdatesAsync('taskName',  {
        accuracy: Location.Accuracy.Highest,
        foregroundService:
        {
            notificationTitle:"Mapvis",
            notificationBody :"Running gps for locations.",
            notificationColor :"#000000"
        }
    })
    TaskManager.defineTask('taskName', ({ data: { locations }, error }) => {
        if (error) {
            console.error('err: ',error.message)
            Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), error:error.message})

          // check `error.message` for more details.
          return;
        }

        Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), locations:locations})
        console.log('Received new locations', locations);
      });
  }

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
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

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