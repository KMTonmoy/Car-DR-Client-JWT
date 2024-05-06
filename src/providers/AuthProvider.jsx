import { createContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "../firebase/firebase.config";
import axios from "axios";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to create a new user
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Function to sign in existing user
    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Function to log out user
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                // If user is logged in, get JWT token
                const loggedUser = { email: currentUser.email };
                axios.post("http://localhost:5000/jwt", loggedUser, { withCredentials: true })
                    .then(res => {
                        console.log("token Response", res.data)
                    })
                    .catch(error => {
                        console.error("Error fetching JWT token:", error);
                    });
            }
        });
        // Unsubscribe from the listener when component unmounts
        return unsubscribe;
    }, []);

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        logOut
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
