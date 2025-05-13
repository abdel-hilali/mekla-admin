export interface PlatCalories {
  typeUser: string;
  calories: number;
  prix: number;
}

export interface PlatData {
  nomPlat: string;
  description: string;
  ingredient: string;
  photo: string | null;
  typePlat: string;
  platCalories: PlatCalories[];
}

export type Plat = {
    id: number;
    nomPlat: string;
    description: string;
    ingredient: string;
    photo: string;
    typePlat: string;
    platCalories: number | null;
  };

  export type PlatUser = {
    id: number;
    quantite: number;
  };

  export type MenuPlat = {
    id: number;
    user1s: UserPlat[];
    user2s: UserPlat[];
    user3s: UserPlat[];
  };
  
  export type WeekMenu = {
    id: number;
    isPublied : boolean ;
    dateDebut : string ;
    dateFin :string ;
    menuJours : MenuJourDto[];
  };

export interface MenuJourDto {
    id?: number;
    jour: string; // Represents the day of the week as a string (e.g., "LUNDI")
    date: string; // Use string for simplicity, or use Date if you parse it
    platDejeunerId: number | null; // ID of the main lunch dish
    platDinerId: number | null; // ID of the main dinner dish
    alternativesDejeunerIds: number[] | null; // IDs of alternative lunch dishes
    alternativesDinerIds: number[] | null; // IDs of alternative dinner dishes
    entreesJoursIds: number[] | null; // IDs of entrées
    dessertsJoursIds: number[] | null; // IDs of desserts
  }

  
    export interface MealSelection {
        id: number;
        quantity: number;
      }


    
    export interface OrderDay {
      day: string;
      items: OrderItem[];
    }

    export interface DailyOrder {
          date: string;
          platDejeuner: MealSelection | null;
          platDiner: MealSelection | null;
          entrees: MealSelection[];
          desserts: MealSelection[];
          platDejeunerAlt: MealSelection[];
          platDinerAlt: MealSelection[];
        }

    type Address = {
      rue: string;
      ville: string;
      region: string;
      codePostal: number;
    };
    
    type Profile = {
        picture: string;
        name: string;
        firstName: string;
        email: string;
        phone: string;
        age : number;
        sexe : string;
        type : UserType ;
        address: Address;
        hasAllergies : boolean;
        allergies: string;
        code: string;
      };