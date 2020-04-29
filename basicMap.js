import React from "react";
import MapView from "react-native-maps";
import { StyleSheet, Text, View, Dimensions } from "react-native";

export default class BasicMap extends React.Component {
  renderMarkers() {
    return this.props.places.map((place, i) => {
      if (place.locations) {
        return (
          <MapView.Marker
            key={i}
            title={place.name}
            coordinate={place.locations[0].coords}
          />
        );
      } else {
        return;
      }
    });
  }
  render() {
    // console.log('basic', this.props)
    const { coords } = this.props?.location;
    const latitude = coords?.latitude;
    const longitude = coords?.longitude;

    console.log({ coords, latitude, longitude });
    // https://github.com/react-native-community/react-native-maps/issues/693#issuecomment-262656417
    return this.props.location.coords ? (
      <View style={styles.container}>
        <MapView
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          // mapType={"satellite"}
          // provider={"google"}
          showsMyLocationButton
          showsUserLocation
          style={styles.mapStyle}
        >
          {this.renderMarkers()}
          <MapView.Marker title="me" coordinate={this.props.location.coords} />
        </MapView>
      </View>
    ) : (
      <Text>Loading...</Text>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
