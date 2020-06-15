// @flow

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BarcodeMask from 'react-native-barcode-mask';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  DEVICE_LARGE,
  PROFILE_POLL_INTERVAL,
  QR_TYPE_RESPONDER,
  ORANGE,
} from '@/utils/constants';
import { parseQrData } from '@/utils/qrCodes';
import { RNCamera } from './RNCameraProvider';
import emitter from '../../emitter';
import { clearMyQrData, setConnectQrData } from '../../actions';
import { fetchProfile } from './actions/profile';

/**
 * Returns whether the string is a valid QR identifier
 * @param {*} qrString
 */
function validQrString(qrString) {
  return qrString.length >= 42;
}

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
 *
 */

let fetchProfileId: IntervalID;

export const ScanCodeScreen = (props) => {
  let textInput: null | TextInput;

  let camera: null | RNCamera;
  let connectionExpired: TimeoutID;

  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [value, setValue] = useState('');
  const name = useSelector((state) => state.user.name);

  useEffect(() => {
    dispatch(clearMyQrData());
    emitter.on('connectDataReady', navigateToPreview);
    emitter.on('connectFailure', handleDownloadFailure);
    emitter.on('recievedProfileData', unsubscribeToProfileUpload);
    return () => {
      console.log('HERE, HERE, HERE');
      unsubscribeToProfileUpload();
      emitter.off('connectDataReady', navigateToPreview);
      emitter.off('connectFailure', handleDownloadFailure);
      emitter.off('recievedProfileData', unsubscribeToProfileUpload);
    };
  }, []);

  const subscribeToProfileUpload = (peerQrData) => {
    console.log(`Subscribing to profile Upload for uuid ${peerQrData.uuid}`);

    connectionExpired = setTimeout(showProfileError, 90000);
    fetchProfileId = setInterval(() => {
      dispatch(fetchProfile(peerQrData));
    }, PROFILE_POLL_INTERVAL);
  };

  const unsubscribeToProfileUpload = () => {
    console.log(`Unsubsubscribing from profile Upload`);
    clearTimeout(connectionExpired);
    clearInterval(fetchProfileId);
  };

  const handleDownloadFailure = () => {
    setConnectionAttempts(connectionAttempts + 1);
    if (connectionAttempts > 1) {
      navigateToHome();
    } else {
      subscribeToProfileUpload();
    }
  };

  const handleBarCodeRead = ({ data }) => {
    console.log('barcode data', data);
    if (!data) return;

    if (data.startsWith('Recovery_')) {
      props.navigation.navigate('RecoveringConnection', {
        recoveryRequestCode: data,
      });
    } else if (data.startsWith('brightid://')) {
      Linking.openURL(data);
    } else if (validQrString(data)) {
      const peerQrData = parseQrData(data);
      peerQrData.type = QR_TYPE_RESPONDER;
      dispatch(setConnectQrData(peerQrData));
      // If the following `fetchdata()` fails, a "connectFailure" will be emitted,
      subscribeToProfileUpload(peerQrData);

      if (textInput) textInput.blur();
    }
    setScanned(true);
  };

  const navigateToPreview = () => {
    props.navigation.navigate('PreviewConnection');
  };

  const showProfileError = () => {
    Alert.alert(
      'Timeout reached',
      "There was a problem downloading the other person's profile. Please try again.",
    );
    setScanned(true);
  };

  const navigateToHome = () => {
    props.navigation.navigate('Home');
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>
            Hey {name}, share your code and
          </Text>
          <Text style={styles.infoTopText}>make a new connection today</Text>
        </View>
        <View style={styles.cameraContainer}>
          {!scanned ? (
            <View style={styles.cameraPreview} testID="scanCode">
              <RNCamera
                ref={(ref) => {
                  camera = ref;
                }}
                style={styles.cameraPreview}
                captureAudio={false}
                onBarCodeRead={handleBarCodeRead}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.off}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                useNativeZoom={true}
                // containerStyle
              >
                <BarcodeMask
                  edgeColor={ORANGE}
                  animatedLineColor={ORANGE}
                  // outerMaskOpacity={0}
                  width={230}
                  height={230}
                  edgeRadius={5}
                  edgeBorderWidth={3}
                  edgeHeight={30}
                  edgeWidth={30}
                />
              </RNCamera>
            </View>
          ) : (
            <View style={styles.cameraPreview}>
              <Spinner isVisible={true} size={41} type="Wave" color="#4990e2" />
            </View>
          )}
        </View>
        <Text style={styles.infoBottomText}>Or you can also...</Text>
        <TouchableOpacity
          style={styles.myCodeButton}
          onPress={() => {
            props.navigation.navigate('MyCode');
          }}
        >
          <Material
            name="qrcode"
            color="#fff"
            size={16}
            style={styles.cameraIcon}
          />
          <Text style={styles.myCodeText}> Show your QR code</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    zIndex: 10,
    marginTop: -58,
  },
  cameraContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cameraPreview: {
    // alignItems: 'center',
    // justifyContent: 'center',
    width: 280,
    height: 280,
    // borderRadius: 10,
    // borderWidth: 4,
    // borderColor: '#000',
  },
  scanTextContainer: {
    height: 85,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  searchField: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    width: '85%',
    textAlign: 'center',
  },
  infoTopContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 56,
    // flexGrow: 1,
  },
  infoTopText: {
    // fontFamily: 'ApexNew-Book',
    fontSize: 16,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  infoBottomText: {
    fontSize: 12,
    marginBottom: 10,
  },
  myCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: 220,
    marginBottom: 36,
  },
  myCodeText: {
    fontSize: 14,
    color: '#fff',
  },
  cameraIcon: {
    marginTop: 2,
    marginRight: 4,
  },
});

// const mapStateToProps = (state) => {
//   const props = {
//     peerQrData: state.connectQrData.peerQrData,
//   };
//   return props;
// };

export default ScanCodeScreen;
