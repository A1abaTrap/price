import { Farm, Evaluation } from '../types';

const FARMS_KEY = 'chicken_farms';
const EVALUATIONS_KEY = 'farm_evaluations';

export const storageUtils = {
  // Farm operations
  getFarms(): Farm[] {
    const data = localStorage.getItem(FARMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFarm(farm: Farm): void {
    const farms = this.getFarms();
    const existingIndex = farms.findIndex(f => f.id === farm.id);
    
    if (existingIndex >= 0) {
      farms[existingIndex] = farm;
    } else {
      farms.push(farm);
    }
    
    localStorage.setItem(FARMS_KEY, JSON.stringify(farms));
  },

  deleteFarm(farmId: string): void {
    const farms = this.getFarms().filter(f => f.id !== farmId);
    localStorage.setItem(FARMS_KEY, JSON.stringify(farms));
  },

  // Evaluation operations
  getEvaluations(): Evaluation[] {
    const data = localStorage.getItem(EVALUATIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEvaluation(evaluation: Evaluation): void {
    const evaluations = this.getEvaluations();
    const existingIndex = evaluations.findIndex(e => e.id === evaluation.id);
    
    if (existingIndex >= 0) {
      evaluations[existingIndex] = evaluation;
    } else {
      evaluations.push(evaluation);
    }
    
    localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evaluations));
  },

  getEvaluationsForFarm(farmId: string): Evaluation[] {
    return this.getEvaluations().filter(e => e.farmId === farmId);
  },

  getFarmAverageRating(farmId: string): { average: number; count: number } {
    const evaluations = this.getEvaluationsForFarm(farmId);
    if (evaluations.length === 0) return { average: 0, count: 0 };
    
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
    return {
      average: Math.round((total / evaluations.length) * 10) / 10,
      count: evaluations.length
    };
  }
};