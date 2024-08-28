export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  image_path: string;
  created_at: string;
  public_url: string | null;
  imageUrl?: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  top_id: string | null;
  bottom_id: string | null;
  dress_id: string | null;
  shoes_id: string | null;
  accessory1_id: string | null;
  accessory2_id: string | null;
  accessory3_id: string | null;
  created_at: string;
}
