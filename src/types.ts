export interface ItineraryNode {
  day: number;
  time: string;
  activity: string;
  location: string;
  transport: string;
  dining: { restaurant: string; dishes: string[] };
  cost: number;
  description: string;
}

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface CityData {
  cityName: string;
  routePoints: MapPoint[];
}

export interface ItineraryData {
  title: string;
  accommodation: { name: string; area: string; price: string };
  nodes: ItineraryNode[];
  totalBudget: number;
  cities: CityData[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
