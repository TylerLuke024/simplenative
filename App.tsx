import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './utils/supabase';

type RootTabParamList = {
  Overview: undefined;
  RecordSale: undefined;
};

type Sale = {
  id: number;
  created_at: string;
  sales_date: string;
  degC: number;
  ice_cream_sales: number;
  coffee_sales: number;
};

type SaleDraft = {
  salesDate: string;
  temperature: string;
  iceCream: string;
  coffee: string;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

const getToday = () => new Date().toISOString().slice(0, 10);

function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const { data, error: queryError } = await supabase
      .from('sales')
      .select('id, created_at, sales_date, degC, ice_cream_sales, coffee_sales')
      .order('sales_date', { ascending: false });

    if (queryError) {
      console.error('Error fetching sales:', queryError.message);
      setError('We could not load your sales right now.');
    } else {
      setSales(data ?? []);
      setError(null);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  return { sales, loading, refreshing, error, reload: loadSales };
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'blue' | 'orange';
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricDot, accent === 'orange' && styles.orangeDot]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function OverviewScreen({
  navigation,
}: BottomTabScreenProps<RootTabParamList, 'Overview'>) {
  const { sales, loading, refreshing, error, reload } = useSales();
  const totals = useMemo(
    () =>
      sales.reduce(
        (sum, sale) => ({
          iceCream: sum.iceCream + sale.ice_cream_sales,
          coffee: sum.coffee + sale.coffee_sales,
        }),
        { iceCream: 0, coffee: 0 },
      ),
    [sales],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => reload(true)} />
        }
        ListHeaderComponent={
          <>
            <Header eyebrow="Sales intelligence" title="Overview" />
            <View style={styles.heroCard}>
              <Text style={styles.heroKicker}>ALL-TIME UNITS SOLD</Text>
              <Text style={styles.heroValue}>
                {formatNumber(totals.iceCream + totals.coffee)}
              </Text>
              <Text style={styles.heroCaption}>
                Across {sales.length} recorded {sales.length === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <MetricCard
                label="Ice cream"
                value={formatNumber(totals.iceCream)}
                accent="blue"
              />
              <MetricCard
                label="Coffee"
                value={formatNumber(totals.coffee)}
                accent="orange"
              />
            </View>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Recent sales</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('RecordSale')}
              >
                <Text style={styles.actionText}>Add sale</Text>
              </Pressable>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.saleRow}>
            <View style={styles.saleDateBadge}>
              <Text style={styles.saleDateDay}>
                {new Date(item.sales_date).getDate()}
              </Text>
              <Text style={styles.saleDateMonth}>
                {new Date(item.sales_date).toLocaleDateString('en-US', {
                  month: 'short',
                }).toUpperCase()}
              </Text>
            </View>
            <View style={styles.saleDetails}>
              <Text style={styles.saleDate}>{formatDate(item.sales_date)}</Text>
              <Text style={styles.saleMeta}>
                {item.degC}°C  ·  Ice cream {formatNumber(item.ice_cream_sales)}  ·  Coffee{' '}
                {formatNumber(item.coffee_sales)}
              </Text>
            </View>
            <Text style={styles.saleTotal}>
              {formatNumber(item.ice_cream_sales + item.coffee_sales)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.blue} style={styles.loader} />
          ) : (
            <Text style={styles.emptyText}>No sales recorded yet.</Text>
          )
        }
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        selectionColor={colors.blue}
      />
    </View>
  );
}

