import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Home, Activity, Cpu } from 'lucide-react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import ArchitectureScreen from './screens/ArchitectureScreen';
import AuthModal from './screens/AuthModal';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [tokenData, setTokenData] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem('@pr2_auth_token');
        if (stored) {
          try {
            setTokenData(JSON.parse(stored));
            setActiveTab('dashboard');
          } catch (parseError) {
            console.log("Invalid token format in storage, clearing.");
            await AsyncStorage.removeItem('@pr2_auth_token');
          }
        }
      } catch (e) {
        console.error("Error loading token", e);
      } finally {
        setIsReady(true);
      }
    };
    loadToken();
  }, []);

  const handleLoginSuccess = async (data) => {
    try {
      await AsyncStorage.setItem('@pr2_auth_token', JSON.stringify(data));
    } catch (e) {
      console.error("Error saving token", e);
    }
    setTokenData(data);
    setShowAuth(false);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@pr2_auth_token');
    } catch (e) {
      console.error(e);
    }
    setTokenData(null);
    setActiveTab('welcome');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setShowAuth(true)} />;
      case 'dashboard':
        return <DashboardScreen tokenData={tokenData} />;
      case 'architecture':
        return <ArchitectureScreen />;
      default:
        return <WelcomeScreen onStart={() => setShowAuth(true)} />;
    }
  };

  // Determine status bar style based on current screen
  const statusBarStyle = activeTab === 'welcome' ? 'light' : 'dark';

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style={statusBarStyle} />
      
      <AuthModal 
        visible={showAuth} 
        onClose={() => setShowAuth(false)} 
        onSuccess={handleLoginSuccess} 
      />

      {/* Active Screen Render */}
      <View style={styles.screenWrapper}>
        {renderScreen()}
      </View>

      {/* Floating Bottom Tab Bar - hide on Welcome screen for pure landing experience, or keep it on all screens */}
      {activeTab !== 'welcome' && (
        <SafeAreaView style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            {/* Welcome / Home Tab */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'welcome' && styles.tabItemActive]}
              onPress={() => setActiveTab('welcome')}
              activeOpacity={0.7}
            >
              <Home size={20} color={activeTab === 'welcome' ? '#4f46e5' : '#64748b'} />
              <Text style={[styles.tabLabel, activeTab === 'welcome' && styles.tabLabelActive]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Dashboard Tab */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
              onPress={() => setActiveTab('dashboard')}
              activeOpacity={0.7}
            >
              <Activity size={20} color={activeTab === 'dashboard' ? '#4f46e5' : '#64748b'} />
              <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
                Radar
              </Text>
            </TouchableOpacity>

            {/* Architecture Tab */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'architecture' && styles.tabItemActive]}
              onPress={() => setActiveTab('architecture')}
              activeOpacity={0.7}
            >
              <Cpu size={20} color={activeTab === 'architecture' ? '#4f46e5' : '#64748b'} />
              <Text style={[styles.tabLabel, activeTab === 'architecture' && styles.tabLabelActive]}>
                System
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenWrapper: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 0 : 0, // safe area handles iOS bottom padding
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  tabItemActive: {
    // Optional active tab item styling
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#4f46e5',
  },
});
