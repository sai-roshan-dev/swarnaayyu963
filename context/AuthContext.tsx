import React, {useContext, useEffect, useState} from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const AuthContext = React.createContext({} as any);


const AuthContextProvider = ({ children }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

useEffect(() => { 
    init();
}, [isAuthenticated])

const init = async() => {
 const token = await SecureStore.getItemAsync('token');
    if(!token){ 
        setIsAuthenticated(false);
    }else{
        setIsAuthenticated(true);
    }
}

const signin = async(token: any) => {
    await SecureStore.setItemAsync('token', token);
    setIsAuthenticated(true);
}

const siginout = async() => {
    console.log('logout')
    SecureStore.deleteItemAsync('isOtpVerified');
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('phone_number')
    SecureStore.deleteItemAsync('name')
    setIsAuthenticated(false);
    router.replace('/login');
}

const contextValue = {
    isAuthenticated: isAuthenticated,
    signin: signin,
    siginout: siginout
}
console.log(contextValue.isAuthenticated, 'isAuthenticated context')
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

export { AuthContext, useAuth, AuthContextProvider };