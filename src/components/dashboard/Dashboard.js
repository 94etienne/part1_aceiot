import { Navigate } from 'react-router-dom';
import ITDirectorDashboard from './ITDirectorDashboard';
import StudentDashboard from './StudentDashboard';
import UnauthorizedAccess from './UnauthorizedAccess';
import { useAuth } from './../../context/authContext';

function Dashboard() {
  const { user } = useAuth(); // Get the current logged user

  // Conditional rendering based on user position
  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if user is not authenticated
  }

  if (user.position === 'IT' || user.position === 'Director') {
    return <ITDirectorDashboard />;
  }

  if (user.position === 'Student') {
    return <StudentDashboard />;
  }

  return <UnauthorizedAccess />; // Render UnauthorizedAccess for users without valid position
}

export default Dashboard;
