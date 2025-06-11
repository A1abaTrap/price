export interface Farm {
  id: string;
  name: string;
  department: string;
  managerName: string;
  managerPhone: string;
  address: string;
  collectionDate: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  farmId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FarmWithRating extends Farm {
  averageRating: number;
  evaluationCount: number;
}