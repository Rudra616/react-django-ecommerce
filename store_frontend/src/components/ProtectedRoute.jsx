// components/ProtectedRoute.js
import { useContext, useEffect } from 'react';
import AuthContext, { useAuth } from '../context/AuthContext';
import { refreshAccessToken } from '../apis';



const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    console.log("1")
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoggedIn(false);
                console.log("3")
                return;
            }

            try {
                const decoded = jwt_decode(token);
                const now = Date.now() / 1000;

                if (decoded.exp < now) {
                    const newToken = await refreshAccessToken();
                    setIsLoggedIn(!!newToken);
                } else {
                    setIsLoggedIn(true);
                }
            } catch (err) {
                setIsLoggedIn(false);
            }
        };

        verifyAuth();
    }, [setIsLoggedIn]);

    if (!isLoggedIn) {
        console.log("3")

        return <div>Redirecting to login...</div>;
    }
    console.log("4")

    return children;
};

export default ProtectedRoute;