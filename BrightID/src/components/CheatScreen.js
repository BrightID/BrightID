// @flow

import * as React from 'react';
import {
    Alert,
    AsyncStorage,
    Dimensions,
    Image,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    Button,
    CheckBox,
    TouchableOpacity,
    ScrollView,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import BottomNav from './BottomNav';
import nacl from 'tweetnacl';
import { getConnections } from '../actions/getConnections';
import Material from 'react-native-vector-icons/MaterialIcons';
import {
  objToB64,
  strToUint8Array,
  uInt8ArrayToB64,
} from '../utils/encoding';
import api from "../Api/BrightId";

/**
 * Home screen of BrightID
 * ==========================
 */

export class TestConnectionScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'BrightID',
        scope: 'info',
        headerBackTitle: 'Home',
    });

    state = {
        connectionsCount: 0,
        groups: [],
        connections: [],
        loading: false,
        userA: null,
        userB: null,

        sig: '',
        timestamp: "",
        groupId: '',
    };

    clear = () => {
        this.setState({
            groups: [],
            connections: [],
            loading: false,
            userA: null,
            userB: null
        });
    };

    testJoinGroup(){
        let groupId = '1585018';
        let {publicKey, secretKey} = this.props;
        let timestamp = '1543516944543';
        let publicKeyStr = uInt8ArrayToB64(publicKey);
        let message = publicKeyStr + groupId + timestamp;
        let sig = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), secretKey));

        this.setState({sig, timestamp, groupId});
    }

    createNewUser(){
        const { publicKey, secretKey } = this.props; //nacl.sign.keyPair();
        const userData = {
            publicKey,
            secretKey,
            nameornym: 'Sadegh Test',
            avatar: ''
        };
        api.createUser(publicKey)
            .then(async response => {
                // await AsyncStorage.setItem('userData', JSON.stringify(userData));
                // // update redux store
                // await this.props.dispatch(setUserData(userData));
                alert(JSON.stringify(response,null,2));
            })
            .catch(error => {
                alert(JSON.stringify(error,null,2))
            })
    }

    testGetUserInfo(){
        let {publicKey, secretKey} = this.props;
        let timestamp = Date.now();
        let message = uInt8ArrayToB64(publicKey) + timestamp;
        let sig = nacl.sign.detached(strToUint8Array(message), secretKey);
        // let verify = nacl.sign.detached.verify(strToUint8Array(message), sig, publicKey);
        // alert(verify ? 'verified successfully' : 'verification failed');
        // this.clear();
        api.getUserInfo()
            .then(response => {
                alert(JSON.stringify(response,null,2));
                if(response && response.data && response.data.eligibleGroups)
                    this.setState({groups: response.data.eligibleGroups,scope: 'info'});
            })
            .catch(error => {
                alert(JSON.stringify(error,null,2))
            })
    }

    async switchUser(){
        this.clear();
        this.setState({loading: true, scope: 'switch'});
        await this.props.dispatch(getConnections());
        setTimeout(() => {
            this.setState({
                connections: this.props.connections,
                loading: false
            });
        },400);
    }

    switchToConnection = async (connection) => {
        let {
            publicKey,
            secretKey,
            nameornym,
        } = connection;

        let userData = {publicKey, secretKey, nameornym, avatar: ''}

        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        // await this.props.dispatch(setUserData(userData));
        let creationResponse = await api.createUser(publicKey);
        alert(JSON.stringify(creationResponse,null,4));
        // alert('done');
    };

    goToConnectUsers = async () => {
        this.clear();
        this.setState({loading: true, scope: 'connect'});
        await this.props.dispatch(getConnections());
        setTimeout(() => {
            this.setState({
                connections: this.props.connections,
                loading: false
            });
        },400);
    };

    connectUsers = async () => {
        let {userA, userB} = this.state;
        if(!userA && !userB)
            return alert('select 2 user');

        try {
            // return alert(JSON.stringify(objToUint8(userA.secretKey)));
            let timestamp = Date.now();
            let publicKeyStr1 = uInt8ArrayToB64(userA.publicKey);
            let publicKeyStr2 = uInt8ArrayToB64(userB.publicKey);

            let message = publicKeyStr1 + publicKeyStr2 + timestamp;
            let sig1 = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), userA.secretKey));
            // return alert(sig1);

            let sig2 = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), userB.secretKey));

            let result = await api.createConnection(userA.publicKey, sig1, userB.publicKey, sig2, timestamp);
            alert(JSON.stringify(result, null, 4));
        }catch (err) {
            alert(JSON.stringify({
                message: err.message,
                stack: err.stack,
                err
            },null,4));
        }
    }

    componentDidMount() {
        // this.getConnectionsCount();
        // emitter.on('refreshConnections', this.getConnectionsCount);

        // =========== My Tests ================
        // this.testUserCreate();
        // this.testGetUserInfo();
    }

    render() {
        const {
            navigation,
            nameornym,
            score,
            connections,
            groupsCount,
            userAvatar,
            connectQrData,
            publicKey,
            secretKey,
        } = this.props;
        const { connectionsCount } = this.state;
        const timestamp = 1543441727;
        let message = objToB64(publicKey) + timestamp;
        let sig = nacl.sign.detached(strToUint8Array(message), secretKey);
        // const signature = nacl.sign(
        //     strToUint8Array(JSON.stringify(publicKey) + timestamp),
        //     secretKey
        // );
        return (
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    {this.state.loading && (
                        <ActivityIndicator style={{position: 'absolute', top: 50, left: '50%'}} size="large" color="#0000ff" />
                    )}
                    <ScrollView>
                        <View style={{flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10}}>
                            {/*<Button style={{flex: 0}} title="New" onPress={()=>{this.testJoinGroup()}} />*/}
                            {/*<View style={{flex: 1}} />*/}
                            <Button style={{flex: 0}} title="Switch" onPress={()=>this.switchUser()} />
                            <View style={{flex: 1}} />
                            <Button style={{flex: 0}} title="connect" onPress={()=>this.goToConnectUsers()} />
                            <View style={{flex: 1}} />
                            <Button style={{flex: 0}} title="Get Info" onPress={()=>this.testGetUserInfo()} />
                        </View>
                        <View styles={{padding: 10}}>
                            <Text>name: {nameornym}</Text>
                            <View>
                                <Text>PublicKey</Text>
                                <TextInput value={uInt8ArrayToUrlSafeB64(publicKey)}/>
                                {/*<Text>timestamp</Text>*/}
                                {/*<TextInput value={this.state.timestamp}/>*/}
                                {/*<Text>Sig</Text>*/}
                                {/*<TextInput value={obj2b64(this.state.sig)}/>*/}
                            </View>
                            {/*<Text>connectionQrData: {JSON.stringify(connectQrData)}</Text>*/}
                            {this.state.scope==='info' &&(
                                <View style={{padding: 10, borderWidth: 1, borderColor: '#ddd'}}>
                                    <Text>eligible groups</Text>
                                    <View>
                                        {this.state.groups.map((group,index) => (
                                            <View key={index} style={{flexDirection: 'row'}}>
                                                <Text style={{flex: 1}}>{JSON.stringify(group,null, 4)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {this.state.scope==='switch' &&(
                                <View style={{padding: 10, borderWidth: 1, borderColor: '#ddd'}}>
                                    <Text>connections</Text>
                                    <View>
                                        {this.state.connections.map((connection,index) => (
                                            <View key={index} style={{flexDirection: 'row', paddingVertical: 5}}>
                                                {/*<Text style={{flex: 1}}>{JSON.stringify(connection,null, 4)}</Text>*/}
                                                <Text style={{flex: 1}}>{connection.nameornym} - {connection.score} {objToB64(connection.publicKey)}</Text>
                                                <View style={{flex: 0}}>
                                                    <Button title="switch" onPress={()=>this.switchToConnection(connection)}/>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {this.state.scope==='connect' &&(
                                <View style={{padding: 10, borderWidth: 1, borderColor: '#ddd'}}>
                                    <Text>connections</Text>
                                    <Button title="Connect users" onPress={()=>this.connectUsers()}/>
                                    <View style={{flexDirection: 'row', width: '95%', borderColor: '#999', borderWidth: 1}}>
                                        <View style={{flex: 0, flexDirection: 'column', borderColor: '#999', borderWidth: 1, width: '50%'}}>
                                            {this.state.connections.map((connection,index) => (
                                                <View key={index} style={{flexDirection: 'row', paddingVertical: 5}}>
                                                    <TouchableOpacity style={{flex: 0}} onPress={() => this.setState({ userA: connection })}>
                                                        <Material
                                                            size={30}
                                                            name={(this.state.userA && JSON.stringify(this.state.userA.publicKey)==JSON.stringify(connection.publicKey)) ? "radio-button-checked" : "radio-button-unchecked"}
                                                            color="#000"
                                                        />
                                                    </TouchableOpacity>
                                                    <Text style={{flex: 1}}>{connection.nameornym}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        <View style={{flex: 0, flexDirection: 'column', borderColor: '#999', borderWidth: 1, width: '50%'}}>
                                            {this.state.connections.map((connection,index) => (
                                                <View key={index} style={{flexDirection: 'row', paddingVertical: 5}}>
                                                    <TouchableOpacity style={{flex: 0}} onPress={() => this.setState({ userB: connection })}>
                                                        <Material
                                                            size={30}
                                                            name={(this.state.userB && JSON.stringify(this.state.userB.publicKey)==JSON.stringify(connection.publicKey)) ? "radio-button-checked" : "radio-button-unchecked"}
                                                            color="#000"
                                                        />
                                                    </TouchableOpacity>
                                                    <Text style={{flex: 1}}>{connection.nameornym}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    <Button title="Connect users" onPress={()=>this.connectUsers()}/>
                                </View>
                            )}
                            {/*<Text>publicKey: {JSON.stringify(publicKey,null,2)}</Text>*/}
                        </View>
                    </ScrollView>
                </View>
                <BottomNav navigation={navigation} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
});

export default connect((state) => state.main)(TestConnectionScreen);
