import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import BasicLocationExample from './basicLocationExample'
import { TouchableOpacity } from 'react-native-gesture-handler';
import Axios from 'axios';
const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});

export default function App() {
  return (
    <View style={styles.container}>
      <BasicLocationExample />
      <TouchableOpacity onPress={() => Axios.post('https://ironrest.herokuapp.com/corona/', {time: new Date(), animal:'Penguin'})}><Text>Send Post to Mongo</Text></TouchableOpacity>
      <Text style={styles.welcome}>deviceName u</Text>
      <Text style={styles.instructions}>Penguin</Text>
      <Text style={styles.instructions}>{instructions}</Text>
      <TouchableOpacity onPress={() => Axios.post('https://ironrest.herokuapp.com/createCollection/corona', {})}><Text>Create createCollection</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
