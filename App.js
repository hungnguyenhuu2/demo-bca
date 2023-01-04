/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Node, useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Platform,
  TouchableOpacity,
  NativeModules,
  EmitterSubscription
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import NfcManager, { NfcTech, NfcEvents } from 'react-native-nfc-manager'
import useCustomToggle from './useCustomToggle'
import Images from './Images'

import NfcPromptAndroid from './NfcPromptAndroid'
import useLatest from 'react-use/lib/useLatest'

import RNBcaSdk, { UNKNOWN_ERROR } from 'react-native-bca-sdk'
/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */


const MESSAGES = {
  READY: 'Giữ thiết bị của bạn\ngần CCCD có hỗ trợ NFC',
  SUCCESS: 'Đọc thẻ căn CCCD thành công',
  ERROR: 'Không đọc được thẻ CCCD. Vui lòng thử lại.',
}
const Section = ({ children, title }): Node => {

  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [visible, _, show, hide] = useCustomToggle(true)
  const [retryVisible, setRetryVisible] = useState(false)
  const [message, setMessage] = useState < string | undefined > (MESSAGES.READY)
  const [reading, setReading] = useState(false)
  const [source, setSource] = useState(Images.nfcImg)
  const [errorCode, setErrorCode] = useState < any | undefined > (undefined)
  const latestErrorCode = useLatest(errorCode)
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const readingRef = useRef(false)

  const infoRef = useRef(false)
  const sodRef = useRef(false)
  const [hasNfc, setHasNFC] = useState(null);


  useEffect(() => {
    // const checkIsSupported = async () => {
    //   const deviceIsSupported = await NfcManager.isSupported()

    //   setHasNFC(deviceIsSupported)
    //   if (deviceIsSupported) {
    //     await NfcManager.start()
    //   }
    // }

    // checkIsSupported()
  }, [])

  useEffect(() => {
    // fetchData()
  }, [])

  const fetchData = async () => {
    await NativeModules?.RNBcaSdk?.init('001094023646')//[tag])
  }

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
      console.log('tag found')
    })

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    }
  }, [])


  const onCancel = useCallback(() => {
    setRetryVisible(true)
    setMessage(undefined)
    hide()
    setTimeout(() => {
      NfcManager.cancelTechnologyRequest().catch(() => 0)
    }, 0)
  }, [])



  // const onFailed = useCallback(({ errCode, errMessage }) => {
  //   NfcManager.cancelTechnologyRequest()
  // }, [])

  const onFailed = useCallback(({ errCode, errMessage }) => {
    // EidSDK.stopReadInfoIOS()
    infoRef.current = undefined
    sodRef.current = undefined
    if (latestErrorCode.current !== 8) {
      setMessage(
        // errMessage && !errMessage.startsWith(UNKNOWN_ERROR)
        //   ? errMessage
        //   :
        errCode
          ? MESSAGES.ERROR + `(${errCode})`
          : MESSAGES.ERROR,
      )
      setErrorCode(errCode)
    }
    setReading(false)
    setSource(Images.errorCircle)
    setRetryVisible(true)
    setTimeout(() => {
      hide()
    }, 1000)
    NfcManager.cancelTechnologyRequest()
  }, [])


  const readTag = useCallback(async () => {
    // if (readingRef.current) {
    //   return
    // }
    // await NfcManager.registerTagEvent();
    readingRef.current = true
    console.log('readTag')
    // setRetryVisible(false)
    setMessage(MESSAGES.READY)
    // setErrorCode(undefined)
    setSource(Images.nfcImg)
    // if (Platform.OS === 'ios') {
    //   try {
    //     // const result = await EidSDK.readInfo(
    //     //   Platform.OS === 'ios' && !image.startsWith('data:') ? 'data:image/png;base64,' + image : image,
    //     // )
    //     NativeModules?.RNBcaSdk?.readCard(
    //       {
    //         idNumber: '094023646',
    //         dob: '940814', // YYMMDD
    //         doe: '340814', // YYMMDD
    //       })
    //     console.log('readTag result ios:', result)
    //   } catch (error) {
    //   } finally {
    //     readingRef.current = false
    //   }
    // } else {
    try {
      show()


      // const tag = await NfcManager.requestTechnology(NfcTech.IsoDep, {
      //   alertMessage: 'Ready to do some custom Mifare cmd!'
      // });//([NfcTech.IsoDep])
      const tag = await NfcManager.requestTechnology([NfcTech.IsoDep])
      console.log('tag>>>>>>', tag)
      if (tag) {
        setReading(true)
        const tag1 = await NfcManager.getTag();
        console.log('tag1>>>>>', tag1)
        NativeModules?.RNBcaSdk?.readCard(
          '001094023646'
          , [tag1])//[tag])

      } else {
        console.log('No tag found, what to do next')
        onFailed({ errMessage: 'Không tìm thấy thông tin phù hợp' })
      }
    } catch (ex) {
      console.log('readTag error11111S:', ex)
      onFailed({ errMessage: ex.message || ex.Message })
    } finally {
      readingRef.current = false
    }
    // }
  }, [])

  const init = useCallback(async () => {
    // const isSupported = await NfcManager.isSupported(Platform.OS === 'android' ? undefined : NfcTech.IsoDep)
    // const isEnabled = await NfcManager.isEnabled()
    // console.log('nfc supported:', isSupported, isEnabled)
    // setSupported(isSupported)
    // setEnabled(isEnabled)
    // if (isSupported && isEnabled) {
    //   EidSDK.init(endpoint, getDeviceInfoCallback, getActiveResultCallback)
    // }
    RNBcaSdk.init('endpoint')
  }, [])

  useEffect(() => {
    // if (Platform.OS === 'ios') {
    //   if (majorVersionIOS < 13) {
    //     return
    //   }
    // }
    init()
  }, [])



  const retry = useCallback(async () => {
    console.log('23423534534')
    await readTagV2()
  }, [readTag])

  useEffect(() => {
    const eventEmitter = RNBcaSdk?.getEventEmitter()

    console.log('eventEmitter', eventEmitter)
    const listeners = []
    if (eventEmitter) {
      listeners.push(
        eventEmitter.addListener('EventReadCardSuccess', (event) => {
          infoRef.current = event
          console.log('EventReadCardSuccess', event)
          if (event !== undefined) {

            var EventReadCardSuccess = JSON.parse(event?.rawData);
            console.log('EventReadCardSuccess222222', EventReadCardSuccess)
          }
        }),
      )
      listeners.push(
        eventEmitter.addListener('EventReadCardErrorCallback', (event) => {
          infoRef.current = event

          // var EventReadCardSuccess = JSON.parse(event);
          // console.log('EventReadCardSuccess>>>>>>>>', EventReadCardSuccess)
          // if (typeof sodRef.current !== 'undefined') {
          //   onSuccess(event, sodRef.current)
          // }
        }),
      )
      // listeners.push(
      //   eventEmitter.addListener(EVENTS.EventReadCardSod, (event: { sod: number }) => {
      //     sodRef.current = event.sod
      //     console.log(EVENTS.EventReadCardSod, event)
      //     if (infoRef.current) {
      //       onSuccess(infoRef.current, event.sod)
      //     }
      //   }),
      // )
      // listeners.push(
      //   eventEmitter.addListener(EVENTS.EventReadCardError, (event: { error: number }) => {
      //     console.log(EVENTS.EventReadCardError, event, getErrorMessage(event.error))
      //     onFailed({
      //       errCode: typeof event.error === 'number' ? event.error : undefined,
      //       errMessage: getErrorMessage(event.error),
      //     })
      //   }),
      // )
    }
    readTagV2()
    return () => {
      listeners.forEach((i) => i.remove())
    }
  }, [])


  // 001094023646
  const readTagV2 = async () => {
    const abc = await RNBcaSdk?.readCardFIS('eyJ4NXQiOiJPR1ZqTVRNME0yTTFOVFZqTkRNME5EWm1OV0ZsTURSbE1qVTFOVEl4T1dZME1HRTJNMlU1WWciLCJraWQiOiJOekZtTmpFek5XSTNNelE0WWpGaU9HSTVZall5TTJGaVptTXlPREEyTVdaaE5UaG1aakF4TldJNE5ERTJZakl3TnpjMllqWmlZakpsTVRkaU16VTVaUV9SUzI1NiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ2aWJfcG9jIiwiYXV0IjoiQVBQTElDQVRJT05fVVNFUiIsImF1ZCI6IndiSFM1WE5vN1dQOWFBbG1fX1N1emNUOFIxRWEiLCJuYmYiOjE2NzI3MzA5MzYsImF6cCI6IndiSFM1WE5vN1dQOWFBbG1fX1N1emNUOFIxRWEiLCJzY29wZSI6ImNoZWNrX25mY19iY2EgY29udGVudF9tYXRjaGluZ19vY3JfbmZjIGRvY19uZmMgaGFzaF9jaGVja19uZmMgb3BlbmlkIHNlc3Npb25fMjMwMTAzMDcyODU2IiwiaXNzIjoiaHR0cHM6XC9cL2lkY2hlY2suZWlkLnhwbGF0Lm9ubGluZTo0NDNcL29hdXRoMlwvdG9rZW4iLCJncm91cHMiOlsidXNlci1jaGVjay1uZmMtYmNhIiwidXNlci1uZmMiLCJJbnRlcm5hbFwvZXZlcnlvbmUiLCJ1c2VyLWhhc2gtY2hlY2stbmZjIl0sImV4cCI6MTY3Mjc0ODkzNiwiaWF0IjoxNjcyNzMwOTM2LCJqdGkiOiI0ZTM5NGUyMi05YjFkLTQ5MWEtYTQ3OS1lM2ZiYWY2MzEzMzIifQ.DzYbjjyOCrCg3ij7ZPOMVASGsxepe-Hdo8nGz6kcTbypmh5XVMWN94QRki2ITxDvFr9hnXuT8AR7B-bCC4VV_YbDIorW5zA1n5E_DepTftkj0cABxkolrgGHKBH_tTFx4Z5dysiKWUFbV2CL5Iz_amdUu_dPNHv0UP-_s-U-lH-V9D99anP7ExX5TQlAE1kDESLSoe2ebhx_gONR5Elc8Zf8bqIYahiHs-smI-osbN3C0bjYNlM34wfgHnxYs4u8rfIjCHuJdmLEKu-XoL-5Twm2g4BljuEL2pIU68elRVFU3IfD5ykMSbZ8v6fkcJUTvW_P77_36hr-2KUmDyZI_w', '001094023646')//[tag])
    // console.log('abc>abc>>>>>>>>>>>>', abc)
    // NativeModules?.RNBcaSdk?.readCard(
    //   '001094023646')
    //   .then(res => {
    //     console.log('result>>>>>>>>>', res);
    //   }).catch(err => {
    //     console.log('errrrrrr>>>>>>>>', err)
    //   })
  }

  // if (hasNfc === null) return null;

  // if (!hasNfc) {
  //   return (
  //     <View style={styles.sectionContainer}>
  //       <Text>NFC not supported</Text>
  //     </View>
  //   )
  // }

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <View style={styles.content}>
        <Text>Hello world</Text>
        <TouchableOpacity style={[styles.btn, styles.btnScan]} onPress={retry}>
          <Text style={{ color: "black", fontSize: 20 }}>Scan Tag</Text>
        </TouchableOpacity>
        {/* {Platform.OS === 'android' && (
          <NfcPromptAndroid visible={visible} source={source} message={message} onCancel={onCancel} reading={reading} />
        )} */}
        {/* <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={cancelReadTag}>
        <Text style={{ color: "white" }}>Cancel Scan</Text>
      </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
  // const [info, setInfo] = useState(null);


  // const [nfcReader, updateNfc] = useState(false);


  // // useEffect(() => {
  // //   NfcManager.start();
  // // }, [])


  // // const readData = async () => {
  // //   try {
  // //     console.log('23423432423423')
  // //     let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
  // //     let resp = await NfcManager.requestTechnology(tech, {
  // //       alertMessage: 'Ready to do some custom Mifare cmd!'
  // //     });

  // //     let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;
  // //     console.log('2222222')
  // //     resp = await cmd([0x3A, 4, 4]);
  // //     let payloadLength = parseInt(resp.toString().split(",")[1]);
  // //     let payloadPages = Math.ceil(payloadLength / 4);
  // //     let startPage = 5;
  // //     let endPage = startPage + payloadPages - 1;

  // //     resp = await cmd([0x3A, startPage, endPage]);
  // //     bytes = resp.toString().split(",");
  // //     let text = "";

  // //     for (let i = 0; i < bytes.length; i++) {
  // //       if (i < 5) {
  // //         continue;
  // //       }

  // //       if (parseInt(bytes[i]) === 254) {
  // //         break;
  // //       }

  // //       text = text + String.fromCharCode(parseInt(bytes[i]));

  // //     }

  // //     NfcManager.cancelTechnologyRequest().catch(() => 0);
  // //     // this.setState({
  // //     //   log: text
  // //     // })

  // //     // this._cleanUp();
  // //   } catch (ex) {
  // //     // this.setState({
  // //     //   log: ex.toString()
  // //     // })
  // //     // this._cleanUp();
  // //   }
  // // }

  // const onFailed = useCallback(({ errCode, errMessage }) => {
  //   // EidSDK.stopReadInfoIOS()
  //   // infoRef.current = undefined
  //   // sodRef.current = undefined
  //   // if (latestErrorCode.current !== FACE_MATCH_ERROR_CODE) {
  //   //   setMessage(
  //   //     errMessage && !errMessage.startsWith(UNKNOWN_ERROR)
  //   //       ? errMessage
  //   //       : errCode
  //   //         ? MESSAGES.ERROR + `(${errCode})`
  //   //         : MESSAGES.ERROR,
  //   //   )
  //   //   setErrorCode(errCode)
  //   // }
  //   // setReading(false)
  //   // setSource(Images.errorCircle)
  //   // setRetryVisible(true)
  //   // setTimeout(() => {
  //   //   hide()
  //   // }, 1000)
  //   NfcManager.cancelTechnologyRequest()
  // }, [])

  // const readTag = useCallback(async () => {
  //   // if (readingRef.current) {
  //   //   return
  //   // }
  //   readingRef.current = true
  //   console.log('readTag')
  //   // setRetryVisible(false)
  //   // setMessage(MESSAGES.READY)
  //   // setErrorCode(undefined)
  //   // setSource(Images.nfcImg)
  //   // if (Platform.OS === 'ios') {
  //   //   try {
  //   //     const result = await EidSDK.readInfo(
  //   //       Platform.OS === 'ios' && !image.startsWith('data:') ? 'data:image/png;base64,' + image : image,
  //   //     )
  //   //     console.log('readTag result ios:', result)
  //   //   } catch (error) {
  //   //   } finally {
  //   //     readingRef.current = false
  //   //   }
  //   // } else {
  //   try {
  //     // show()
  //     const tag = await NfcManager.requestTechnology(NfcTech.IsoDep, {
  //       alertMessage: 'Ready to do some custom Mifare cmd!'
  //     });//([NfcTech.IsoDep])
  //     console.log('tag>>>>>>', tag)
  //     if (tag) {
  //       // setReading(true)
  //       // await EidSDK.readInfo(image)
  //     } else {
  //       console.log('No tag found, what to do next')
  //       onFailed({ errMessage: 'Không tìm thấy thông tin phù hợp' })
  //     }
  //   } catch (ex) {
  //     console.log('readTag error:', ex)
  //     onFailed({ errMessage: ex.message || ex.Message })
  //   } finally {
  //     readingRef.current = false
  //   }
  //   // }
  // }, [])

  // const retry = useCallback(async () => {
  //   await readTag()
  // }, [readTag])

  // return (
  //   <SafeAreaView style={backgroundStyle}>
  //     <StatusBar
  //       barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  //       backgroundColor={backgroundStyle.backgroundColor}
  //     />
  //     {/* <ScrollView
  //       contentInsetAdjustmentBehavior="automatic"
  //       style={backgroundStyle}> */}
  //     <Header />
  //     <View>
  //       <Button
  //         title="Scan11223231"
  //         onPress={retry}
  //       // onPress={() => {
  //       //   retry
  //       //   // console.log('RNBcaSdk', NativeModules)
  //       //   // NativeModules?.RNBcaSdk?.readCard(
  //       //   //   //   {
  //       //   //   //   idNumber: '094023646',
  //       //   //   //   dob: '940814', // YYMMDD
  //       //   //   //   doe: '340814', // YYMMDD
  //       //   //   // }
  //       //   //   '234567'
  //       //   //   , '213245454')
  //       //   //   // NativeModules?.RNBcaSdk?.doInBackground('2345643534')
  //       //   //   .then(res => {
  //       //   //     console.log('____ result', res);
  //       //   //     setInfo(res);
  //       //   //   })
  //       //   //   .catch(err => console.log(err));
  //       // }}
  //       />
  //     </View>
  //     {/* </ScrollView> */}
  //   </SafeAreaView >
  // );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
