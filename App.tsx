declare const require: (dkd_module_name: string) => any;

const dkd_React = require('react');
const dkd_react_native = require('react-native');

const dkd_SafeAreaView = dkd_react_native.SafeAreaView;
const dkd_Text = dkd_react_native.Text;
const dkd_View = dkd_react_native.View;
const dkd_StyleSheet = dkd_react_native.StyleSheet;

function dkd_DraBornStyleApp() {
  return dkd_React.createElement(
    dkd_SafeAreaView,
    { style: dkd_styles.dkd_safe_area },
    dkd_React.createElement(
      dkd_View,
      { style: dkd_styles.dkd_card },
      dkd_React.createElement(dkd_Text, { style: dkd_styles.dkd_title }, 'DraBornStyle v0.1'),
      dkd_React.createElement(dkd_Text, { style: dkd_styles.dkd_text }, 'Mobil başlangıç hazır. Sıradaki adım rol seçimi ekranı.')
    )
  );
}

const dkd_styles = dkd_StyleSheet.create({
  dkd_safe_area: {
    flex: 1,
    backgroundColor: '#080B16',
    justifyContent: 'center',
    padding: 22
  },
  dkd_card: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22
  },
  dkd_title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 14
  },
  dkd_text: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24
  }
});

export default dkd_DraBornStyleApp;
