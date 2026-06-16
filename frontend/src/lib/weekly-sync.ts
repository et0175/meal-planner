// WeeklySelectionSyncService — port (COMP-007 / ADR-0005)
// Called by Catalog context when a product or recipe is marked/unmarked for the week.
// The no-op stub here is replaced by the real implementation (COMP-019) in CARD-012.

export interface WeeklySelectionSyncService {
  onProductMarked(userId: string, productId: string, weekStart: Date): Promise<void>;
  onProductUnmarked(userId: string, productId: string, weekStart: Date): Promise<void>;
  onRecipeMarked(userId: string, recipeId: string, weekStart: Date): Promise<void>;
  onRecipeUnmarked(userId: string, recipeId: string, weekStart: Date): Promise<void>;
}

export class NoOpWeeklySelectionSyncService implements WeeklySelectionSyncService {
  async onProductMarked(): Promise<void> {}
  async onProductUnmarked(): Promise<void> {}
  async onRecipeMarked(): Promise<void> {}
  async onRecipeUnmarked(): Promise<void> {}
}

// Composition root — replaced in CARD-012 with the real COMP-019 implementation.
export const weeklySelectionSyncService: WeeklySelectionSyncService =
  new NoOpWeeklySelectionSyncService();
