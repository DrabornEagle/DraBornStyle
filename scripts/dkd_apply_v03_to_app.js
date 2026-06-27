const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.tsx');
let src = fs.readFileSync(appPath, 'utf8');
let changed = false;

function replaceOnce(search, replace) {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    changed = true;
  }
}

// Login ekrani tekrar PNG asset ile calisir. Native cizim patch'i kapatildi.
replaceOnce(
  "import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';",
  "import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';"
);

if (!src.includes("require('./src/dkd_assets/login_barber_miami.png')")) {
  const nativeLoginRegex = /  if \(!userEmail\) \{[\s\S]*?\n  \}\n\n  return \(/;
  const pngLogin = "  if (!userEmail) {\n    return <SafeAreaProvider><View style={dkd_styles.mockupRoot}><ImageBackground source={require('./src/dkd_assets/login_barber_miami.png')} resizeMode=\"stretch\" style={dkd_styles.mockupImage}><TextInput value={email} onChangeText={setEmail} autoCapitalize=\"none\" keyboardType=\"email-address\" placeholder=\"\" style={[dkd_styles.mockupInput, dkd_styles.mockupEmailInput]} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder=\"\" style={[dkd_styles.mockupInput, dkd_styles.mockupPasswordInput]} /><TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupLoginButton]} onPress={() => loginOrSignup('login')} disabled={loading} /><TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupSignupButton]} onPress={() => loginOrSignup('signup')} disabled={loading} />{status !== 'Barber Studio panel hazır.' ? <Text style={dkd_styles.mockupStatus}>{status}</Text> : null}</ImageBackground></View></SafeAreaProvider>;\n  }\n\n  return (";
  const next = src.replace(nativeLoginRegex, pngLogin);
  if (next !== src) { src = next; changed = true; }
}

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('DraBornStyle PNG login restored.');
} else {
  console.log('DraBornStyle PNG login already active.');
}
