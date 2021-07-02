import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button, TouchableOpacity } from 'react-native'

import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'


function Profile(props) {
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [following, setFollowing] = useState(false);
    const [follower, setFollower] = useState(0);
    const [asfollower, setasFollower] = useState(0);
    const [postSize, setPostSize] = useState(0);

    useEffect(() => {
        const { currentUser, posts } = props;

        if (props.route.params.uid === firebase.auth().currentUser.uid) {
            setUser(currentUser)
            setUserPosts(posts)
            firebase.firestore().collection("following").doc(firebase.auth().currentUser.uid).collection("userFollowing").get()
            .then(snapshot => {
                setFollower(snapshot.size);
            })
            firebase.firestore().collection("follower").doc(props.route.params.uid).collection("asFollower").get()
            .then(snapshot => {
                setasFollower(snapshot.size);
            })
            posts ? setPostSize(posts.length) : null
        }
        else {
            firebase.firestore()
                .collection("users")
                .doc(props.route.params.uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        setUser(snapshot.data());
                        setTimeout(() => {
                            setUser(snapshot.data())
                        }, 1500)
                    }
                    else {
                        console.log('does not exist')
                    }
                })
            firebase.firestore()
                .collection("posts")
                .doc(props.route.params.uid)
                .collection("userPosts")
                .orderBy("creation", "asc")
                .get()
                .then((snapshot) => {
                    let posts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserPosts(posts)
                    posts ? setPostSize(posts.length) : null 
                })

                firebase.firestore().collection("following").doc(props.route.params.uid).collection("userFollowing").get()
                .then(snapshot => {
                    setFollower(snapshot.size);
                })
                firebase.firestore().collection("follower").doc(props.route.params.uid).collection("asFollower").get()
                .then(snapshot => {
                    setasFollower(snapshot.size);
                })
        }

        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }
    }, [])

    const onFollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .set({})

        firebase.firestore()
            .collection("follower")
            .doc(props.route.params.uid)
            .collection("asFollower")
            .doc(firebase.auth().currentUser.uid)
            .set({})
    }
    const onUnfollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .delete()

        firebase.firestore()
            .collection("follower")
            .doc(props.route.params.uid)
            .collection("asFollower")
            .doc(firebase.auth().currentUser.uid)
            .delete()
    }

    const trash = (downloadURL) => {
        firebase.firestore()
            .collection('posts')
            .doc(firebase.auth().currentUser.uid)
            .collection('userPosts')
            .doc(downloadURL.uid)
            .delete()

        console.log("delete : " + downloadURL)
    }

    if (user === null) {
        return <View />
    }

    return (

        <View style={styles.container}>
            <View style={styles.containerInfo}>
                    {user.picture ? (
                        <Image
                            source={{uri: user.picture}}
                            style={{width: 48, height: 48, borderRadius: 50, }}
                        />) : (
                        <Image
                            source={require('../../assets/friend.png')}
                            style={{width: 48, height: 48, borderRadius: 50}}
                        />
                    )}  
                    <Text>{user.name}</Text>
                    {(user.bio === '' || user.bio == null) ? 
                        (<Text>You don't have a bio</Text>) 
                        : (<Text>{user.bio}</Text>)}        
                {props.route.params.uid !== firebase.auth().currentUser.uid ? (
                    <View>
                        {following ? (
                            <Button
                                title="Following"
                                onPress={() => onUnfollow()}
                            />
                        ) :
                            (
                                <Button
                                    title="Follow"
                                    onPress={() => onFollow()}
                                />
                            )}
                    </View>
                ) : (
                    <View>
                        
                        <Button
                            title="Setting"
                            onPress={() => props.navigation.navigate("Setting", {uid: user.id})}
                        />
                    </View>
                    )}
                <Text>Following : {follower}</Text>
                <Text>Follower : {asfollower}</Text>
                <Text>Posts: {postSize}</Text>

            </View>

            <View style={styles.containerGallery}>
                <FlatList
                    numColumns={3}
                    horizontal={false}
                    data={userPosts}
                    renderItem={({ item }) => (
                        
                        <View style={styles.containerImage}>

                            <Image
                                style={styles.image}
                                source={{ uri: item.downloadURL }}
                            />

                            <TouchableOpacity
                                onPress={() => trash(item)}
                                style={styles.opacityEdit}
                            >
                                <Image 
                                    source={require('../../assets/edit.png')}
                                    style={styles.imageEdit}
                                />
                            </TouchableOpacity>

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
        marginTop: 25
    },
    containerInfo: {
        margin: 20
    },
    containerGallery: {
        flex: 1,
        backgroundColor: 'black'
    },
    containerImage: {
        flex: 1 / 3

    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1,
        margin: 5,
        borderRadius: 10
    },
    picture: {
        flex: 1,
        width: 48,
        height: 48,
        borderRadius: 50
    },
    imageEdit: {
        width: '90%', 
        height: '90%', 
        opacity: 0.4, 
        flex: 1, 
        marginTop: 5, 
        marginLeft: 5, 
        borderBottomRightRadius: 10, 
        borderTopLeftRadius: 10
    },
    opacityEdit: {
        width: '50%', 
        height: '50%', 
        position: 'absolute', 
        shadowColor: 'gray'
    }
})
const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following
})
export default connect(mapStateToProps, null)(Profile);
