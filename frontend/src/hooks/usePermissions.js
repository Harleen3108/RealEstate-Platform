import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  return {
    canViewAllUsers: ['admin', 'teamlead'].includes(role),
    canMarkInactive: ['admin', 'teamlead'].includes(role),
    canViewAllLeads: ['admin', 'teamlead'].includes(role),
    canUpdatePayment: ['admin', 'teamlead', 'agency'].includes(role),
    canExportCSV: role === 'admin',
    canViewTracker: ['admin', 'teamlead'].includes(role),
    canManageAllProperties: ['admin', 'teamlead'].includes(role),
    canViewAllAnalytics: ['admin', 'teamlead'].includes(role),
    role: role
  };
};
