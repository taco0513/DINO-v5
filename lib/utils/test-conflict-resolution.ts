/**
 * Test suite for date conflict resolution system
 * Use this to verify the system works correctly
 */

import { detectDateConflicts, autoResolveConflicts, generateConflictSummary } from './date-conflict-resolver'
import { Stay } from '../types'

// Test data simulating the overlapping stays from the screenshot
export const testOverlappingStays: Stay[] = [
  {
    id: '1',
    countryCode: 'VN', // Vietnam
    entryDate: '2025-07-10',
    exitDate: undefined, // Ongoing
    notes: 'Vietnam ongoing stay'
  },
  {
    id: '2', 
    countryCode: 'KR', // Korea
    entryDate: '2025-07-04',
    exitDate: undefined, // Ongoing
    notes: 'Korea ongoing stay'
  },
  {
    id: '3',
    countryCode: 'TH', // Thailand
    entryDate: '2025-07-01', 
    exitDate: undefined, // Ongoing
    notes: 'Thailand recent ongoing stay'
  },
  {
    id: '4',
    countryCode: 'TH', // Thailand (duplicate)
    entryDate: '2025-06-04',
    exitDate: undefined, // Ongoing
    notes: 'Thailand earlier ongoing stay'
  }
]

export function runConflictResolutionTest() {
  console.log('🧪 Testing Date Conflict Resolution System...\n')
  
  // Step 1: Detect conflicts
  console.log('1️⃣ DETECTING CONFLICTS:')
  const conflicts = detectDateConflicts(testOverlappingStays)
  console.log(`Found ${conflicts.length} conflicts:`)
  
  conflicts.forEach((conflict, i) => {
    console.log(`   ${i + 1}. ${conflict.severity.toUpperCase()} - ${conflict.description}`)
    conflict.stays.forEach(stay => {
      console.log(`      → ${stay.countryCode}: ${stay.entryDate} → ${stay.exitDate || 'Present'}`)
    })
    console.log(`      💡 ${conflict.suggestedResolution}\n`)
  })
  
  // Step 2: Generate summary
  console.log('2️⃣ CONFLICT SUMMARY:')
  const summary = generateConflictSummary(conflicts)
  console.log(`   ${summary}\n`)
  
  // Step 3: Auto-resolve conflicts
  console.log('3️⃣ AUTO-RESOLVING CONFLICTS:')
  const resolvedStays = autoResolveConflicts(testOverlappingStays)
  
  console.log('Original stays:')
  testOverlappingStays.forEach(stay => {
    console.log(`   ${stay.countryCode}: ${stay.entryDate} → ${stay.exitDate || 'Present'}`)
  })
  
  console.log('\nResolved stays:')
  resolvedStays.forEach(stay => {
    const resolved = stay as any
    const status = resolved.autoResolved ? ' [AUTO-FIXED]' : ''
    const originalExit = resolved.originalExitDate ? ` (was: ${resolved.originalExitDate})` : ''
    console.log(`   ${stay.countryCode}: ${stay.entryDate} → ${stay.exitDate || 'Present'}${originalExit}${status}`)
    if (resolved.resolutionReason) {
      console.log(`      📝 ${resolved.resolutionReason}`)
    }
  })
  
  // Step 4: Verify resolution
  console.log('\n4️⃣ VERIFICATION:')
  const remainingConflicts = detectDateConflicts(resolvedStays)
  const remainingSummary = generateConflictSummary(remainingConflicts)
  console.log(`   ${remainingSummary}`)
  
  const criticalRemaining = remainingConflicts.filter(c => c.severity === 'critical')
  if (criticalRemaining.length === 0) {
    console.log('   ✅ All critical conflicts resolved successfully!')
  } else {
    console.log(`   ❌ ${criticalRemaining.length} critical conflicts remain`)
  }
  
  return {
    originalConflicts: conflicts.length,
    resolvedStays,
    remainingConflicts: remainingConflicts.length,
    success: criticalRemaining.length === 0
  }
}

// Additional test cases
export const testCases = {
  // Case 1: Multiple ongoing stays (impossible scenario)
  multipleOngoing: [
    { id: '1', countryCode: 'KR', entryDate: '2025-07-01', exitDate: undefined },
    { id: '2', countryCode: 'JP', entryDate: '2025-07-05', exitDate: undefined },
    { id: '3', countryCode: 'TH', entryDate: '2025-07-10', exitDate: undefined }
  ] as Stay[],
  
  // Case 2: Overlapping fixed-date stays
  overlappingFixed: [
    { id: '1', countryCode: 'KR', entryDate: '2025-06-01', exitDate: '2025-06-15' },
    { id: '2', countryCode: 'JP', entryDate: '2025-06-10', exitDate: '2025-06-25' }
  ] as Stay[],
  
  // Case 3: Duplicate entries in same country
  duplicateEntries: [
    { id: '1', countryCode: 'TH', entryDate: '2025-07-01', exitDate: '2025-07-15', notes: 'First entry' },
    { id: '2', countryCode: 'TH', entryDate: '2025-07-01', exitDate: '2025-07-15', notes: 'Duplicate entry' }
  ] as Stay[],
  
  // Case 4: Valid travel sequence (no conflicts)
  validSequence: [
    { id: '1', countryCode: 'KR', entryDate: '2025-06-01', exitDate: '2025-06-15' },
    { id: '2', countryCode: 'JP', entryDate: '2025-06-16', exitDate: '2025-06-30' },
    { id: '3', countryCode: 'TH', entryDate: '2025-07-01', exitDate: undefined }
  ] as Stay[]
}

// Run all test cases
export function runAllTests() {
  console.log('🧪 COMPREHENSIVE CONFLICT RESOLUTION TESTS\n')
  console.log('=' .repeat(50))
  
  Object.entries(testCases).forEach(([name, stays]) => {
    console.log(`\n📋 TEST CASE: ${name.toUpperCase()}`)
    console.log('-'.repeat(30))
    
    const conflicts = detectDateConflicts(stays)
    const summary = generateConflictSummary(conflicts)
    console.log(`Conflicts: ${summary}`)
    
    if (conflicts.length > 0) {
      const resolved = autoResolveConflicts(stays)
      const remainingConflicts = detectDateConflicts(resolved)
      const remainingSummary = generateConflictSummary(remainingConflicts)
      console.log(`After resolution: ${remainingSummary}`)
    }
  })
  
  console.log('\n' + '='.repeat(50))
  console.log('🎯 MAIN SCENARIO TEST (from screenshot)')
  console.log('=' .repeat(50))
  return runConflictResolutionTest()
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).testConflictResolution = runConflictResolutionTest as any
  (window as any).testAllConflicts = runAllTests as any
  console.log('💡 Run window.testConflictResolution() or window.testAllConflicts() in browser console to test!')
}