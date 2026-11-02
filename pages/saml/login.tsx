import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { parseNamespace } from 'lib/namespace';

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default function Login() {
  const router = useRouter();
  const namespace = first(router.query.namespace);
  const acsUrl = first(router.query.acsUrl);
  const spInitiated = Boolean(acsUrl);

  const authUrl = namespace ? `/api/namespace/${namespace}/saml/auth` : '/api/saml/auth';
  const hidden = ['id', 'audience', 'acsUrl', 'providerName', 'relayState']
    .map((name) => [name, first(router.query[name])] as const)
    .filter(([, value]) => value !== undefined);

  const acsUrlInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = spInitiated ? emailInp.current : acsUrlInp.current;
    target?.focus();
    target?.select();
  }, [spInitiated]);

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>

      <div className='flex min-h-screen justify-center bg-white pt-12'>
        <div className='w-full max-w-xl space-y-4 px-3'>
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-6 text-center text-2xl font-semibold text-gray-900'>
              {spInitiated ? 'SAML SSO Login' : 'SAML IdP Login'}
            </h2>

            <form method='POST' action={authUrl}>
              {hidden.map(([name, value]) => (
                <input key={name} type='hidden' name={name} value={value} />
              ))}

              <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
                {!spInitiated && (
                  <div className='col-span-2 space-y-3'>
                    <div>
                      <label htmlFor='acsUrl' className='mb-1 block text-sm font-medium text-gray-700'>
                        ACS URL
                      </label>
                      <input
                        ref={acsUrlInp}
                        name='acsUrl'
                        id='acsUrl'
                        type='url'
                        required
                        autoComplete='off'
                        defaultValue='https://sso.eu.boxyhq.com/api/oauth/saml'
                        className={inputClass}
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        This is where we will post the SAML Response
                      </p>
                    </div>

                    <div>
                      <label htmlFor='audience' className='mb-1 block text-sm font-medium text-gray-700'>
                        Audience
                      </label>
                      <input
                        name='audience'
                        id='audience'
                        type='text'
                        required
                        autoComplete='off'
                        defaultValue='https://saml.boxyhq.com'
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor='username' className='mb-1 block text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    ref={emailInp}
                    name='username'
                    id='username'
                    type='text'
                    required
                    autoComplete='off'
                    defaultValue='jackson'
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor='domain' className='mb-1 block text-sm font-medium text-gray-700'>
                    Domain
                  </label>
                  <select name='domain' id='domain' defaultValue='example.com' className={inputClass}>
                    <option value='example.com'>@example.com</option>
                    <option value='example.org'>@example.org</option>
                  </select>
                </div>

                <div className='col-span-2'>
                  <label htmlFor='password' className='mb-1 block text-sm font-medium text-gray-700'>
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    autoComplete='off'
                    defaultValue='samlstrongpassword'
                    className={inputClass}
                  />
                  <p className='mt-1 text-xs text-gray-500'>Any password works</p>
                </div>

                <button
                  type='submit'
                  className='col-span-2 mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40'>
                  Sign In
                </button>
              </div>
            </form>
          </div>

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

// Server-rendered so the SP-initiated form does not flash the IdP one first.
export const getServerSideProps = (async ({ params }) => {
  if (!parseNamespace(params ?? {}).ok) {
    return { notFound: true };
  }

  return { props: {} };
}) satisfies GetServerSideProps;
