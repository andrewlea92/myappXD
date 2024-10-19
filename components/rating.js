import React from 'react'; // Ensure React is imported
import { View, StyleSheet, Text } from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';

const CustomRating = ({ title, setRating }) => {
	
	return (
		<View style={styles.rateRow}>
			<Text style={styles.rateText}>{title}</Text>
			<AirbnbRating
				type='star'
				defaultRating={0}
				ratingColor='black'
				ratingBackgroundColor='black'
				showRating={false}
				size={20}
				onFinishRating={setRating}
				// reviewSize={20}
				// ratingContainerStyle={styles.ratingContainer}
			/>
		</View>
	)
}


const styles = StyleSheet.create({
	rateRow: {
    flexDirection: 'row',  // Align items horizontally
    alignItems: 'center',  // Vertically center the items
    margin: '1%',
    justifyContent: 'space-between',  // Adjust spacing between Text and Slider
  },
  rateText: {
    fontSize: 20,
    color: 'black',
		marginRight: '5%'
  },
	ratingContainer: {
    flexDirection: 'row-reverse',
    width: '80%'
  },
})

export default CustomRating;