import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

export default class BasicMap extends React.Component {



renderMarkers() {
    return this.props.places.map((place, i) => { 
        console.log('iguana', place.locations, '!')
        if(place.locations){
         return <MapView.Marker key={i} title={place.name} coordinate={place.locations[0].coords} />
        }else{
            return 
        }
    })
}
  render() {
    // console.log('basic', this.props)
    
    return (
        this.props.location.coords ?   

      <View style={styles.container}>
        <MapView 
            style={styles.mapStyle}
        >
        {this.renderMarkers()}
        <MapView.Marker title='me' coordinate={this.props.location.coords} />
        </MapView>
      </View>
      : <Text>Loading...</Text>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
