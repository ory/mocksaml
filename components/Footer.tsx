export default function Footer() {
  return (
    <footer className='body-font text-gray-600'>
      <div className='container mx-auto flex flex-col items-center px-5 py-8 sm:flex-row'>
        <a className='title-font flex items-center justify-center font-medium text-gray-900 md:justify-start'>
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
          <span className='ml-3 text-xl'>Mock SAML</span>
        </a>
        <p className='mt-4 text-sm text-gray-500 sm:ml-4 sm:mt-0 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:pl-4'>
          Powered by
          <a href='https://ory.com' className='ml-1 text-gray-600' rel='noopener noreferrer' target='_blank'>
            <strong>Ory</strong>
          </a>
        </p>
      </div>
    </footer>
  );
}
