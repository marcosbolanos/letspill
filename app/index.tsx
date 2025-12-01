import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

import Blister from '../components/blister';

export default function Index() {
  const now = new Date();
  return (
    <View style={styles.mainView}>
      <View>
        <Text style={styles.title}>Let's
          <Text style={title2}> Pill</Text>
        </Text>
      </View>
      <View style={styles.blister}>
        <Blister startDate={now} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter 18pt Black',
    fontSize: '3rem',
    textAlign: 'center',
    // @ts-ignore
    fontWeight: 'bold',
    marginBottom: '2rem'
  },
  blister: {
    marginHorizontal: '1rem',
    marginVertical: '1rem',
    maxHeight: '80%',
    maxWidth: '100%',
  },
  mainView: {
    backgroundColor: 'beige',
    maxHeight: '100%',
    padding: '2rem',
    flex: 1
  }
});

const title2 = StyleSheet.compose(styles.title, {
  color: 'plum'
})
