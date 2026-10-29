import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { supabase } from './utils/supabase';

type HomeStackParamList = {
  Home: undefined;
  Details: undefined;
  MoreDetails: undefined;
};

type SettingsStackParamList = {
  Settings: undefined;
  About: undefined;
};

type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

type Todo = {
  id: string | number;
  name: string;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function HomeScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, 'Home'>) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      const { data, error } = await supabase.from('todos').select('id, name');

      if (error) {
        console.error('Error fetching todos:', error.message);
        return;
      }

      setTodos(data ?? []);
    };

    void getTodos().catch((error: unknown) => {
      console.error('Error fetching todos:', error);
    });
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ice Cream</Text>
      <Text style={styles.body}>This is the Ice Cream tab.</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
      <Text style={styles.todoTitle}>Todo List</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.todo}>{item.name}</Text>}
        ListEmptyComponent={<Text style={styles.body}>No todos found.</Text>}
      />
    </View>
  );
}

function DetailsScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, 'Details'>) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.body}>This screen is pushed onto the Home stack.</Text>
      <Button
        title="Go to More Details"
        onPress={() => navigation.navigate('MoreDetails')}
      />
    </View>
  );
}

function MoreDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>More Details</Text>
      <Text style={styles.body}>This screen is pushed onto the Home stack.</Text>
    </View>
  );
}

function SettingsScreen({
  navigation,
}: NativeStackScreenProps<SettingsStackParamList, 'Settings'>) {
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
      <Text style={styles.body}>
        This screen is pushed onto the Hot Coffee stack.
      </Text>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Details" component={DetailsScreen} />
      <HomeStack.Screen name="MoreDetails" component={MoreDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="About" component={AboutScreen} />
    </SettingsStack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
          <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} />
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
    padding: 16,
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
  todoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  todo: {
    fontSize: 16,
    marginBottom: 8,
  },
});