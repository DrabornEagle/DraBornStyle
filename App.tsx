import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { dkd_is_supabase_env_ready } from './src/dkd_config/dkd_supabase_client';

export default function Dkd_DraBornStyleApp() {
  return (
    <SafeAreaView style={dkd_styles.dkd_safe_area}>
      <ScrollView contentContainerStyle={dkd_styles.dkd_screen}>
        <View style={dkd_styles.dkd_card}>
          <Text style={dkd_styles.dkd_title}>DraBornStyle v0.1</Text>
          <Text style={dkd_styles.dkd_text}>Müşteri / İşletme / Usta / Admin / Super Admin temel başlangıç.</Text>
          <View style={dkd_styles.dkd_status_box}>
            <Text style={dkd_styles.dkd_label}>Supabase .env durumu</Text>
            <Text style={dkd_is_supabase_env_ready ? dkd_styles.dkd_success : dkd_styles.dkd_warning}>
              {dkd_is_supabase_env_ready ? 'Bağlantı bilgileri hazır' : 'Publishable key eksik veya hatalı'}
            </Text>
          </View>
          <Text style={dkd_styles.dkd_next}>Sıradaki adım: gerçek auth ve rol bazlı giriş ekranı.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dkd_styles = StyleSheet.create({
  dkd_safe_area: {
    flex: 1,
    backgroundColor: '#07111F'
  },
  dkd_screen: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center'
  },
  dkd_card: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155'
  },
  dkd_title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12
  },
  dkd_text: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24
  },
  dkd_status_box: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#0B1324'
  },
  dkd_label: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8
  },
  dkd_success: {
    color: '#86EFAC',
    fontSize: 17,
    fontWeight: '900'
  },
  dkd_warning: {
    color: '#FDE68A',
    fontSize: 17,
    fontWeight: '900'
  },
  dkd_next: {
    marginTop: 18,
    color: '#7DD3FC',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800'
  }
});
