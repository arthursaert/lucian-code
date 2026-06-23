export class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      lastGoal: null,
      lastPlan: null,
      executedSteps: [],
      preferences: {},
    };
  }

  update(key, value) {
    if (this.state.hasOwnProperty(key)) {
      this.state[key] = value;
    }
  }

  getSummary() {
    return {
      goal: this.state.lastGoal || "None",
      planSteps: this.state.lastPlan ? this.state.lastPlan.length : 0,
      executedCount: this.state.executedSteps.length,
    };
  }
}
