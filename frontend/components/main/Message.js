import React from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native'
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'

function Message() {
    return (
        <View>
            <Text>YAYa</Text>
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following
})

export default connect(mapStateToProps, null)(Message);
