import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authenticatedFetch } from '../services/apiService';
import { EnvelopeIcon, ScaleIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const genderLabel = (gender?: string) => {
  if (!gender) return '—';
  if (gender === 'M') return 'Male';
  if (gender === 'F') return 'Female';
  return gender;
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  children?: React.ReactNode;
}

const InfoRow = ({
  icon,
  label,
  value,
  children,
}: InfoRowProps) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {children ? (
        children
      ) : (
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {value ?? '—'}
        </p>
      )}
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gender: user?.gender || '',
    height: user?.height ? String(user.height) : '',
  });

  const handleEdit = () => {
    setFormData({
      gender: user?.gender || '',
      height: user?.height ? String(user.height) : '',
    });
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits - no decimals, no signs, no letters
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, height: value });
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const heightInt = formData.height === '' ? 0 : parseInt(formData.height, 10);
      
      const response = await authenticatedFetch('/profile', {
        method: 'POST',
        body: JSON.stringify({
          gender: formData.gender,
          height: heightInt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Success - update local state
      updateUser({
        gender: formData.gender,
        height: heightInt,
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left">
      <div className="flex items-center justify-between mb-6 text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 min-w-32 justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden text-left">
        {/* Header / Avatar */}
        <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-10">
          {user?.imageUrl ? (
            <img
              key={`profile-img-${user.id}-${user.imageUrl}`}
              src={user.imageUrl}
              alt={user.name || 'User'}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          {!user?.imageUrl && (
            <div className="w-24 h-24 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-md border-4 border-white dark:border-gray-700">
              <span className="text-3xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          {user?.imageUrl && (
            <div
              className="w-24 h-24 rounded-full bg-indigo-600 dark:bg-indigo-500 items-center justify-center shadow-md border-4 border-white dark:border-gray-700"
              style={{ display: 'none' }}
            >
              <span className="text-3xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name || '—'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.email || '—'}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2">
          <InfoRow
            icon={<EnvelopeIcon className="h-5 w-5" />}
            label="Email"
            value={user?.email}
          />
          <InfoRow
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
            label="Gender"
          >
            {isEditing ? (
              <select
                value={formData.gender}
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none focus:border-indigo-600 py-1 disabled:opacity-50"
              >
                <option value="" className="dark:bg-gray-800">Select Gender</option>
                <option value="F" className="dark:bg-gray-800">Female</option>
                <option value="M" className="dark:bg-gray-800">Male</option>
              </select>
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {genderLabel(user?.gender)}
              </p>
            )}
          </InfoRow>
          <InfoRow
            icon={<ScaleIcon className="h-5 w-5" />}
            label="Height"
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.height}
                  disabled={isSaving}
                  onChange={handleHeightChange}
                  placeholder="Enter height"
                  className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none focus:border-indigo-600 py-1 disabled:opacity-50"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">cm</span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.height ? `${user.height} cm` : '—'}
              </p>
            )}
          </InfoRow>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


