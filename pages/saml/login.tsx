import Head from 'next/head';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import config from 'lib/env';

type Attribute = { key: number; name: string; value: string };

type Props = {
  defaultAttributes: Omit<Attribute, 'key'>[];
  defaultAudience: string;
};


export default function Login({ defaultAttributes, defaultAudience }: Props) {
  const router = useRouter();
  const { id, audience, acsUrl, providerName, relayState, namespace } = router.query;

  const authUrl = namespace ? `/api/namespace/${namespace}/saml/auth` : '/api/saml/auth';
  const nextKey = useRef(defaultAttributes.length);
  const [state, setState] = useState({
    username: 'jackson',
    domain: 'example.com',
    acsUrl: 'https://sso.eu.boxyhq.com/api/oauth/saml',
    audience: defaultAudience,
  });
  const [attributes, setAttributes] = useState<Attribute[]>(
    defaultAttributes.map((a, i) => ({ ...a, key: i }))
  );
  const [newAttr, setNewAttr] = useState({ name: '', value: '' });

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

  const handleAttrChange = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const handleAttrRemove = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttrAdd = () => {
    if (!newAttr.name) return;
    setAttributes((prev) => [...prev, { ...newAttr, key: nextKey.current++ }]);
    setNewAttr({ name: '', value: '' });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, domain } = state;
    const email = `${username}@${domain}`;

    const resolvedAttributes = attributes.map(({ name, value }) => ({ name, value }));

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        id,
        audience: audience || state.audience,
        acsUrl: acsUrl || state.acsUrl,
        providerName,
        relayState,
        attributes: resolvedAttributes,
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

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30';

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>

      <div className='flex min-h-screen justify-center bg-white pt-12'>
        <div className='w-full max-w-xl px-3 space-y-4'>
          {/* Card */}
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
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
                        className={inputClass}
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
                        className={inputClass}
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
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Domain</label>
                  <select
                    name='domain'
                    id='domain'
                    value={state.domain}
                    onChange={handleChange}
                    className={inputClass}>
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
                    className={inputClass}
                  />
                  <p className='mt-1 text-xs text-gray-500'>Any password works</p>
                </div>

                {/* Attributes section */}
                <div className='col-span-2 space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>Attributes</label>

                  {attributes.map((attr, i) => (
                    <div key={attr.key} className='flex gap-2 items-center'>
                      <input
                        type='text'
                        value={attr.name}
                        onChange={(e) => handleAttrChange(i, 'name', e.target.value)}
                        placeholder='name'
                        className='w-2/5 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                      />
                      <input
                        type='text'
                        value={attr.value}
                        onChange={(e) => handleAttrChange(i, 'value', e.target.value)}
                        placeholder='value'
                        className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                      />
                      <button
                        type='button'
                        onClick={() => handleAttrRemove(i)}
                        className='shrink-0 rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-500 hover:bg-gray-100'>
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add row */}
                  <div className='flex gap-2 items-center'>
                    <input
                      type='text'
                      value={newAttr.name}
                      onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                      placeholder='name'
                      className='w-2/5 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                    />
                    <input
                      type='text'
                      value={newAttr.value}
                      onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })}
                      placeholder='value'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAttrAdd();
                        }
                      }}
                      className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                    />
                    <button
                      type='button'
                      onClick={handleAttrAdd}
                      disabled={!newAttr.name}
                      className='shrink-0 rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40'>
                      +
                    </button>
                  </div>
                </div>

                <button
                  type='submit'
                  className='col-span-2 mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40'>
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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const defaultAttributes = Object.entries(config.extraAttributes).map(([name, value]) => ({
    name,
    value,
  }));
  return { props: { defaultAttributes, defaultAudience: config.audience } };
};
