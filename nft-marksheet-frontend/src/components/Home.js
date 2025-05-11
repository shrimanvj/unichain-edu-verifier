import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Secure Digital Marksheets on Blockchain</h1>
            <p className="hero-subtitle">
              Issue, verify, and manage academic credentials using NFT technology
            </p>
            <div className="hero-buttons">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-primary btn-lg"
              >
                Get Started
              </button>
              <button 
                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} 
                className="btn btn-secondary btn-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Immutable</h3>
              <p>Marksheets are stored on blockchain, making them tamper-proof and permanently verifiable</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Access</h3>
              <p>Access your marksheets anytime, anywhere using your digital wallet</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Instant Verification</h3>
              <p>Verify authenticity instantly using QR codes and blockchain technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Decentralized</h3>
              <p>No central authority needed - powered by Ethereum blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About NFT Marksheet</h2>
              <p>
                NFT Marksheet revolutionizes the way academic credentials are issued and verified. 
                By leveraging blockchain technology and NFTs (Non-Fungible Tokens), we provide a 
                secure, transparent, and efficient solution for educational institutions.
              </p>
              <p>
                Our platform enables institutions to issue digital marksheets that are:
              </p>
              <ul className="about-list">
                <li>Impossible to forge or tamper with</li>
                <li>Instantly verifiable by employers and other institutions</li>
                <li>Always accessible to students</li>
                <li>Environment-friendly (paperless)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Connect Wallet</h3>
              <p>Connect your MetaMask wallet to get started</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Issue or View</h3>
              <p>Institutions can issue marksheets, students can view their credentials</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Share & Verify</h3>
              <p>Share your marksheet's QR code for instant verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join the future of academic credentials</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-primary btn-lg"
            >
              Launch App
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
