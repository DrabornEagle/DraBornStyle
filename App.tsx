import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const C = { bg: '#090B12', card: '#151A28', card2: '#1C2232', pink: '#FF4D8D', purple: '#6C63FF', cyan: '#2DD4FF', amber: '#FFB648', white: '#FFF', muted: '#9AA3B8', border: 'rgba(255,255,255,0.08)' };

const services = [
  { title: 'Saç Kesimi', price: 450, icon: 'cut-outline', color: C.pink },
  { title: 'Sakal Tasarım', price: 280, icon: 'sparkles-outline', color: C.purple },
  { title: 'Saç + Sakal', price: 650, icon: 'diamond-outline', color: C.cyan },
  { title: 'Cilt Bakımı', price: 380, icon: 'water-outline', color: '#35E1A1' },
];

const barbers = [
  { name: 'Arda Yılmaz', studio: 'Blade District', area: 'Konyaaltı', rating: 4.9, slot: '16:30', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=700&q=85', cover: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Mert Kaya', studio: 'North Cut Studio', area: 'Lara', rating: 4.8, slot: '17:00', distance: '2.8 km', image: 'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?auto=format&fit=crop&w=700&q=85', cover: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=85' },
];

function Tap({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return <Animated.View style={{ transform: [{ scale }] }}><Pressable style={style} onPress={onPress} onPressIn={() => { Haptics.selectionAsync().catch(() => undefined); Animated.spring(scale, { toValue: .96, useNativeDriver: true }).start(); }} onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}>{children}</Pressable></Animated.View>;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => { const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true }), Animated.timing(pulse, { toValue: 0, duration: 2200, useNativeDriver: true })])); loop.start(); return () => loop.stop(); }, [pulse]);
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <Animated.View style={[s.orb, { transform: [{ translateY: pulse.interpolate({ inputRange: [0,1], outputRange: [0,32] }) }] }]} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}><View><Text style={s.hello}>Merhaba, DrabornEagle 👋</Text><Text style={s.location}>📍 Antalya</Text></View><Tap style={s.bell}><Ionicons name="notifications-outline" size={22} color={C.white} /></Tap></View>
        <LinearGradient colors={[C.pink, '#8B5CF6', C.cyan]} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
          <View style={{ width: '63%', zIndex: 2 }}><Text style={s.heroTag}>BUGÜNE ÖZEL</Text><Text style={s.heroTitle}>Tarzını yenile,{`\n`}sıranı bekleme.</Text><Text style={s.heroText}>Yakındaki en iyi berberleri keşfet ve saatini seç.</Text><Tap style={s.heroButton}><Text style={s.heroButtonText}>Berberleri Keşfet</Text><Ionicons name="arrow-forward" size={16} color={C.pink} /></Tap></View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=700&q=85' }} style={s.heroImage} />
        </LinearGradient>
        <View style={s.sectionHead}><Text style={s.sectionTitle}>Hizmetler</Text><Text style={s.link}>Tümü</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
          {services.map((item) => <Tap key={item.title} style={s.service}><View style={[s.serviceIcon,{backgroundColor:`${item.color}18`}]}><Ionicons name={item.icon as any} size={23} color={item.color} /></View><Text style={s.serviceTitle}>{item.title}</Text><Text style={s.servicePrice}>₺{item.price}</Text></Tap>)}
        </ScrollView>
        <View style={s.sectionHead}><Text style={s.sectionTitle}>Öne çıkan berberler</Text><Text style={s.link}>Yakınımda</Text></View>
        <View style={s.list}>{barbers.map((barber) => <Tap key={barber.name} style={s.barber}><Image source={{uri:barber.cover}} style={s.cover}/><LinearGradient colors={['transparent','rgba(7,9,15,.96)']} style={StyleSheet.absoluteFillObject}/><View style={s.live}><View style={s.liveDot}/><Text style={s.liveText}>Müsait</Text></View><View style={s.barberBottom}><View style={s.barberRow}><Image source={{uri:barber.image}} style={s.avatar}/><View style={{flex:1}}><Text style={s.barberName}>{barber.name}</Text><Text style={s.studio}>{barber.studio} · {barber.area}</Text></View><View><Text style={s.slotLabel}>İlk boş</Text><Text style={s.slot}>{barber.slot}</Text></View></View><View style={s.meta}><Ionicons name="star" size={14} color={C.amber}/><Text style={s.metaStrong}>{barber.rating}</Text><Text style={s.metaText}>· {barber.distance}</Text><View style={{flex:1}}/><View style={s.reserve}><Text style={s.reserveText}>Randevu</Text><Ionicons name="arrow-forward" size={14} color={C.white}/></View></View></View></Tap>)}</View>
        {tab !== 'home' && <View style={s.placeholder}><Ionicons name={tab === 'explore' ? 'compass-outline' : 'person-outline'} size={34} color={C.pink}/><Text style={s.placeholderTitle}>{tab === 'explore' ? 'Keşfet ekranı v0.2’de' : 'Profil ekranı v0.3’te'}</Text><Text style={s.placeholderText}>Bu alan sonraki sürüm için hazırlanıyor.</Text></View>}
        <Text style={s.version}>DraBornStyle v0.1 · Expo SDK 57</Text>
      </ScrollView>
      <View style={s.nav}>{[['home','home','Ana Sayfa'],['explore','compass','Keşfet'],['profile','person','Profil']].map(([key,icon,label])=><Tap key={key} style={[s.navItem,tab===key&&s.navActive]} onPress={()=>setTab(key)}><Ionicons name={(tab===key?icon:`${icon}-outline`) as any} size={22} color={tab===key?C.white:C.muted}/><Text style={[s.navText,tab===key&&{color:C.white}]}>{label}</Text></Tap>)}</View>
    </View>
  );
}

