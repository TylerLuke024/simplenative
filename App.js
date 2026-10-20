import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ice Cream</Text>
      <Text style={styles.body}>This is the Ice Cream tab.</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.body}>This screen is pushed onto the Ice Cream stack.</Text>
    </View>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Hot Coffee</Text>
      <Text style={styles.body}>This is the Hot Coffee tab.</Text>
      <Button
        title="Go to About"
        onPress={() => navigation.navigate('About')}
      />
    </View>
  );
}

function AboutScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>This screen is pushed onto the Hot Coffee stack.</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Ice Cream" component={HomeStack} />
          <Tab.Screen name="Hot Coffee" component={SettingsStack} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    marginBottom: 16,
  },
});
