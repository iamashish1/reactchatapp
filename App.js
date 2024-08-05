import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatListScreen from './ChatListScreen';
import LoadingScreen from './LoadingScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import UserListScreen from './UsersListScreen';
import ChatScreen from './ChatDetailScreen';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AppStack = createStackNavigator();
const ChatStack = createStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator
    >
      <ChatStack.Screen
        name="Chat List"
        component={ChatListScreen}
        options={{ title: 'Chats' }}

      />
    </ChatStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
 
    >
      <Tab.Screen name="Chats" component={ChatStackScreen} options={{ headerShown: false,
       tabBarIcon: () => <FontAwesome5 name="rocketchat" size={24} color="grey" /> }}
      />
      <Tab.Screen name="Available Users" component={UserListScreen}options={{ headerShown: true,
       tabBarIcon: () =><Entypo name="users" size={24} color="grey" />} } />
    </Tab.Navigator>
  );
}

function AppStackScreen() {
  return (
    <AppStack.Navigator
      options={{ headerShown: false }}

    >
      <AppStack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
      <AppStack.Screen
        name="Chat Detail"
        component={ChatScreen}
        options={{ title: 'Chat Detail' }}
      />
    </AppStack.Navigator>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStackScreen />
      ) : (
        <AuthStackScreen />
      )}
    </NavigationContainer>
  );
}

export default App;
