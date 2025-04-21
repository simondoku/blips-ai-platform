// client/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if user is already logged in with Supabase
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          
          // Get user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          // Combine auth data with profile data
          const userData = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.email.split('@')[0],
            displayName: profile?.display_name || profile?.username || user.email.split('@')[0],
            profileImage: profile?.profile_image || null
          };
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user } = session;
          
          // Get user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          // Combine auth data with profile data
          const userData = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.email.split('@')[0],
            displayName: profile?.display_name || profile?.username || user.email.split('@')[0],
            profileImage: profile?.profile_image || null
          };
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  // Register a new user
  const register = async ({ email, password, username, displayName }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Register with Supabase auth and add metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName || username
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Instead of manually creating a profile, use a database trigger
      // We'll let Supabase handle profile creation via a trigger
      
      return data;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // No need to set currentUser here - the onAuthStateChange listener will handle it
      
      return data;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // No need to clear currentUser here - the onAuthStateChange listener will handle it
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      
      let profileImageUrl = currentUser.profileImage;
      
      // Handle profile image upload if it's a file
      if (profileData.profileImage instanceof File) {
        const fileExt = profileData.profileImage.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileData.profileImage);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        profileImageUrl = urlData.publicUrl;
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username: profileData.username || currentUser.username,
          display_name: profileData.displayName || currentUser.displayName,
          profile_image: profileImageUrl,
          updated_at: new Date()
        })
        .eq('id', currentUser.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      const updatedUser = {
        ...currentUser,
        username: profileData.username || currentUser.username,
        displayName: profileData.displayName || currentUser.displayName,
        profileImage: profileImageUrl
      };
      
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;