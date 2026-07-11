import xlsxwriter

def generate_test_data():
    workbook = xlsxwriter.Workbook('property_test_data.xlsx')
    worksheet = workbook.add_worksheet()

    # Define headers
    headers = [
        'title', 'propertyType', 'transactionType', 'price', 'priceNegotiable', 
        'address', 'city', 'state', 'pincode', 'areaSqft', 'bedrooms', 'bathrooms', 
        'amenities', 'internalNotes'
    ]

    # Write headers
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)

    # Test Data Rows
    data = [
        # Standard valid rows
        ['Luxury Villa in Jubilee Hills', 'VILLA', 'SALE', 85000000, 'true', 'Plot 45, Road 10', 'Hyderabad', 'Telangana', '500033', 4500, 4, 4, 'Pool, Gym, Garden', 'Premium client'],
        ['Compact Apartment near Metro', 'APARTMENT', 'RENT', 45000, 'false', 'Metro Residency, Flat 202', 'Bangalore', 'Karnataka', '560001', 1200, 2, 2, 'Power Backup, Security', 'Quick move-in'],
        
        # Case sensitivity and Enum variations (should be handled by my UPPERCASE logic)
        ['Modern Office Space', 'commercial', 'Lease', 150000, 'true', 'Business Hub, Level 5', 'Mumbai', 'Maharashtra', '400001', 2500, 0, 2, 'AC, Fiber Internet', 'IT Park'],
        ['Large Farm Land', 'agricultural', 'sale', 12000000, 'true', 'Survey No 120', 'Pune', 'Maharashtra', '411001', 43560, None, None, 'Water Connection', 'Fertile soil'],
        
        # Edge Case: Missing optional fields (area, bedrooms, etc)
        ['Residential Plot - Phase 2', 'PLOT', 'SALE', 3500000, 'true', 'Sector 15', 'Gurugram', 'Haryana', '122001', 1800, None, None, None, 'East facing'],
        
        # Edge Case: Extremely high price
        ['Ultra Luxury Penthouse', 'APARTMENT', 'SALE', 250000000, 'false', 'Skyline Towers, 40th Floor', 'Mumbai', 'Maharashtra', '400018', 6500, 5, 5, 'Private Elevator, Pool', 'HNIs only'],
        
        # Edge Case: Minimum data (Checking my "N/A" fallbacks)
        ['Basic Plot', 'PLOT', 'SALE', None, None, None, None, None, None, None, None, None, None, 'Minimal info row'],
        
        # Row with deliberate errors (to test partial success and error reporting)
        [None, 'INVALID_TYPE', 'SALE', 'not-a-number', 'maybe', 'Missing info', None, None, None, 'huge', 'five', 'six', 'None', 'Should fail and report errors'],
        
        # Long Title and Descriptions
        ['Very ' * 20 + 'Long Title Property', 'VILLA', 'SALE', 10000000, 'true', 'Address here', 'Chennai', 'Tamil Nadu', '600001', 3000, 3, 3, 'A, B, C', 'Notes ' * 50],

        # Mix of valid and invalid
        ['Valid Row After Error', 'VILLA', 'SALE', 5000000, 'true', 'Street 1', 'Noida', 'UP', '201301', 2000, 3, 2, 'Gym', 'Testing recovery'],
    ]

    # Write data
    for row_idx, row_data in enumerate(data):
        for col_idx, cell_value in enumerate(row_data):
            worksheet.write(row_idx + 1, col_idx, cell_value)

    workbook.close()
    print("Test file 'property_test_data.xlsx' generated successfully.")

if __name__ == "__main__":
    generate_test_data()
