import React, { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native'

import firebase from 'firebase';
require('firebase/firestore');

export default function Search(props) {
    const [users, setUsers] = useState([])
    const [modifyContent, setModifyContent] = useState(null);

    const fetchUsers = (search) => {
        firebase.firestore()
            .collection('users')
            .where('name', '>=', search)
            .get()
            .then((snapshot) => {
                let users = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                });
                setUsers(users);
            });
        setModifyContent(true)
    }
    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Type Here..."
                onChangeText={(search) => fetchUsers(search)} />

            <FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("Profile", {uid: item.id})}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>

                )}
            />
            {modifyContent ? null :
            (<Text>Content</Text>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 25
    }
})
