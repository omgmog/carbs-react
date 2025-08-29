# Carbs 

A modern React TypeScript application for calculating insulin doses based on carbohydrate intake.

## Medical Disclaimer

**This application is for educational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for diabetes management decisions. Insulin dosing errors can be dangerous - verify all calculations independently.**

## About

Carbs React is a diabetes management tool that helps calculate appropriate insulin doses by:

- **Carbohydrate Tracking**: Select from a comprehensive database of foods and specify portion sizes
- **Insulin Dose Calculation**: Automatically calculates bolus insulin doses based on your personal insulin-to-carb ratio (ICR)
- **Blood Glucose Correction**: Factors in current blood glucose levels and insulin sensitivity factor (ISF) for correction doses  
- **Smart Dosing Features**: 
  - Accounts for insulin on board (IOB) to prevent insulin stacking
  - Handles high-fat/protein meals with delayed dosing recommendations
  - Splits large doses for safety and better absorption
  - Provides detailed injection timing plans

## Features

### Food Database

- Library of common foods with accurate carb counts per 100g/100ml
- Organised by categories (staples, fruits, vegetables, etc.)
- Support for both solid foods (grams) and liquids (milliliters)

### Advanced Calculations

- **Meal Bolus**: Primary insulin dose for carbohydrates
- **Correction Bolus**: Additional insulin to correct high blood glucose
- **IOB Adjustment**: Reduces doses when insulin is still active from previous injections
- **High Fat/Protein Handling**: Suggests extended or split dosing for complex meals

### Safety Features

- Maximum single dose limits with automatic splitting
- Clear injection timing recommendations
- Comprehensive tooltips explaining all medical terms
- Warning notes for special considerations (high-GI foods, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- [carbs.omgmog.net](https://carbs.omgmog.net)
