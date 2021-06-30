import React, { useState, useEffect } from 'react';
import { Button, View, Text, TextInput, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

import firebase from 'firebase';
require('firebase/firestore')

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { fetchUsersData } from '../../redux/actions/index'
import * as ImagePicker from 'expo-image-picker';

function Setting(props) {

    const [user, SetUser] = useState(null);
    const [image, setImage] = useState(null);
    const [nameValue, setNameValue] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        firebase.firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((snapshot) => {
            if (snapshot.exists) {
                SetUser(snapshot.data())
            } else {
                console.log("Setting user does not exist")
            }
        })
    }, [props])

    const ChangeProfile = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        console.log(result);
      
        if (!result.cancelled) {
            setImage(result.uri);
            const uri = image;
            const childPath = `picture/${firebase.auth().currentUser.uid}/${Math.random().toString(36)}`;
            console.log(childPath)

            const response = await fetch(uri);
            const blob = await response.blob();

            const task = firebase
                .storage()
                .ref()
                .child(childPath)
                .put(blob);

            const taskProgress = snapshot => {
                console.log(`transferred: ${snapshot.bytesTransferred}`)
            }

            const taskCompleted = () => {
                task.snapshot.ref.getDownloadURL().then((snapshot) => {
                    savePostData(snapshot);
                    console.log(snapshot)
                })
            }

            const taskError = snapshot => {
                console.log(snapshot)
            }

            task.on("state_changed", taskProgress, taskError, taskCompleted);
        }
    }

    const savePostData = (downloadURL) => {

        firebase.firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .set({
                name: user.name,
                email: user.email,
                picture: downloadURL
            })
    }

    if (user === null) {
        return <View />
    }

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => props.navigation.navigate("Profile", {uid: firebase.auth().currentUser.uid})}
            >
                <Image
                    source={require('../../assets/fleche.jpg')}
                    style={{width: 48, height: 48, marginTop: 25}}
                />
            </TouchableOpacity>
            <Text style={styles.headerText}>Profile {user.name}</Text>
            <View style={styles.container}>
             {user.picture ? (
                    <Image
                        source={{uri: user.picture}}
                        style={{width: 48, height: 48, borderRadius: 10, position: 'absolute', margin: 20}}
                    />) : (
                    <Image
                        source={require('../../assets/friend.png')}
                        style={{width: 48, height: 48, borderRadius: 10, position: 'absolute', margin: 20}}
                    />
                )}

            <TouchableOpacity style={styles.button}>
                <Button
                    title="Change profile picture"
                    onPress={() => ChangeProfile()}
                />
            </TouchableOpacity>
            <Text style={{fontSize: 16}}>Name: </Text>
            <TextInput
                placeholder={user.name}
                style={styles.textInput}
                maxLength={15}
            />
            
            <Text style={styles.text}>Your Email : </Text>
            <Text style={{ fontSize: 16 }}>{user.email}</Text>
            <Text style={styles.text}>Bio : </Text>
            <TextInput style={styles.textInputBio}></TextInput>

            {error && <Text style={styles.error}>{error}</Text>}
            
            <TouchableOpacity style={{ marginTop: 50}}>
                <Button
                    title='Submit'
                />
            </TouchableOpacity>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        margin: 5
    },
    container: {
        flex: 1,
        padding: 25,
        marginTop: 25
    },
    textInput: {
        fontSize: 16,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        width: 150,
        marginTop: 10,
        
    },
    textInputBio: {
        fontSize: 16,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        height: 150,
        marginTop: 10,
        
    },
    button: {
        height: 60, alignItems: 'flex-end'
    },
    headerText: {
        fontSize: 20,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 35,
        right: '50%', 
    },
    text: {
        marginTop: 25,
        fontSize: 16
    },
    error: {
        fontSize: 20,
        color: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

const mapStateToProps = (store) => ({
    users: store.usersState.users
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Setting);