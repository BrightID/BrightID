// @flow

import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Button from './CustomButton';

type Props = {
  label: string,
  value: string,
  onChange: func,
  onChangeText: func,
  style: object,
};

class ModalTextInput extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      value: "",
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.editText = this.editText.bind(this);
  }

  openModal() {
    this.setState({
      modalVisible: true,
      value: this.props.value || "",
    });
  }

  closeModal() {
    this.setState({ modalVisible: false });
  }

  editText() {
    this.props.onChangeText && this.props.onChangeText(this.state.value);
    this.closeModal();
  }

  onChangeText(text) {
    this.setState({ value: text });
  }

  render() {
    let { label, style } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.openModal}>
          <Text style={style || styles.textView}>{this.props.value}</Text>
        </TouchableOpacity>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalMargin}>
              <View style={styles.modalBodyContainer}>
                <View style={styles.modalBody}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    value={this.state.value}
                    onChangeText={this.onChangeText}
                    style={styles.textInput}
                    autoFocus={true}
                  />
                  <View style={{ flexDirection: "row", width: '100%' }}>
                    <View style={[styles.modalFooterBtnContainer, { paddingRight: 5 }]}>
                      <Button
                        type="basic"
                        title="Cancel"
                        onPress={this.closeModal}
                      />
                    </View>
                    <View style={[styles.modalFooterBtnContainer, { paddingLeft: 5 }]}>
                      <Button
                        title="OK"
                        onPress={this.editText}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

ModalTextInput.defaultProps = {
  label: '',
};

const styles = StyleSheet.create({
  container: {},
  modalBackground: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    backgroundColor: '#371515bb',
  },
  modalMargin: {
    padding: 0,
    paddingBottom: 0,
  },
  modalBodyContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexGrow: 0,
    width: '100%',
  },
  modalHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  modalBody: {
    width: '100%',
    padding: 10,
  },
  modalFooter: {},
  modalFooterBtnContainer: {
    width: '50%',
  },
  label: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    color: '#050505',
    marginBottom: 15,
  },
  textView: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9e9e9e',
    marginTop: 16,
    width: '100%',
    minWidth: 150,
    height: 40,
    padding: 10,
  },
  textInput: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9e9e9e',
    marginVertical: 10,
    width: '100%',
    minWidth: 150,
    height: 40,
    padding: 10,
  },
});

export default ModalTextInput;
