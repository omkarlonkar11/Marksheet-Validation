import React, { useEffect, useState } from 'react'

const Home = () => {
    const [loggedInUser , setloggedInUser]=useState('');
    useEffect(() => {
        setloggedInUser(localStorage.getItem('loggedInUser') || ''); 
      }, []);
      
  return (
    <div>
        Hello {loggedInUser}
    </div>
  )
}

export default Home;