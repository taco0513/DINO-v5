// Backward compatibility layer for user context
// This file is deprecated - use UserContext.tsx for new implementations

import { getCurrentUserEmail, isCurrentUser } from './UserContext'

// Re-export functions for backward compatibility
export { getCurrentUserEmail, isCurrentUser }