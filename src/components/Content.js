import React from 'react'
import './Content.css';

function Content() {
  return (
    <div className='content'>
        <h1>The Future of Socializing Starts Here</h1>
        <p>Welcome to Just Us, a next-generation social media platform where meaningful conversations come to life. 
            Whether you're catching up with friends, 
            engaging in group discussions, or sharing your thoughts with the world, 
            Just Us is your go-to destination for genuine connections.
        </p>
        <br></br>
        <h1>Why Choose Just Us?</h1>
        <div className='content__features'>
            <list>
                <ul><b>Real-Time Chat –</b>Connect with friends and groups seamlessly.</ul>
                <ul><b>AI-Enhanced Conversations –</b>Get smart suggestions and AI-generated insights.</ul>
                <ul><b>Public & Private Profiles –</b> Customize your privacy settings as you like.</ul>
                <ul><b>Secure & Fast –</b> Your data is encrypted, and performance is our priority.</ul>
                <ul><b>Instagram-Like Experience –</b> Familiar and intuitive design for easy navigation.</ul>
                <ul><b>Range Connect –</b> Connect with people and businesses near you effortlessly.</ul>
                <ul><b>Support for Local Businesses –</b> Discover and engage with nearby businesses to foster community growth.</ul>
                <ul><b>Emergency Assistance –</b> Get immediate help and support in urgent situations.</ul>
                <ul><b>Moments (New Story Feature) –</b> Share your daily highlights and keep your circle updated.</ul>
                <ul><b>Buying & Selling –</b> A marketplace to trade products and services within your community.</ul>
            </list>
            <br></br>
            <list>
                <h1>How It Works</h1>
                <ul><b>Sign Up & Create Your Profile –</b> Choose between a public or private account.</ul>
                <ul><b>Start Conversations –</b> Chat one-on-one or join groups with shared interests.</ul>
                <ul><b>Engage with AI – </b>Use Genze, our built-in AI assistant, for smarter interactions.</ul>
                <ul><b>Share & Explore –</b> Post updates, interact with friends, and discover new content.</ul>
                <ul><b>Utilize Range Connect –</b> Find and communicate with people and businesses nearby.</ul>
                <ul><b>Buy & Sell with Ease – </b>Use our marketplace to trade within your community.</ul>
                <ul><b>Stay Safe with Emergency Support – </b>Get instant help when you need it most.</ul>
            </list>
            <br></br>
            <div className='content-button_div'>
                <button className='content-button'>Start Now</button>
            </div>
        </div>
    </div>
  )
}

export default Content