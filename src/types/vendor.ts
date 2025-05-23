
export interface Vendor {
  id: string; // This will be the Firestore document ID
  userId: string; // To associate with the logged-in user
  name: string;
}

export interface VendorData extends Omit<Vendor, 'id' | 'userId'> {}
