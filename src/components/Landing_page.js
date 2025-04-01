import React from 'react'
import Navbar from './Navbar'
import Landing from './Landing'
import Content from './Content'
import Footer from './Footer'

function Landing_page() {
  return (
    <div>
      <Navbar/>
      <Landing/>
      <Content/>
      <Footer/>
    </div>
  )
}

export default Landing_page