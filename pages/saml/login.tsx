import Head from 'next/head';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const { id, audience, acsUrl, providerName, relayState, namespace } = router.query;

  const authUrl = namespace ? `/api/namespace/${namespace}/saml/auth` : '/api/saml/auth';
  const [state, setState] = useState({
    username: 'jackson',
    domain: 'example.com',
    acsUrl: 'https://sso.eu.boxyhq.com/api/oauth/saml',
    audience: 'https://saml.boxyhq.com',
  });

  const acsUrlInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (acsUrl && emailInp.current) {
      emailInp.current.focus();
      emailInp.current.select();
    } else if (acsUrlInp.current) {
      acsUrlInp.current.focus();
      acsUrlInp.current.select();
    }
  }, [acsUrl]);

  const handleChange = (e: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, domain } = state;

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `${username}@${domain}`,
        id,
        audience: audience || state.audience,
        acsUrl: acsUrl || state.acsUrl,
        providerName,
        relayState,
      }),
    });

    if (response.ok) {
      const newDoc = document.open('text/html', 'replace');
      newDoc.write(await response.text());
      newDoc.close();
    } else {
      document.write('Error in getting SAML response');
    }
  };

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>

      <div className='flex min-h-screen justify-center bg-white pt-12'>
        <div className='w-full max-w-xl px-3 space-y-4'>
          {/* Card */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-6 text-center text-2xl font-semibold text-gray-900'>
              {!acsUrl ? 'SAML IdP Login' : 'SAML SSO Login'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
                {!acsUrl && (
                  <div className='col-span-2 space-y-3'>
                    <div>
                      <label className='block mb-1 text-sm font-medium text-gray-700'>ACS URL</label>
                      <input
                        ref={acsUrlInp}
                        name='acsUrl'
                        id='acsUrl'
                        type='text'
                        autoComplete='off'
                        value={state.acsUrl}
                        onChange={handleChange}
                        placeholder='https://sso.eu.boxyhq.com/api/oauth/saml'
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        This is where we will post the SAML Response
                      </p>
                    </div>

                    <div>
                      <label className='block mb-1 text-sm font-medium text-gray-700'>Audience</label>
                      <input
                        name='audience'
                        id='audience'
                        type='text'
                        autoComplete='off'
                        value={state.audience}
                        onChange={handleChange}
                        placeholder='https://saml.boxyhq.com'
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Email</label>
                  <input
                    ref={emailInp}
                    name='username'
                    id='username'
                    type='text'
                    autoComplete='off'
                    value={state.username}
                    onChange={handleChange}
                    placeholder='jackson'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                  />
                </div>

                <div>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Domain</label>
                  <select
                    name='domain'
                    id='domain'
                    value={state.domain}
                    onChange={handleChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'>
                    <option value='example.com'>@example.com</option>
                    <option value='example.org'>@example.org</option>
                  </select>
                </div>

                <div className='col-span-2'>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Password</label>
                  <input
                    id='password'
                    type='password'
                    autoComplete='off'
                    defaultValue='samlstrongpassword'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                  />
                  <p className='mt-1 text-xs text-gray-500'>Any password works</p>
                </div>

                <button
                  type='submit'
                  className='col-span-2 mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40'>
                  Sign In
                </button>
              </div>
            </form>
          </div>

          {/* Info box */}
          <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
            <p className='text-sm text-blue-900'>
              This is a simulated login screen. You may choose any username, but only the domains{' '}
              <code className='font-mono'>example.com</code> and{' '}
              <code className='font-mono'>example.org</code> are allowed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
