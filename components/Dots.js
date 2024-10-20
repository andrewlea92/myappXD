import { StyleSheet, View} from 'react-native';


const Dots = (activeIdx, totalIdx) => {

	const items = Array(totalIdx)
	return (
		<View style={styles.dotsContainer}>
			{items.map((_, index) => (
				<View
					key={index}
					style={[
						styles.dot,
						index === activeIdx ? styles.activeDot : styles.inactiveDot,
					]}
				/>
			))}
		</View>
	);
};


const styles = StyleSheet.create({
	dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%', // Ensure distance from squareFocusArea
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
})


export default Dots;