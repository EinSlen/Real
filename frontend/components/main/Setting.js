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
    const [nameValue, setNameValue] = useState("");
    const [imageComplet, setImageComplet] = useState(null);
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [bioError, setBioError] = useState(null);

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
                    setImageComplet(snapshot);
                    console.log(snapshot)
                })
            }

            const taskError = snapshot => {
                console.log(snapshot)
                setError(snapshot)
                setImageError(true)
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
                picture: downloadURL,
                bio: user.bio
            })
    }

    const onLogout = () => {
        firebase.auth().signOut();
    }

    const Submit = () => {

        if(nameValue.length != 0 || bio.length != 0) {
            if(nameValue.length < 5 || nameValue.length > 10) {
                setError("Your name is too small or big.")
                setNameError(true)
                return
            }

            if(bio.length > 100) {
                setError("Your biography is too big.")
                setBioError(true)
                return
            }

            if((nameValue.length != 0 && bio.length === 0) && !nameError && !bioError) {
                firebase.firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid)
                .set({
                    name: nameValue,
                    email: user.email,
                    picture: user.picture,
                    bio: user.bio
                }).then(() => {
                    props.navigation.navigate("Profile", {uid: firebase.auth().currentUser.uid})
                })
            }

            if((nameValue.length === 0 && bio.length != 0) && !nameError && !bioError) {
                firebase.firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid)
                .set({
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    bio: bio
                }).then(() => {
                    props.navigation.navigate("Profile", {uid: firebase.auth().currentUser.uid})
                })
            }

            if((nameValue.length != 0 && bio.length != 0) && !nameError && !bioError) {
                firebase.firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid)
                .set({
                    name: nameValue,
                    email: user.email,
                    picture: user.picture,
                    bio: bio
                }).then(() => {
                    props.navigation.navigate("Profile", {uid: firebase.auth().currentUser.uid})
                })
            }
        }

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
            <TouchableOpacity style={styles.logoutButton}>
                <Button
                    title="Logout"
                    onPress={() => onLogout()}
                />
            </TouchableOpacity>
            <View style={styles.container}>
             {user.picture ? (
                    <Image
                        source={{uri: user.picture}}
                        style={{width: 64, height: 64, borderRadius: 10, position: 'absolute', margin: 20}}
                    />) : (
                    <Image
                        source={require('../../assets/friend.png')}
                        style={{width: 64, height: 64, borderRadius: 10, position: 'absolute', margin: 20}}
                    />
                )}
            <Text>{imageComplet}</Text>
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
                onChangeText={(nametext) => setNameValue(nametext)}
            />
            
            <Text style={styles.text}>Your Email : </Text>
            <Text>{user.email}</Text>
            <Text style={styles.text}>Bio : </Text>
            <TextInput 
                style={styles.textInputBio}
                textAlignVertical='top'
                placeholder='Place a bio'
                onChangeText={(biotext) => setBio(biotext)}
            />

            {(nameError || bioError || imageError) ? (<Text style={styles.error}>{error}</Text>) : null}

            
            <TouchableOpacity style={{ marginTop: 50}}>
                <Button
                    title='Submit'
                    onPress={() => Submit()}
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
        marginTop: 10
    },
    textInputBio: {
        fontSize: 16,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        height: 150,
        marginTop: 10

    },
    textInputEmail: {
        fontSize: 16,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        width: 250,
        height: 50,
        marginTop: 10,
    },
    button: {
        height: 60, 
        alignItems: 'flex-end'
    },
    headerText: {
        fontSize: 20,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 35,
        right: '40%', 
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
        paddingTop: 20
    },
    logoutButton: {
        width: 120, 
        fontSize: 20,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 35,
        right: 0
    }
})

const mapStateToProps = (store) => ({
    users: store.usersState.users
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Setting);