import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert,Pressable } from 'react-native';
import { firebase } from './firebase/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/Firebase';
import { setDoc, doc } from 'firebase/firestore';
import { handleException } from './firebase/FirebaseException';
import { authStyle } from './styles/AuthStyle';
import { db } from './firebase/Firebase';

import { showToastWithGravityAndOffset } from './Toast';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSignup = async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log(user)
      
          // Define user data object
          const userData = {
            address: {
              city: "",
              state: "",
              street: "",
              zipCode: "",
            },
            avatarUrl: user.photoURL || "",  
            bio: "",
            email: user.email,
            isEmailVerified: user.emailVerified,
            name: user.displayName || fullName,  
            phoneNumber: user.phoneNumber || "",  
            userId: user.uid,
          };
      
          // Add user data to Firestore
          await setDoc(doc(db, 'Users', user.uid), userData);
      
          showToastWithGravityAndOffset("Successfully Signed Up");
        } catch (error) {
            console.log(error)
          const errorMessage = handleException(error);
          Alert.alert('Error', errorMessage);
        }
      };

    return (
        <View
         style={authStyle.container}
         >
            <Text 
            style={authStyle.header}
            >Signup</Text>
             <TextInput
                placeholder="Full Name"
                onChangeText={setFullName}
                value={fullName}
                style={authStyle.textInput}
            />
            <TextInput
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                style={authStyle.textInput}
            />
            <TextInput
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                style={authStyle.textInput}
            />
             
            <Pressable title="Signup" onPress={handleSignup}
             style={authStyle.button} 
             >
            <Text style={{ color: 'white',fontWeight:'600', alignSelf: 'center' }}>SignUp</Text>
            </Pressable>
         
        </View>
    );
}