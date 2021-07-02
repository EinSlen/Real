import React, { Component } from 'react';

import { View, Text, Platform } from 'react-native'

import * as firebase from 'firebase'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './redux/reducers'
import thunk from 'redux-thunk'
const store = createStore(rootReducer, applyMiddleware(thunk))

const firebaseConfig = {
  apiKey: "AIzaSyBg67fTOeGJWvPBub9g7OYXrN4COIiZmyI",
  authDomain: "lgbtapp-34045.firebaseapp.com",
  projectId: "lgbtapp-34045",
  storageBucket: "lgbtapp-34045.appspot.com",
  messagingSenderId: "74881801169",
  appId: "1:74881801169:web:31b25448bb0781a6941ef0",
  measurementId: "G-MX35EGF456"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from './components/auth/Landing'
import RegisterScreen from './components/auth/Register'
import LoginScreen from './components/auth/Login'
import MainScreen from './components/Main'
import AddScreen from './components/main/Add'
import SaveScreen from './components/main/Save'
import CommentScreen from './components/main/Comment'
import SettingScreen from './components/main/Setting'


const Stack = createStackNavigator();


export class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
    }
    console.disableYellowBox = true; 
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }
  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text>Loading</Text>
        </View>
      )
    }

    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    if(Platform.OS === "web") {
      return (
        <Provider store={store}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Save" component={SaveScreen} navigation={this.props.navigation}/>
              <Stack.Screen name="Comment" component={CommentScreen} navigation={this.props.navigation}/>
              <Stack.Screen name="Setting" component={SettingScreen} navigation={this.props.navigation}/>
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      )
    }

    return (
      <Provider store={store}>
        <NavigationContainer >
          <Stack.Navigator initialRouteName="Main" screenOptions={{
              headerShown: false
            }}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Add" component={AddScreen} navigation={this.props.navigation}/>
            <Stack.Screen name="Save" component={SaveScreen} navigation={this.props.navigation}/>
            <Stack.Screen name="Comment" component={CommentScreen} navigation={this.props.navigation}/>
            <Stack.Screen name="Setting" component={SettingScreen} navigation={this.props.navigation}/>
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }
}

export default App
