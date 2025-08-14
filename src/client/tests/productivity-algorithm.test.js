/**
 * Test scenarios for the productivity coin valuation algorithm
 * 
 * Coin Formula: (priority * difficulty * hours) * base_multiplier * efficiency_bonus
 * - base_multiplier = 10
 * - efficiency_bonus = 1.2 if hours <= 1, otherwise 1
 */

// Coin calculation function (duplicated from API for testing)
function calculateCoins(priority, difficulty, hours) {
  const baseMultiplier = 10;
  const efficiencyBonus = hours <= 1 ? 1.2 : 1;
  return Math.round(priority * difficulty * hours * baseMultiplier * efficiencyBonus);
}

// Test scenarios
const testScenarios = [
  // Basic scenarios
  {
    name: "Low priority, low difficulty, quick task",
    priority: 1,
    difficulty: 1,
    hours: 0.5,
    expectedCoins: 6, // 1 * 1 * 0.5 * 10 * 1.2 = 6
  },
  {
    name: "Medium priority, medium difficulty, standard task",
    priority: 3,
    difficulty: 3,
    hours: 2,
    expectedCoins: 180, // 3 * 3 * 2 * 10 * 1 = 180
  },
  {
    name: "High priority, high difficulty, long task",
    priority: 5,
    difficulty: 5,
    hours: 8,
    expectedCoins: 2000, // 5 * 5 * 8 * 10 * 1 = 2000
  },
  {
    name: "High priority, low difficulty, quick task (efficiency bonus)",
    priority: 5,
    difficulty: 2,
    hours: 1,
    expectedCoins: 120, // 5 * 2 * 1 * 10 * 1.2 = 120
  },
  {
    name: "Low priority, high difficulty, medium task",
    priority: 1,
    difficulty: 5,
    hours: 3,
    expectedCoins: 150, // 1 * 5 * 3 * 10 * 1 = 150
  },
  // Edge cases
  {
    name: "Maximum values with efficiency bonus",
    priority: 5,
    difficulty: 5,
    hours: 1,
    expectedCoins: 300, // 5 * 5 * 1 * 10 * 1.2 = 300
  },
  {
    name: "Minimum values",
    priority: 1,
    difficulty: 1,
    hours: 0.1,
    expectedCoins: 1, // 1 * 1 * 0.1 * 10 * 1.2 = 1.2, rounded to 1
  },
  {
    name: "Efficiency threshold boundary (exactly 1 hour)",
    priority: 3,
    difficulty: 3,
    hours: 1,
    expectedCoins: 108, // 3 * 3 * 1 * 10 * 1.2 = 108
  },
  {
    name: "Just over efficiency threshold",
    priority: 3,
    difficulty: 3,
    hours: 1.1,
    expectedCoins: 99, // 3 * 3 * 1.1 * 10 * 1 = 99
  },
];

// Productivity analysis scenarios
const productivityScenarios = [
  {
    name: "High productivity day",
    tasks: [
      { priority: 5, difficulty: 4, hours: 0.5 }, // Quick critical task: 5*4*0.5*10*1.2 = 120
      { priority: 4, difficulty: 3, hours: 1 },   // Important task with bonus: 4*3*1*10*1.2 = 144
      { priority: 3, difficulty: 2, hours: 2 },   // Standard task: 3*2*2*10*1 = 120
    ],
    expectedTotalCoins: 120 + 144 + 120, // 384 total
    expectedEfficiency: 3 / 3.5, // tasks per hour
  },
  {
    name: "Balanced productivity day",
    tasks: [
      { priority: 3, difficulty: 3, hours: 2 },
      { priority: 2, difficulty: 4, hours: 3 },
      { priority: 4, difficulty: 2, hours: 1.5 },
    ],
    expectedTotalCoins: 180 + 240 + 120, // 540 total
    expectedEfficiency: 3 / 6.5,
  },
  {
    name: "Focus on difficult tasks",
    tasks: [
      { priority: 5, difficulty: 5, hours: 4 },
      { priority: 4, difficulty: 5, hours: 2 },
    ],
    expectedTotalCoins: 1000 + 400, // 1400 total
    expectedEfficiency: 2 / 6,
  },
];

// Run tests
console.log("=== Coin Calculation Algorithm Tests ===\n");

testScenarios.forEach((scenario, index) => {
  const actualCoins = calculateCoins(scenario.priority, scenario.difficulty, scenario.hours);
  const passed = actualCoins === scenario.expectedCoins;
  
  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(`  Input: P=${scenario.priority}, D=${scenario.difficulty}, H=${scenario.hours}`);
  console.log(`  Expected: ${scenario.expectedCoins} coins`);
  console.log(`  Actual: ${actualCoins} coins`);
  console.log(`  Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log("");
});

console.log("=== Productivity Scenario Tests ===\n");

productivityScenarios.forEach((scenario, index) => {
  let totalCoins = 0;
  let totalHours = 0;
  
  scenario.tasks.forEach(task => {
    totalCoins += calculateCoins(task.priority, task.difficulty, task.hours);
    totalHours += task.hours;
  });
  
  const efficiency = scenario.tasks.length / totalHours;
  
  const coinsMatch = totalCoins === scenario.expectedTotalCoins;
  const efficiencyMatch = Math.abs(efficiency - scenario.expectedEfficiency) < 0.01;
  
  console.log(`Scenario ${index + 1}: ${scenario.name}`);
  console.log(`  Tasks: ${scenario.tasks.length}`);
  console.log(`  Total Hours: ${totalHours}`);
  console.log(`  Total Coins: ${totalCoins} (expected: ${scenario.expectedTotalCoins}) ${coinsMatch ? "✅" : "❌"}`);
  console.log(`  Efficiency: ${efficiency.toFixed(3)} (expected: ${scenario.expectedEfficiency.toFixed(3)}) ${efficiencyMatch ? "✅" : "❌"}`);
  console.log("");
});

console.log("=== Algorithm Insights ===\n");

console.log("1. Efficiency Bonus:");
console.log("   - Tasks completed in ≤1 hour get 20% bonus");
console.log("   - Encourages breaking down large tasks");
console.log("   - Rewards quick execution");

console.log("\n2. Priority & Difficulty Scaling:");
console.log("   - Linear multiplication encourages high-value tasks");
console.log("   - Priority 5 + Difficulty 5 = 25x multiplier");
console.log("   - Priority 1 + Difficulty 1 = 1x multiplier");

console.log("\n3. Time Investment:");
console.log("   - Direct correlation with time spent");
console.log("   - Balances quick wins vs substantial work");
console.log("   - No diminishing returns on longer tasks");

console.log("\n4. Optimal Strategies:");
console.log("   - Focus on high priority tasks");
console.log("   - Break large tasks into ≤1 hour chunks for bonus");
console.log("   - Balance difficulty based on skill level");
console.log("   - Aim for consistent daily completion rate");

module.exports = { calculateCoins, testScenarios, productivityScenarios };