const s=StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},orb:{position:'absolute',width:220,height:220,borderRadius:110,backgroundColor:C.pink,opacity:.1,right:-110,top:40},content:{paddingTop:56,paddingHorizontal:16,paddingBottom:105},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18},hello:{color:C.white,fontSize:20,fontWeight:'900'},location:{color:C.muted,fontSize:12,marginTop:5},bell:{width:46,height:46,borderRadius:18,backgroundColor:C.card,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.border},hero:{height:220,borderRadius:28,padding:20,overflow:'hidden'},heroTag:{alignSelf:'flex-start',color:C.white,fontSize:9,fontWeight:'900',paddingHorizontal:9,paddingVertical:6,borderRadius:999,backgroundColor:'rgba(255,255,255,.15)'},heroTitle:{color:C.white,fontSize:27,lineHeight:32,fontWeight:'900',marginTop:12},heroText:{color:'rgba(255,255,255,.8)',fontSize:11,lineHeight:16,marginTop:6},heroButton:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,backgroundColor:C.white,paddingHorizontal:13,paddingVertical:10,borderRadius:14,marginTop:14},heroButtonText:{color:C.pink,fontSize:11,fontWeight:'900'},heroImage:{position:'absolute',width:170,height:225,right:-18,bottom:-10,borderTopLeftRadius:70},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:24,marginBottom:12},sectionTitle:{color:C.white,fontSize:18,fontWeight:'900'},link:{color:C.pink,fontSize:11,fontWeight:'800'},horizontal:{gap:10},service:{width:112,padding:12,borderRadius:18,backgroundColor:C.card,borderWidth:1,borderColor:C.border},serviceIcon:{width:44,height:44,borderRadius:15,alignItems:'center',justifyContent:'center'},serviceTitle:{color:C.white,fontSize:12,fontWeight:'800',marginTop:10},servicePrice:{color:C.muted,fontSize:11,marginTop:5},list:{gap:13},barber:{height:300,borderRadius:24,overflow:'hidden',backgroundColor:C.card,borderWidth:1,borderColor:C.border},cover:{width:'100%',height:'100%'},live:{position:'absolute',top:14,left:14,flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:7,borderRadius:999,backgroundColor:'rgba(8,10,16,.75)'},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:'#35E1A1'},liveText:{color:C.white,fontSize:10,fontWeight:'800'},barberBottom:{position:'absolute',left:15,right:15,bottom:15,gap:10},barberRow:{flexDirection:'row',alignItems:'center',gap:10},avatar:{width:48,height:48,borderRadius:17,borderWidth:2,borderColor:C.white},barberName:{color:C.white,fontSize:18,fontWeight:'900'},studio:{color:C.muted,fontSize:11,marginTop:2},slotLabel:{color:C.muted,fontSize:9,textAlign:'right'},slot:{color:'#35E1A1',fontSize:17,fontWeight:'900'},meta:{flexDirection:'row',alignItems:'center',gap:5},metaStrong:{color:C.white,fontSize:11,fontWeight:'800'},metaText:{color:C.muted,fontSize:11},reserve:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:12,paddingVertical:8,borderRadius:999,backgroundColor:C.pink},reserveText:{color:C.white,fontSize:10,fontWeight:'900'},placeholder:{marginTop:22,padding:28,borderRadius:24,backgroundColor:C.card,alignItems:'center'},placeholderTitle:{color:C.white,fontSize:16,fontWeight:'900',marginTop:10},placeholderText:{color:C.muted,fontSize:11,marginTop:5},version:{color:'#687087',fontSize:10,textAlign:'center',marginTop:24},nav:{position:'absolute',left:12,right:12,bottom:10,height:70,borderRadius:24,padding:6,backgroundColor:'rgba(18,22,34,.98)',flexDirection:'row',borderWidth:1,borderColor:C.border},navItem:{flex:1,borderRadius:18,alignItems:'center',justifyContent:'center',gap:3},navActive:{backgroundColor:'rgba(255,77,141,.16)'},navText:{color:C.muted,fontSize:10,fontWeight:'700'}
});
