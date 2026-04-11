import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { TEST_USERS, CignaTestUser } from '../../lib/cigna-auth0/test-users';

export default function CignaAuthorize() {
  const router = useRouter();
  const { redirect_uri, state, client_id } = router.query;

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Please select a test user');
      return;
    }

    const user = TEST_USERS[selectedUser];
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/cigna-auth0/authorize/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser,
          password: user.password,
          redirect_uri: redirect_uri as string,
          state: state as string,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      setError('Network error');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mock Cigna Auth0 Login</title>
      </Head>
      <div className='mx-auto max-w-2xl p-6'>
        <h1 className='mb-2 text-center text-3xl font-bold'>Mock Cigna Auth0 Login</h1>
        <p className='mb-6 text-center text-sm text-gray-500'>
          client_id: {client_id || 'none'} | redirect_uri: {redirect_uri || 'none'}
        </p>

        {error && (
          <div className='alert alert-error mb-4'>
            <span>{error}</span>
          </div>
        )}

        <div className='space-y-3'>
          {Object.entries(TEST_USERS).map(([username, user]: [string, CignaTestUser]) => (
            <div
              key={username}
              className={`card cursor-pointer border-2 bg-base-100 shadow-sm transition-all hover:shadow-md ${
                selectedUser === username ? 'border-primary bg-primary/5' : 'border-base-300'
              }`}
              onClick={() => {
                setSelectedUser(username);
                setError(null);
              }}>
              <div className='card-body p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='card-title text-lg'>
                      {user.given_name} {user.family_name}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      Username: <span className='font-mono'>{username}</span>
                    </p>
                  </div>
                  <div className='text-right text-sm'>
                    <p>
                      <span className='font-semibold'>Employer:</span> {user.employer_name}
                    </p>
                    <p>
                      <span className='font-semibold'>Products:</span>{' '}
                      {user.products.length > 0
                        ? user.products.map((p) => p.split('/').pop()).join(', ')
                        : 'None'}
                    </p>
                  </div>
                </div>
                <div className='mt-1 text-xs text-gray-400'>
                  {user.email} | DOB: {user.birthdate.split('T')[0]} | Sub: {user.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className={`btn btn-primary btn-block mt-6 ${isSubmitting ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={!selectedUser || isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className='mt-6 rounded-lg bg-base-200 p-4'>
          <h3 className='mb-2 font-semibold'>Request Details</h3>
          <pre className='overflow-auto text-xs'>
            {JSON.stringify({ redirect_uri, state, client_id, selectedUser }, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}
