import React, { memo } from 'react'
import { Image, Text, View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native'
import Spinner from 'react-native-spinkit'
import Modal from 'react-native-modal'
import Images from './Images'
// import { CustomText, RoundedButton } from '~/Components'
// import { Colors, CommonStyles, FontTypes, Images } from '~/Themes'
// interface Props {
//   visible: boolean
//   message: string
//   onCancel: () => void
//   source: ImageSourcePropType
//   reading?: boolean
//   readingMessage?: string
// }

const NfcPromptAndroid = memo(
  ({ visible, message, onCancel, source, reading = false, readingMessage = 'Đang đọc...' }) => {
    return (
      <Modal
        useNativeDriver
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
        style={styles.modal}
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View style={[styles.wrapper]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onCancel}>
              <Image style={styles.backIcon} source={Images.iconBack} />
            </TouchableOpacity>
            {/* <CustomText size={16} text={'Sẵn sàng quét'} style={styles.message} /> */}
            <Text>Sẵn sàng quét</Text>
          </View>
          <View style={styles.prompt}>
            <Image source={source} style={styles.image} resizeMode="contain" />
            {/* <CustomText numberOfLines={3} size={16} text={reading ? readingMessage : message} style={styles.message} /> */}
            <Text style={styles.message}>{reading ? readingMessage : message}</Text>
            <Spinner style={styles.spinner} isVisible={reading} size={40} type={'ThreeBounce'} color={'green'} />
          </View>
          {/* <RoundedButton
            type={'outline'}
            title={'Huỷ'}
            buttonStyle={CommonStyles.bottomButton}
            titleStyle={CommonStyles.titleBlackMedium}
            onPress={onCancel}
            outlineSize={2}
            color={Colors.lightGray}
          /> */}
        </View>
      </Modal>
    )
  },
)

const styles = StyleSheet.create({
  text: {

  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  wrapper: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    overflow: 'hidden',
  },
  header: {
    height: 50,
    width: '100%',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 19,
  },
  backButton: {
    position: 'absolute',
    top: 5,
    left: 19,
    width: 40,
    height: 40,
  },
  backIcon: {
    width: 40,
    height: 40,
    // backgroundColor: 'red'
  },
  image: {
    width: 120,
    height: 120,
    marginTop: 12,
    // backgroundColor: 'red'
  },
  message: {
    lineHeight: 22,
    // fontFamily: FontTypes.bold,
    margin: 15,
    marginBottom: 0,
    textAlign: 'center',
  },
  prompt: { width: '100%', height: 400, alignItems: 'center' },
  spinner: {},
})

export default NfcPromptAndroid