function RecordSaleScreen({ navigation }: BottomTabScreenProps<RootTabParamList, 'RecordSale'>) {
  const [draft, setDraft] = useState<SaleDraft>({
    salesDate: getToday(),
    temperature: '',
    iceCream: '',
    coffee: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const update = (key: keyof SaleDraft) => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const saveSale = async () => {
    const iceCream = Number(draft.iceCream);
    const coffee = Number(draft.coffee);
    const temperature = Number(draft.temperature);

    if (!draft.salesDate || !Number.isInteger(iceCream) || iceCream < 0 ||
        !Number.isInteger(coffee) || coffee < 0 ||
        !Number.isInteger(temperature)) {
      setMessage('Enter a date and whole numbers for every sales field.');
      return;
    }

    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from('sales').insert({
      sales_date: new Date(`${draft.salesDate}T12:00:00`).toISOString(),
      degC: temperature,
      ice_cream_sales: iceCream,
      coffee_sales: coffee,
    });

    if (error) {
      console.error('Error recording sale:', error.message);
      setMessage('The sale could not be saved. Please try again.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setDraft({ salesDate: getToday(), temperature: '', iceCream: '', coffee: '' });
    navigation.navigate('Overview');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Header eyebrow="Daily entry" title="Record a sale" />
          <Text style={styles.formIntro}>
            Keep your daily numbers in one place. Your team can review them instantly.
          </Text>
          <View style={styles.formCard}>
            <Field
              label="Sales date"
              value={draft.salesDate}
              onChangeText={update('salesDate')}
              placeholder="YYYY-MM-DD"
            />
            <Field
              label="Temperature (°C)"
              value={draft.temperature}
              onChangeText={update('temperature')}
              placeholder="e.g. 24"
              keyboardType="numeric"
            />
            <Field
              label="Ice cream units"
              value={draft.iceCream}
              onChangeText={update('iceCream')}
              placeholder="e.g. 250"
              keyboardType="numeric"
            />
            <Field
              label="Coffee units"
              value={draft.coffee}
              onChangeText={update('coffee')}
              placeholder="e.g. 50"
              keyboardType="numeric"
            />
          </View>
          {message ? <Text style={styles.errorText}>{message}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save sale"
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={() => void saveSale()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save sale</Text>
            )}
          </Pressable>
          <Text style={styles.formFootnote}>
            Sales are saved securely to your Supabase database.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const colors = {
  background: '#F6F7F9',
  card: '#FFFFFF',
  ink: '#101828',
  secondary: '#667085',
  muted: '#98A2B3',
  line: '#EAECF0',
  blue: '#175CD3',
  blueSoft: '#EFF8FF',
  orange: '#F79009',
  white: '#FFFFFF',
  danger: '#B42318',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  header: { marginBottom: 24 },
  eyebrow: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headerTitle: { color: colors.ink, fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 24,
    padding: 24,
    marginBottom: 12,
  },
  heroKicker: { color: '#A4BCFD', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroValue: { color: colors.white, fontSize: 48, fontWeight: '700', marginTop: 10 },
  heroCaption: { color: '#D0D5DD', fontSize: 14, marginTop: 5 },
  metricRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    flex: 1,
    padding: 16,
  },
  metricDot: { backgroundColor: colors.blue, borderRadius: 8, height: 8, marginBottom: 18, width: 8 },
  orangeDot: { backgroundColor: colors.orange },
  metricValue: { color: colors.ink, fontSize: 24, fontWeight: '700' },
  metricLabel: { color: colors.secondary, fontSize: 13, marginTop: 4 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  actionText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
  saleRow: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  saleDateBadge: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 12,
    paddingVertical: 8,
    width: 48,
  },
  saleDateDay: { color: colors.blue, fontSize: 18, fontWeight: '700' },
  saleDateMonth: { color: colors.blue, fontSize: 10, fontWeight: '700', marginTop: 2 },
  saleDetails: { flex: 1 },
  saleDate: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  saleMeta: { color: colors.secondary, fontSize: 12, lineHeight: 18, marginTop: 4 },
  saleTotal: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  loader: { marginTop: 30 },
  emptyText: { color: colors.secondary, paddingVertical: 24, textAlign: 'center' },
  errorText: { color: colors.danger, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  formIntro: { color: colors.secondary, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  formCard: { backgroundColor: colors.card, borderRadius: 22, padding: 18 },
  field: { borderBottomColor: colors.line, borderBottomWidth: 1, marginBottom: 18, paddingBottom: 8 },
  fieldLabel: { color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: { color: colors.ink, fontSize: 17, paddingVertical: 4 },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 18,
  },
  pressed: { opacity: 0.8 },
  saveButtonText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  formFootnote: { color: colors.muted, fontSize: 12, marginTop: 16, textAlign: 'center' },
  tabIcon: { fontSize: 22, lineHeight: 24 },
});

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 86, paddingTop: 8 },
        }}
      >
        <Tab.Screen
          name="Overview"
          component={OverviewScreen}
          options={{ tabBarLabel: 'Overview', tabBarIcon: () => <Text style={styles.tabIcon}>⌂</Text> }}
        />
        <Tab.Screen
          name="RecordSale"
          component={RecordSaleScreen}
          options={{ tabBarLabel: 'Record sale', tabBarIcon: () => <Text style={styles.tabIcon}>＋</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
