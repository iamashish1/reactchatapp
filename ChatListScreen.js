import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db, auth } from './firebase/Firebase';
import { collection, getDocs, query, where,orderBy } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setCurrentUserId(user.uid);
      }
    };

    fetchCurrentUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        const fetchChatsAndUsers = async () => {
          try {
            const userCollection = collection(db, 'Users');
            const userSnapshot = await getDocs(userCollection);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);

            const userMap = userList.reduce((map, user) => {
              map[user.id] = user.name;
              return map;
            }, {});
            setUserMap(userMap);

            const chatCollection = collection(db, 'chats');

            const chatQuery = query(chatCollection, where('participants', 'array-contains', currentUserId), orderBy('lastMessageTimestamp', 'desc'));
            const chatSnapshot = await getDocs(chatQuery);
            const chatList = chatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChats(chatList);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        fetchChatsAndUsers();
      }
    }, [currentUserId])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const handleChatPress = (chatId,usersName) => {
    navigation.navigate('Chat Detail', { chatId,userName: usersName });
  };

  const getChatParticipantsNames = (participants) => {
    const otherParticipants = participants.filter(userId => userId !== currentUserId);
    return otherParticipants.map(userId => userMap[userId] || 'Unknown').join(', ');
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleChatPress(item.id,getChatParticipantsNames(item.participants))}>
            <View style={styles.chatItem}>
              <Text style={styles.participantName}>{getChatParticipantsNames(item.participants)}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              <Text style={styles.timestamp}>{formatDate(item.lastMessageTimestamp.toDate())}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  participantName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  logoutButton: {
    marginRight: 15,
  },
});
