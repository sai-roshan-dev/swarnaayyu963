// import React, { useState } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, Modal, Pressable } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// type Props = {
//   status: 'idle' | 'listening'| 'mic-off' | 'recording' | 'speaking';
//   onMicToggle: () => void;
// };

// export default function VoiceActions({ status, onMicToggle }: Props) {
//   const [settingsVisible, setSettingsVisible] = useState(false);
//   const [active, setActive] = useState<'comments' | 'mic' | 'settings' | null>(null);

//   const router = useRouter();

//   const handleCommentsPress = () => {
//     setActive('comments');
//     router.push('/history');
//   };

//   const handleMicToggle = () => {
//     setActive('mic');
//     onMicToggle();
//   };

//   const handleSettingsPress = () => {
//     setActive('settings');
//     setSettingsVisible(true);
//   };

//   return (
//     <View style={styles.wrapper}>
//       {/* Icons */}
//       <View style={styles.iconRow}>
//         <TouchableOpacity onPress={handleCommentsPress} style={styles.iconCircle}>
//           <Ionicons
//             name={active === 'comments' ? 'chatbubble-ellipses' : 'chatbubble-outline'}
//             size={24}
//             color="#007bff"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handleMicToggle} style={[styles.iconCircle, styles.middleIcon]}>
//           <Ionicons
//             name={
//               status === 'idle'
//                 ? active === 'mic'
//                   ? 'mic-off'
//                   : 'mic-off-outline'
//                 : active === 'mic'
//                 ? 'mic'
//                 : 'mic-outline'
//             }
//             size={26}
//             color="#007bff"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handleSettingsPress} style={styles.iconCircle}>
//           <Ionicons
//             name={active === 'settings' ? 'settings' : 'settings-outline'}
//             size={24}
//             color="#007bff"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Text link */}
//       <Text style={styles.bottomText}>
//         <Ionicons name="create-outline" size={14} color="black" /> Need to type?{' '}
//         <Text style={styles.clickHere}>Click here</Text>
//       </Text>

//       {/* Settings Modal */}
//       <Modal visible={settingsVisible} animationType="fade" transparent>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Settings</Text>
//             <Pressable
//               onPress={() => {
//                 setSettingsVisible(false);
//                 router.replace('/login'); // Logout action
//               }}
//             >
//               <Text style={styles.logoutText}>Logout</Text>
//             </Pressable>
//             <Pressable onPress={() => setSettingsVisible(false)}>
//               <Text style={{ marginTop: 12, color: '#007bff' }}>Cancel</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     alignItems: 'center',
//     marginTop: 24,
//   },
//   iconRow: {
//     flexDirection: 'row',
//     gap: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   iconCircle: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#f0f7ff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   middleIcon: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#f0f7ff',
//   },
//   bottomText: {
//     fontSize: 14,
//     color: '#333',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   clickHere: {
//     color: '#007bff',
//     fontWeight: '500',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: '#00000055',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalBox: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 16,
//     width: 240,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 16,
//   },
//   logoutText: {
//     fontSize: 16,
//     color: '#e53935',
//     fontWeight: '500',
//   },
// });


import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Pressable, useColorScheme, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import Ionicons from '@expo/vector-icons/Ionicons';

import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

type Props = {
  status: 'idle' | 'listening' | 'mic-off' | 'connecting' | 'speaking';
  permissionStatus ?: string;
  microphonePermisstion ?: boolean,
  onMicToggle: () => void;
};

export default function VoiceActions({ status,permissionStatus,microphonePermisstion, onMicToggle }: Props) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [active, setActive] = useState<'comments' | 'mic' | 'settings' | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const dynamicStyles = {
    color: isDark ? 'white' : 'black',
  };

  const handleCommentsPress = () => {
    setActive('comments');
    router.push('/history');
  };

  const handleMicToggle = () => {
    setActive('mic');
    onMicToggle();
  };

  const handleSettingsPress = () => {
    setActive('settings');
    setSettingsVisible(true);
    router.push('/settings');

  };

  const isMicOff =  permissionStatus === 'undetermined' || 'denied';
  const AnimatedRing = isMicOff ? Animatable.View : View;

  useEffect(() => {
    if (!isMicOff) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 500,
          easing: Easing.out(Easing.circle),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.circle),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [isMicOff]);

  return (
    <View style={styles.wrapper}>
      {/* Icons */}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={handleCommentsPress} style={styles.iconCircle}> 
          {/* onPress={handleCommentsPress} */}
          <Ionicons
            name={active === 'comments' ? 'chatbubble-ellipses' : 'chatbubble-outline'}
            size={24}
            color="#007bff"
          />
        </TouchableOpacity>

        <AnimatedRing
          animation={isMicOff ? 'pulse' : undefined}
          iterationCount="infinite"
          duration={1600}
          easing="ease-out"
          style={styles.ringContainer}
        >
          <TouchableOpacity onPress={handleMicToggle} style={[styles.iconMicCircle, styles.middleIcon, {backgroundColor:  '#f0f7ff'}]}>
          <Animated.View style={{ transform: permissionStatus === 'granted'  ? "" :  [{ scale }]  }}>
            <Ionicons
              name={
                permissionStatus === 'granted' ? 'mic-outline' : 'mic-off-outline'
              }
              size={26}
              color={ "#007bff"}
            />
           </Animated.View>

          </TouchableOpacity>
        </AnimatedRing>

        <TouchableOpacity onPress={handleSettingsPress} style={styles.iconCircle}>
          <Ionicons
            name={active === 'settings' ? 'settings' : 'settings-outline'}
            size={24}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>

      {/* Text link */}
      {/* <Text style={[styles.bottomText, { color: dynamicStyles.color} ]} >
        <Ionicons name="create-outline" size={14} color={dynamicStyles.color} /> Need to type?{' '}
        <Text style={styles.clickHere}>Click here</Text>
      </Text> */}

      {/* Settings Modal */}
      {/* <Modal visible={settingsVisible} animationType="fade" transparent> */}
        {/* <View onPress={redirectSettings}> */}
          
            {/* <Text style={styles.modalTitle}>Settings</Text> */}
            {/* <Pressable
              onPress={() => {
                setSettingsVisible(false);
                router.replace('/login'); // Logout action
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
            <Pressable onPress={() => setSettingsVisible(false)}>
              <Text style={{ marginTop: 12, color: '#007bff' }}>Cancel</Text>
            </Pressable> */}
        {/* </View> */}
      {/* </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMicCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f7ff',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 80,
    padding: 10,
    backgroundColor: 'transparent',
  },
  bottomText: {
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clickHere: {
    color: '#007bff',
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: 240,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: '500',
  },
});
