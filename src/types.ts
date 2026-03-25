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

export interface ItineraryData {
  title: string;
  accommodation: { name: string; area: string; price: string };
  nodes: ItineraryNode[];
  totalBudget: number;
  routePoints: { lat: number; lng: number; label: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
