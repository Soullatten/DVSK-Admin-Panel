import pandas as pd
import json

# Example: Read products from a JSON file (simulating an API response or database dump)
# and convert it to a CSV for admin purposes

data = {
    "product_id": [1, 2, 3, 4],
    "name": ["Hoodie", "T-Shirt", "Jacket", "Cap"],
    "price": [59.99, 29.99, 120.00, 19.99],
    "stock": [15, 42, 8, 100],
    "status": ["Active", "Active", "Low Stock", "Active"]
}

df = pd.DataFrame(data)

# Data Analysis with Pandas
total_inventory_value = (df['price'] * df['stock']).sum()
print(f"Total Inventory Value: ${total_inventory_value:.2f}")

low_stock_items = df[df['stock'] < 10]
print("Low Stock Items:\n", low_stock_items)

# Export to CSV for admin download
df.to_csv('admin_inventory_report.csv', index=False)
print("Saved inventory report to admin_inventory_report.csv")