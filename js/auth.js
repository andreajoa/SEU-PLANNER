// Initialize Supabase client
// Note: In a real application, you would use the actual Supabase client
// For this demo, we'll create a mock implementation since we don't have real credentials

let supabase = {
    auth: {
        signUp: async (credentials) => {
            // Mock signup implementation
            console.log('Mock signup:', credentials);
            return { data: { user: { id: 'mock-user-id', email: credentials.email } }, error: null };
        },
        signInWithPassword: async (credentials) => {
            // Mock login implementation
            console.log('Mock login:', credentials);
            return { data: { user: { id: 'mock-user-id', email: credentials.email } }, error: null };
        },
        signInWithOAuth: async (provider) => {
            // Mock OAuth implementation
            console.log('Mock OAuth:', provider);
        },
        signOut: async () => {
            // Mock logout implementation
            console.log('Mock logout');
            localStorage.removeItem('planner_user');
            return { error: null };
        },
        onAuthStateChange: (callback) => {
            // Mock auth state change
            console.log('Mock auth state change listener');
            return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getUser: async () => {
            // Mock get user
            const user = localStorage.getItem('planner_user');
            if (user) {
                return { data: { user: JSON.parse(user) }, error: null };
            }
            return { data: { user: null }, error: null };
        }
    },
    from: (table) => {
        // Mock database operations
        return {
            insert: (data) => {
                console.log('Mock insert into', table, data);
                return { error: null };
            },
            update: (data) => {
                console.log('Mock update in', table, data);
                return { error: null };
            },
            eq: (column, value) => {
                console.log('Mock query where', column, '=', value);
                return { error: null };
            }
        };
    }
};

// Function to initialize Supabase with real credentials if provided
function initSupabase() {
    // Check if we have environment variables or config
    const config = localStorage.getItem('supabase_config');
    if (config) {
        const { url, key } = JSON.parse(config);
        if (url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key') {
            // Use real Supabase client
            supabase = createClient(url, key);
        }
    }
}

// Authentication functions
async function signUp(email, password, name) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) throw error;

        // Store user info in localStorage for immediate use
        if (data.user) {
            const userInfo = {
                id: data.user.id,
                email: data.user.email,
                name: name || data.user.email.split('@')[0],
                level: 1,
                xp: 0,
                streak: 0,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('planner_user', JSON.stringify(userInfo));
        }

        return { success: true, data };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Store user info in localStorage for immediate use
        if (data.user) {
            // Get additional user data from our local storage or database
            let userInfo = localStorage.getItem('planner_user');
            if (userInfo) {
                userInfo = JSON.parse(userInfo);
                userInfo.id = data.user.id;
                userInfo.email = data.user.email;
            } else {
                userInfo = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.email.split('@')[0],
                    level: 1,
                    xp: 0,
                    streak: 0
                };
            }
            localStorage.setItem('planner_user', JSON.stringify(userInfo));
        }

        return { success: true, data };
    } catch (error) {
        console.error('Signin error:', error);
        return { success: false, error: error.message };
    }
}

async function signInWithOAuth(provider) {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('OAuth signin error:', error);
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // Clear local storage
        localStorage.removeItem('planner_user');
        localStorage.removeItem('planner_current_view');
        
        return { success: true };
    } catch (error) {
        console.error('Signout error:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const user = localStorage.getItem('planner_user');
    return user !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('planner_user');
    return user ? JSON.parse(user) : null;
}

// Update user profile
async function updateUserProfile(updates) {
    try {
        const user = getCurrentUser();
        if (!user) return { success: false, error: 'No user logged in' };

        // Update local storage
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('planner_user', JSON.stringify(updatedUser));

        // In a real app, also update the database
        // const { error } = await supabase
        //     .from('users')
        //     .update(updates)
        //     .eq('id', user.id);

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: error.message };
    }
}

// Initialize auth system
function initAuth() {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
        console.log('User is already logged in:', user.email);
    }
    
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
            // User signed in
            console.log('User signed in');
        } else if (event === 'SIGNED_OUT') {
            // User signed out
            console.log('User signed out');
            localStorage.removeItem('planner_user');
        }
    });
}

// Initialize the auth system when the module loads
initAuth();

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        isAuthenticated,
        getCurrentUser,
        updateUserProfile,
        initAuth
    };
}