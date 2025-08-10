// Quick test for date conflict resolution
// Run with: node test-date-conflict.js

const { detectDateConflicts, autoResolveConflicts } = require('./lib/utils/date-conflict-resolver.ts');

// Simulate your test case: Korea July 1, Vietnam July 10
const testStays = [
  {
    id: '1',
    countryCode: 'KR',
    entryDate: '2024-07-01',
    exitDate: undefined, // Ongoing stay in Korea
    visaType: 'visa-free'
  },
  {
    id: '2', 
    countryCode: 'VN',
    entryDate: '2024-07-10',
    exitDate: undefined, // New entry to Vietnam
    visaType: 'visa-free'
  }
];

console.log('Original stays:');
console.log(JSON.stringify(testStays, null, 2));

console.log('\nDetecting conflicts...');
const conflicts = detectDateConflicts(testStays);
console.log('Conflicts found:', conflicts.length);

if (conflicts.length > 0) {
  console.log('\nAuto-resolving conflicts...');
  const resolved = autoResolveConflicts(testStays);
  console.log('\nResolved stays:');
  console.log(JSON.stringify(resolved, null, 2));
  
  const koreaStay = resolved.find(s => s.countryCode === 'KR');
  const vietnamStay = resolved.find(s => s.countryCode === 'VN');
  
  if (koreaStay && koreaStay.exitDate) {
    console.log(`\n✅ Success! Korea stay automatically ended on ${koreaStay.exitDate}`);
    
    if (vietnamStay && koreaStay.exitDate === vietnamStay.entryDate) {
      console.log('✅ Exit date matches travel day (same as Vietnam entry)');
    } else {
      console.log('⚠️ Exit date does not match travel day');
    }
  }
} else {
  console.log('No conflicts detected');
}