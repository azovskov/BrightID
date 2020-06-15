import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';
import { DEVICE_TYPE, DEVICE_IOS } from '@/utils/constants';
import { createFakeConnection } from '@/components/Connections/models/createFakeConnection';
import { navigate } from '@/NavigationService';
import backArrow from '@/static/back_arrow.svg';
import { SvgXml } from 'react-native-svg';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions = {
  // coment out for test release
  headerRight: __DEV__
    ? () => (
        <TouchableOpacity
          testID="createFakeConnectionBtn"
          style={{ marginRight: 11 }}
          onPress={createFakeConnection}
        >
          <Material name="dots-horizontal" size={32} color="#fff" />
        </TouchableOpacity>
      )
    : () => null,
  headerShown: DEVICE_TYPE === 'large',
  headerLeft: () => (
    <TouchableOpacity
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
        // marginTop: DEVICE_LARGE ? 15 : 10,
      }}
      onPress={() => {
        navigate('Home');
      }}
    >
      <SvgXml height="20" xml={backArrow} />
    </TouchableOpacity>
  ),
};

const Connections = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Connections"
      component={ConnectionsScreen}
      options={connectionsScreenOptions}
    />
    <Stack.Screen
      name="SortingConnections"
      component={SortingConnectionsScreen}
    />
  </Stack.Navigator>
);

export default Connections;
