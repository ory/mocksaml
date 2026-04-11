import Link from 'next/link';

export default function Header() {
  return (
    <header className='body-font border-b px-2 text-gray-600'>
      <div className='container mx-auto flex items-center py-3'>
        <Link href='/' className='title-font font-medium text-gray-900'>
          <span className='text-2xl'>Mock SSO</span>
        </Link>
      </div>
    </header>
  );
}
