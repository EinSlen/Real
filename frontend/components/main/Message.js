import React from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native'
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'

function Message() {
    return (
        <View>
            <Text>Message : </Text>
        {currentUser.downloadURL ? 
            <Image 
                style={width: 50, height: 200,resizeMode: 'stretch'}
                source={currentUser.downloadURL}/> :
            <Image
                style={width: 50, height: 200,resizeMode: 'stretch'}
                source={require="../../assets/friends.png"}/>}
                    
            <Text>{currentUser.username} : {currentUser.message[0]}</Text>
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following
})

export default connect(mapStateToProps, null)(Message);
