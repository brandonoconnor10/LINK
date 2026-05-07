import React, { useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
} from 'react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [link, setLink] = useState('');
  const [links, setLinks] = useState<string[]>([]);

  const addLink = () => {
    if (link.trim().length > 0) {
      setLinks([...links, link.trim()]);
      setLink('');
    }
  };

  const removeLink = (item: string) => {
    setLinks(links.filter(l => l !== item));
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.title}>Link Saver MVP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a link"
        value={link}
        onChangeText={setLink}
      />
      <TouchableOpacity style={styles.button} onPress={addLink}>
        <Text style={styles.buttonText}>Save Link</Text>
      </TouchableOpacity>
      <FlatList
        data={links}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.linkItem}>
            <Text style={styles.linkText}>{item}</Text>
            <TouchableOpacity onPress={() => removeLink(item)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  linkText: { color: '#fff' },
  removeText: { color: '#e53935', fontWeight: 'bold' },
});

export default App;
