// MUST be first import - required for React Navigation
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Ignore specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Remote debugger',
]);

// Register the app
registerRootComponent(App);


