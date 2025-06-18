import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';


export default function SettingsScreen() {
  const [handsFree, setHandsFree] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const {siginout} = useAuth()


  const getPhone = async() =>{
    const phoneNumber = await SecureStore.getItemAsync('phone_number');
    if(phoneNumber){
      setPhoneNumber(phoneNumber)
    }
  }

  useEffect(() =>{
    getPhone()
  }, [])

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => { siginout()
         },
      },
    ]);
    console.log('after login redirect')
  };

  const SettingRow = ({
    label,
    value,
    onPress,
    hasArrow = true,
    isToggle = false,
    toggleValue,
    onToggle,
    icon,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    hasArrow?: boolean;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    icon?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={styles.row}
    >
      <View style={styles.left}>{icon}</View>
      <View style={styles.middle}>
        <Text style={styles.label}>{label}</Text>
      </View>
      {isToggle ? (
        <Switch value={toggleValue} onValueChange={onToggle} />
      ) : (
        <View style={styles.right}>
          {value && <Text style={styles.value}>{value}</Text>}
          {hasArrow && (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <ScrollView style={styles.container}>
      <SettingRow
        label="WhatsApp Number"
        value={`${phoneNumber}`}
        hasArrow={false}
      />
      {/* <SettingRow label="My Privacy" onPress={() => {}} />

      <Text style={styles.sectionTitle}>Voice & Audio</Text>
      <SettingRow label="Microphone Access" value="Allowed" onPress={() => {}} />
      <SettingRow
        label="Hands-Free Mode"
        isToggle
        toggleValue={handsFree}
        onToggle={() => setHandsFree(!handsFree)}
      />
      <SettingRow label="Main Language" value="Auto-Detect" onPress={() => {}} />

      <Text style={styles.sectionTitle}>Connected Apps</Text>
      <SettingRow label="Manage Connected Apps" onPress={() => {}} />

      <Text style={styles.sectionTitle}>Support</Text>
      <SettingRow
        label="Help Center"
        icon={<FontAwesome name="whatsapp" size={18} color="#25D366" />}
        onPress={() => {}}
      />
      <SettingRow label="About Gamyam AI" value="ON" onPress={() => {}} /> */}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#e53935" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  left: {
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: '#007bff',
    fontSize: 14,
    marginRight: 4,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
});
