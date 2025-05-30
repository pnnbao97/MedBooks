import { Session } from 'next-auth'
import React from 'react'

const Header = () => {
  return (
    <header className='admin-header'>
        <div>
            <h2 className='text-dark-400 font-semibold text-2xl'>
                {/* {session?.user?.name} */}
            </h2>
            <p className='text-slate-500 text-base'>
                Admin
            </p>
        </div>
        {/* <p>
            Search
        </p> */}
    </header>
  );
};

export default Header;