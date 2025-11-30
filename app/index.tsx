import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

import Pill from '../components/pill';

export default function Index() {
  return (
    <View>
      <View>
        <Text style={styles.title}>Let's
          <Text style={title2}> Pill</Text>
        </Text>
      </View>
      <View>
        <Pill />
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
    paddingTop: '1em'
  },
});

const title2 = StyleSheet.compose(styles.title, {
  color: 'plum'
})
