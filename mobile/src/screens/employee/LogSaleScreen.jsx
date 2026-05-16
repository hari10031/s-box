import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { getSarees } from '../../api/sarees';
import { getCustomers } from '../../api/users';
import { createSale } from '../../api/sales';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function LogSaleScreen({ navigation }) {
  const [sarees, setSarees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedSaree, setSelectedSaree] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salePrice, setSalePrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=select saree, 2=select customer, 3=price

  useEffect(() => {
    getSarees({ limit: 100 }).then(r => setSarees(r.data.data)).catch(() => {});
    getCustomers().then(r => setCustomers(r.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!selectedSaree || !selectedCustomer || !salePrice) { Alert.alert('Error', 'All fields required'); return; }
    setLoading(true);
    try {
      await createSale({ sareeRef: selectedSaree._id, customerRef: selectedCustomer._id, salePrice: Number(salePrice), note });
      Alert.alert('Success', 'Sale submitted for approval', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
    setLoading(false);
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Saree</Text>
        <FlatList data={sarees} keyExtractor={i => i._id} contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.selectCard} onPress={() => { setSelectedSaree(item); setSalePrice(String(item.price)); setStep(2); }}>
              <Text style={styles.selectName}>{item.name}</Text>
              <Text style={styles.selectPrice}>₹{item.price?.toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No sarees available</Text>} />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Customer</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color={colors.text} /><Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <FlatList data={customers} keyExtractor={i => i._id} contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.selectCard} onPress={() => { setSelectedCustomer(item); setStep(3); }}>
              <Text style={styles.selectName}>{item.name}</Text>
              <Text style={styles.selectSub}>@{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No customers. Create one first.</Text>} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color={colors.text} /><Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Sale</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saree</Text>
          <Text style={styles.summaryValue}>{selectedSaree?.name}</Text>
          <Text style={styles.summaryLabel}>Customer</Text>
          <Text style={styles.summaryValue}>{selectedCustomer?.name}</Text>
        </View>

        <FormInput label="Sale Price (₹)" value={salePrice} onChangeText={setSalePrice} keyboardType="numeric" />
        <FormInput label="Note (Optional)" value={note} onChangeText={setNote} placeholder="Optional note" multiline />
        <Button title="Submit Sale" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: 20, paddingRight: 64, marginBottom: 16 },
  scroll: { padding: 24 },
  list: { padding: 16 },
  selectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.md, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  selectName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  selectPrice: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  selectSub: { color: colors.textMuted, fontSize: 13 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, marginBottom: 8 },
  backText: { color: colors.text, fontSize: 14 },
  summaryCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  summaryLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
