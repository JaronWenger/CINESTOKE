import React from 'react'
import videoBg from '../assets/Welcome.mp4'

const Main = () => {
  return (
    <div className='main'>
        <div className='overlay'></div>
        <video src={videoBg} autoPlay loop muted />
            <div className='content'>
                <h1>C I N E S T O K E</h1>
            </div>
        <div className='welcome-message'>
        <h2>Welcome</h2>
      </div>
    </div>

  )
}

export default Main