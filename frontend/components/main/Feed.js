import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native'
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'


function Feed(props) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return x.creation - y.creation;
            })
            setPosts(props.feed);
        }

    }, [props.usersFollowingLoaded, props.feed])


    const onLikePress = (userId, postId) => {
        firebase.firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .set({})

    }
    const onDislikePress = (userId, postId) => {
        firebase.firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .delete()
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerGallery}>
            {(posts === 0 ? null : (
                    <View style={styles.asPost}>
                        <Text style={styles.HelpText}>USER</Text>
                    </View>
                )
            )}
                <FlatList
                    numColumns={1}
                    horizontal={false}
                    data={posts}
                    renderItem={({ item }) => (
                        <View style={styles.containerImage}>
                            <Text style={styles.container}>{item.user.name}</Text>
                            {console.log(item.user.email)}
                            <Image
                                style={styles.image}
                                source={{ uri: item.downloadURL }}
                                roundedTop="lg"
                            />

                            { item.currentUserLike ?
                                (
                                    <Button
                                        title="Dislike"
                                        onPress={() => 
                                            onDislikePress(item.user.uid, item.id)
                                        } />      
                                )
                                :
                                (
                                    <Button
                                        title="Like"
                                        onPress={() => 
                                            onLikePress(item.user.uid, item.id)
                                        } />
                                    
                                )
                            }

                                <Text>Like : {item.size}</Text>

                            <Text
                                onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })}>
                                View Comments...
                                </Text>   
                        </View>

                    )}

                />
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerInfo: {
        margin: 20
    },
    containerGallery: {
        flex: 1
    },
    containerImage: {
        flex: 1 / 3

    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1
    },
    asPost: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        flex: 1,
        color: '#ffa5004',
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        textAlign: 'center',
        padding: 5,
        margin: 15
    },
    HelpText: {
        fontSize: 20,
        color: '#ff0000'
    }
});

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
