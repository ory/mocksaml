import Link from 'next/link';

export default function Header() {
  return (
    <header className='body-font border-b px-2 text-gray-600'>
      <div className='container mx-auto flex flex-col flex-wrap items-center justify-between space-y-2 py-3 md:flex-row'>
        <Link
          href='https://github.com/boxyhq/mock-saml'
          target='_blank'
          className='title-font flex items-center font-medium text-gray-900 md:mb-0'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            className='h-10 w-10 rounded-full bg-indigo-500 p-2 text-white'
            viewBox='0 0 24 24'>
            <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
          </svg>
          <span className='ml-3 text-2xl'>Mock SAML</span>
        </Link>
        <div className='flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
          <span>
            <a
              className='btn-outline btn-sm btn'
              href='https://github.com/boxyhq/jackson'
              rel='noopener noreferrer'
              target='_blank'>
              Integrate SAML with a few lines of code
            </a>
          </span>
          <span>
            Made with <span className='text-red-500'>&#9829;</span>{' '}
            <a href='https://ory.com' rel='noopener noreferrer' target='_blank'>
              <strong>Ory</strong>
            </a>
          </span>
        </div>
      </div>
    </header>
  );
}
