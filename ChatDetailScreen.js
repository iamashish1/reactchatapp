import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from './firebase/Firebase';
import { collection, addDoc, onSnapshot, Timestamp, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ChatDetailScreen({ route,navigation }) {
  const { userId, userName, chatId: initialChatId } = route.params;  
  const [chatId, setChatId] = useState(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const flatListRef = useRef(null); 
  useEffect(() => {
    navigation.setOptions({ title: userName });
  }, [userName]);
  useEffect(() => {
    if (initialChatId) {
      setChatId(initialChatId);
    } else {
      const checkOrCreateChat = async () => {
        try {
          const authUserId = auth.currentUser.uid;
          const chatsCollection = collection(db, 'chats');

          const q = query(chatsCollection, where('participants', 'array-contains', authUserId));
          const querySnapshot = await getDocs(q);

          let existingChatId = null;
          querySnapshot.forEach(doc => {
            const chatData = doc.data();
            if (chatData.participants.includes(userId)) {
              existingChatId = doc.id;
            }
          });

          if (existingChatId) {
            setChatId(existingChatId);
          } else {
            const newChatRef = await addDoc(chatsCollection, {
              participants: [authUserId, userId],
              lastMessage: '',
              lastMessageTimestamp: Timestamp.now()
            });
            setChatId(newChatRef.id);
          }
        } catch (error) {
          console.error('Error checking or creating chat:', error);
        }
      };

      checkOrCreateChat();
    }
  }, [userId, initialChatId]);

  useEffect(() => {
    if (!chatId) return;

    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
      const messagesList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate()); 

      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (newMessage.trim().length > 0) {
      try {
        const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: auth.currentUser.uid,
          text: newMessage,
          timestamp: Timestamp.now()
        });

        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: newMessage,
          lastMessageTimestamp: Timestamp.now()
        });

        setNewMessage('');
        
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === auth.currentUser.uid;

    return (
      <View style={[styles.messageItem, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp.toDate().toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  messageRight: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  messageLeft: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
