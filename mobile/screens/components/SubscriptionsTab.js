import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Repeat, Calendar } from 'lucide-react-native';

const mockSubscriptions = [
  { id: 1, name: 'HDFC Home Loan EMI', category: 'EMI', amount: 45000, nextDue: 'Oct 5, 2024', status: 'Active', icon: '🏦' },
  { id: 2, name: 'AWS Cloud Hosting', category: 'Software', amount: 150000, nextDue: 'Oct 8, 2024', status: 'Active', icon: '☁️' },
  { id: 3, name: 'Google Workspace', category: 'Software', amount: 12500, nextDue: 'Oct 12, 2024', status: 'Active', icon: '📧' },
  { id: 4, name: 'WeWork Office Rent', category: 'Rent', amount: 185000, nextDue: 'Oct 15, 2024', status: 'Active', icon: '🏢' },
];

export default function SubscriptionsTab({ formatCurrency }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Repeat size={22} color="#4f46e5" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Active Recurring Payments</Text>
            <Text style={styles.subtitle}>Auto-detected from transaction history</Text>
          </View>
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>TOTAL MONTHLY RECURRING</Text>
          <Text style={styles.totalAmount}>{formatCurrency(392500)}</Text>
        </View>

        <View style={styles.list}>
          {mockSubscriptions.map((sub) => (
            <View key={sub.id} style={styles.subItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{sub.icon}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.name}>{sub.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{sub.category}</Text>
                </View>
              </View>
              <View style={styles.rightSide}>
                <Text style={styles.amount}>{formatCurrency(sub.amount)}/mo</Text>
                <View style={styles.dueRow}>
                  <Calendar size={10} color="#64748b" style={styles.calendarIcon} />
                  <Text style={styles.dueDate}>Due: {sub.nextDue}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: '#eef2ff',
    padding: 10,
    borderRadius: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  totalBlock: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ef4444',
    marginTop: 4,
  },
  list: {
    gap: 12,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderColor: '#f1f5f9',
    borderWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: {
    fontSize: 18,
  },
  meta: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
  },
  rightSide: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 3,
  },
  dueDate: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '500',
  },
});
