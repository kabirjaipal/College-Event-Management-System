from pymongo import MongoClient

def add_admin_role(collection, email):
    filter = {"email": email}
    update = {"$set": {"role": "admin"}}
    result = collection.update_one(filter, update)

    if result.modified_count > 0:
        print(f"Admin role added to user with email: {email}")
    else:
        print(f"No user found with email: {email}. Admin role not added.")

def remove_admin_role(collection, email):
    filter = {"email": email}
    update = {"$set": {"role": "user"}}
    result = collection.update_one(filter, update)

    if result.modified_count > 0:
        print(f"Admin role removed from user with email: {email}")
    else:
        print(f"No user found with email: {email}. Admin role not removed.")

def main():
    try:
        # Connect to MongoDB
        client = MongoClient("mongodb+srv://sushiljajada9829:UJzbYNQzAfbLfoas@cluster0.cinietq.mongodb.net")
        db = client["razorpay"]
        coll = db["users"]

        # Check if connected to MongoDB
        if client.server_info():
            print("Connected to MongoDB.")
        else:
            print("Failed to connect to MongoDB. Exiting.")
            return

        while True:
            # User menu
            print("\nChoose:")
            print("1. Remove admin from user")
            print("2. Add admin to user")
            print("3. Exit")

            choice = input("Enter your choice (1, 2, or 3): ")

            if choice == "1":
                email = input("Enter user email: ")
                remove_admin_role(coll, email)
            elif choice == "2":
                email = input("Enter user email: ")
                add_admin_role(coll, email)
            elif choice == "3":
                print("Exiting. Goodbye!")
                break
            else:
                print("Invalid choice. Please enter 1, 2, or 3.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
