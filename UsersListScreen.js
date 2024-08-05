import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UsersListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        
        const q = query(usersCollection, where('userId', '!=', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setUsers(usersList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const handlePress = (user) => {
    // Navigate to Chat Screen
    navigation.navigate('Chat Detail', { userId: user.id, userName: user.name });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userStatus: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default UsersListScreen;
