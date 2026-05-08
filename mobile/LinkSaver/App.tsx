import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
  Alert,
} from 'react-native';

const BASE_URL = 'http://10.0.0.101:5000/api';

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
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [links, setLinks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/getLinks`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setLinks(data);
    } catch (err: any) {
      Alert.alert('Error', `Could not load links: ${err.message}`);
    }
  };

  const addOrUpdateLink = async () => {
    if (url.trim().length === 0) {
      Alert.alert('Validation', 'Please enter a URL.');
      return;
    }

    try {
      if (editingId) {
        const response = await fetch(`${BASE_URL}/updateLink/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), title: title.trim() || url.trim() }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        setLinks(prev => prev.map(l => (l._id === editingId ? result.updated : l)));
        setEditingId(null);
      } else {
        const response = await fetch(`${BASE_URL}/saveLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            title: title.trim() || url.trim(),
            originClient: 'mobile',
          }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        setLinks(prev => [...prev, result.link]);
      }

      setUrl('');
      setTitle('');
    } catch (err: any) {
      Alert.alert('Error', `Could not save link: ${err.message}`);
    }
  };

  const removeLink = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this link?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/deleteLink/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            setLinks(prev => prev.filter(l => l._id !== id));
          } catch (err: any) {
            Alert.alert('Error', `Could not delete link: ${err.message}`);
          }
        },
      },
    ]);
  };

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setUrl(item.url);
    setTitle(item.title || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUrl('');
    setTitle('');
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.heading}>Link Saver</Text>

      <TextInput
        style={styles.input}
        placeholder="Title (optional)"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="URL (required)"
        placeholderTextColor="#888"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={addOrUpdateLink}>
          <Text style={styles.buttonText}>{editingId ? 'Update Link' : 'Save Link'}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={cancelEdit}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {links.length === 0 ? (
        <Text style={styles.emptyText}>No links saved yet.</Text>
      ) : (
        <FlatList
          data={links}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.linkItem}>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle} numberOfLines={1}>
                  {item.title || item.url}
                </Text>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {item.url}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity onPress={() => startEdit(item)} style={styles.editButton}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeLink(item._id)}>
                  <Text style={styles.removeText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1e88e5',
  },
  buttonCancel: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  linkInfo: {
    flex: 1,
    marginRight: 12,
  },
  linkTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  linkUrl: {
    color: '#888',
    fontSize: 12,
  },
  linkActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 12,
  },
  editText: {
    color: '#ffb300',
    fontWeight: 'bold',
  },
  removeText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
});

export default App;