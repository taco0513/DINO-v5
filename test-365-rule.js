// Test script to verify 365-day rolling window rule for Korea
const { getAvailableVisaTypes } = require('./lib/visa-rules/visa-types.ts')
const { getVisaRules } = require('./lib/visa-rules/nationality-rules.ts')

// Test for zbrianjin@gmail.com
console.log('Testing visa types for Korea with zbrianjin@gmail.com:')
const visaTypes = getAvailableVisaTypes('KR', 'US', 'zbrianjin@gmail.com')
console.log(JSON.stringify(visaTypes, null, 2))

// Test visa rules for long-term resident
console.log('\nTesting visa rules for long-term resident:')
const rule = getVisaRules('US', 'KR', 'long-term-resident', 'zbrianjin@gmail.com')
console.log(JSON.stringify(rule, null, 2))

// Test for different user (should not have the option)
console.log('\nTesting visa types for Korea with different user:')
const otherUserTypes = getAvailableVisaTypes('KR', 'US', 'other@example.com')
console.log(JSON.stringify(otherUserTypes, null, 2))