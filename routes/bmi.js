const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('bmi', { error: null });
});

router.post('/calculate', (req, res) => {
    try {
        let { weight, height } = req.body;
        
        // Convert to numbers and validate inputs
        weight = parseFloat(weight);
        height = parseFloat(height);

        // Validate weight (reasonable range: 20kg to 500kg)
        if (isNaN(weight) || weight < 20 || weight > 500) {
            throw new Error('Please enter a valid weight between 20 and 500 kg');
        }

        // Validate height (reasonable range: 0.5m to 3m)
        if (isNaN(height) || height < 0.5 || height > 3) {
            throw new Error('Please enter a valid height between 0.5 and 3 meters');
        }

        // Calculate BMI with two decimal precision
        const bmi = (weight / (height * height)).toFixed(2);
        let category;

        // Determine BMI category
        if (bmi < 18.5) {
            category = 'Underweight';
        } else if (bmi < 24.9) {
            category = 'Normal weight';
        } else if (bmi < 29.9) {
            category = 'Overweight';
        } else {
            category = 'Obese';
        }

        // Add health recommendations based on category
        let recommendations = [];
        if (bmi < 18.5) {
            recommendations = [
                'Consider increasing your caloric intake',
                'Include protein-rich foods in your diet',
                'Consult with a healthcare provider'
            ];
        } else if (bmi < 24.9) {
            recommendations = [
                'Maintain your current healthy lifestyle',
                'Regular exercise',
                'Balanced diet'
            ];
        } else if (bmi < 29.9) {
            recommendations = [
                'Increase physical activity',
                'Monitor portion sizes',
                'Include more fruits and vegetables'
            ];
        } else {
            recommendations = [
                'Consult with a healthcare provider',
                'Develop a structured exercise routine',
                'Consider working with a nutritionist'
            ];
        }

        res.render('bmi', { 
            bmi: parseFloat(bmi), 
            category, 
            recommendations,
            weight,
            height,
            error: null 
        });
    } catch (error) {
        res.render('bmi', { 
            error: error.message,
            weight: req.body.weight,
            height: req.body.height
        });
    }
});

module.exports = router;