/**
 * Clerk Token Utility
 * Gets the current Clerk session token
 */

export const getClerkToken = async () => {
    try {
        // Try to get token from Clerk's session
        const res = await fetch('/__clerk/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            const { token } = await res.json();
            return token;
        }
    } catch (error) {
        console.error('Error getting Clerk token:', error);
    }
    
    return null;
};
