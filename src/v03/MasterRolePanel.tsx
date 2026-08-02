import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, radii, spacing } from '../theme';
import { SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { V02MasterPanel } from '../v02/MasterPanel';
import { V02DemoState } from '../v02/types';
import { getMasterAppointments, statusLabel, statusTone } from './state';
import { AppointmentStatus, V03Appointment, V03DemoState } from './types';

type Result = { ok: boolean; message: string };
type OperationsProps = React.ComponentProps<typeof V02MasterPanel>;

export function V03MasterPanel({ operationsProps, appointmentState, operationsState, onStatus, onStartAppointment, onMessage }: {
  operationsProps: OperationsProps;
  appointmentState: V03DemoState;
  operationsState: V02DemoState;
  onStatus: (appointmentId: string, status: AppointmentStatus) => Result;
  onStartAppointment: (appointment: V03Appointment) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const [area, setArea] = useState<'calendar' | 'operations'>('calendar');
  const appointments = getMasterAppointments(appointmentState, operationsProps.user.id, '2026-08-02');
  const act = (response: Result) => onMessage(response.message, response.ok);
  if (area === 'operations') return <View style={styles.root}><Tabs area={area} onChange={setArea} /><View style={styles.fill}><V02MasterPanel {...operationsProps} /></View></View>;
  return <View style={styles.root}><Tabs area={area} onChange={setArea} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="calendar" size={26} color={colors.white} /></View><View style={styles.heroCopy}><Text style={styles.eyebrow}>USTA TAKVİMİ</Text><Text style={styles.heroTitle}>Bugünün müşteri akışı</Text><Text style={styles.heroText}>Gelen müşteriyi onayla ve randevulu işlemi tek tuşla başlat.</Text></View></View>
    <View style={styles.metrics}><Metric label="Toplam" value={appointments.length} accent={colors.cyan} /><Metric label="Bekleyen" value={appointments.filter((item) => ['scheduled','on_the_way','customer_arrived'].includes(item.status)).length} accent={colors.amber} /><Metric label="Bitti" value={appointments.filter((item) => item.status === 'completed').length} accent={colors.green} /></View>
    <SectionHeader title="2 Ağustos Pazar" meta={`${appointments.length} kayıt`} />
    <View style={styles.list}>{appointments.map((appointment) => { const service = operationsState.services.find((item) => item.id === appointment.serviceId); return <View key={appointment.id} style={styles.card}>
      <View style={styles.top}><View style={styles.timeBox}><Text style={styles.time}>{appointment.time}</Text></View><View style={styles.info}><Text numberOfLines={1} style={styles.customer}>{appointment.customerName}</Text><Text numberOfLines={1} style={styles.service}>{service?.title ?? 'Hizmet'} · {appointment.durationMinutes} dk</Text></View><StatusPill label={statusLabel(appointment.status)} status={statusTone(appointment.status)} /></View>
      {!!appointment.note && <Text style={styles.note}>{appointment.note}</Text>}
      <View style={styles.actions}>{appointment.status === 'customer_arrived' && <AnimatedPressable style={styles.greenButton} onPress={() => act(onStatus(appointment.id, 'arrived'))}><Ionicons name="checkmark-circle" size={17} color={colors.white} /><Text style={styles.buttonText}>Müşteri Geldi</Text></AnimatedPressable>}{appointment.status === 'arrived' && <AnimatedPressable style={styles.pinkButton} onPress={() => act(onStartAppointment(appointment))}><Ionicons name="play-circle" size={18} color={colors.white} /><Text style={styles.buttonText}>İşleme Başla</Text></AnimatedPressable>}{['scheduled','on_the_way'].includes(appointment.status) && <AnimatedPressable style={styles.noShow} onPress={() => act(onStatus(appointment.id, 'no_show'))}><Text style={styles.noShowText}>Gelmedi</Text></AnimatedPressable>}{appointment.status === 'in_service' && <Text style={styles.activeText}>Aktif işlem merkezinde devam ediyor</Text>}</View>
    </View>; })}</View>
  </ScrollView></View>;
}

function Tabs({ area, onChange }: { area: 'calendar'|'operations'; onChange: (value:'calendar'|'operations')=>void }) { return <View style={styles.tabs}><AnimatedPressable style={[styles.tab, area === 'calendar' && styles.tabActive]} onPress={() => onChange('calendar')}><Ionicons name="calendar-outline" size={17} color={area === 'calendar' ? colors.white : colors.textMuted} /><Text style={[styles.tabText, area === 'calendar' && styles.tabTextActive]}>Takvim</Text></AnimatedPressable><AnimatedPressable style={[styles.tab, area === 'operations' && styles.tabActive]} onPress={() => onChange('operations')}><Ionicons name="cut-outline" size={17} color={area === 'operations' ? colors.white : colors.textMuted} /><Text style={[styles.tabText, area === 'operations' && styles.tabTextActive]}>İşlem Merkezi</Text></AnimatedPressable></View>; }
function Metric({ label, value, accent }: { label:string; value:number; accent:string }) { return <View style={styles.metric}><Text style={[styles.metricValue,{color:accent}]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const styles=StyleSheet.create({root:{flex:1},fill:{flex:1},tabs:{flexDirection:'row',gap:6,paddingHorizontal:spacing.md,paddingBottom:8},tab:{flex:1,minHeight:44,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,borderRadius:15,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border},tabActive:{backgroundColor:colors.surfaceElevated},tabText:{color:colors.textMuted,fontSize:10.5,fontWeight:'900'},tabTextActive:{color:colors.white},content:{paddingHorizontal:spacing.md,paddingTop:3,paddingBottom:34},hero:{minHeight:122,flexDirection:'row',alignItems:'center',gap:12,padding:15,borderRadius:24,backgroundColor:'rgba(45,212,255,0.09)',borderWidth:1,borderColor:'rgba(45,212,255,0.2)'},heroIcon:{width:54,height:54,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:colors.cyan},heroCopy:{flex:1},eyebrow:{color:colors.textMuted,fontSize:8.5,fontWeight:'900'},heroTitle:{color:colors.white,fontSize:18,fontWeight:'900',marginTop:4},heroText:{color:colors.textMuted,fontSize:9.5,lineHeight:14,marginTop:5},metrics:{flexDirection:'row',gap:8,marginTop:11},metric:{flex:1,minHeight:70,alignItems:'center',justifyContent:'center',borderRadius:18,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border},metricValue:{fontSize:20,fontWeight:'900'},metricLabel:{color:colors.textMuted,fontSize:8.5,marginTop:3},list:{gap:9},card:{padding:12,borderRadius:radii.lg,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border},top:{flexDirection:'row',alignItems:'center',gap:9},timeBox:{width:54,height:48,alignItems:'center',justifyContent:'center',borderRadius:15,backgroundColor:colors.surfaceElevated},time:{color:colors.cyan,fontSize:13,fontWeight:'900'},info:{flex:1,minWidth:0},customer:{color:colors.white,fontSize:12.5,fontWeight:'900'},service:{color:colors.textMuted,fontSize:9,marginTop:3},note:{color:colors.textMuted,fontSize:9,lineHeight:13,marginTop:9},actions:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:11},greenButton:{minHeight:42,flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,borderRadius:14,backgroundColor:colors.green},pinkButton:{minHeight:42,flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,borderRadius:14,backgroundColor:colors.primary},buttonText:{color:colors.white,fontSize:10,fontWeight:'900'},noShow:{minHeight:42,justifyContent:'center',paddingHorizontal:12,borderRadius:14,backgroundColor:'rgba(255,94,108,0.08)'},noShowText:{color:colors.red,fontSize:10,fontWeight:'900'},activeText:{color:colors.primary,fontSize:9.5,fontWeight:'800',padding:11,backgroundColor:colors.surfaceElevated,borderRadius:14}});
