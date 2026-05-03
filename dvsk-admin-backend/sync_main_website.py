# sync_main_website.py
import pandas as pd
import requests

# Set your main website API URL here
MAIN_API_URL = "https://your-backend-api.com/api"

print("Fetching data from Main Website...")
# Note: In a real scenario, you would use requests.get() here.
# response = requests.get(f"{MAIN_API_URL}/customers")
# data = response.json()

# Mock data representing what the main website returns
mock_data = {
    "customer_id": [101, 102, 103, 104],
    "name": ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"],
    "email": ["alice@test.com", "bob@test.com", "charlie@test.com", "diana@test.com"],
    "total_spent": [450.00, 0.00, 120.50, 1500.00],
    "source": ["Main Website", "Main Website", "Main Website", "Main Website"]
}

df = pd.DataFrame(mock_data)

# Use Pandas to segment customers automatically for your "Segments" page
def assign_segment(spent):
    if spent > 1000:
        return "VIP"
    elif spent > 0:
        return "Active"
    else:
        return "Inactive"

df['segment'] = df['total_spent'].apply(assign_segment)

print("\n--- Processed Main Website Customers ---")
print(df)

# Export this for your admin panel to use
df.to_csv('main_website_customers.csv', index=False)
print("\nSuccess: Saved main_website_customers.csv")