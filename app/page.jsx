"use client"

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

const Home = () => {
  const [val, setVal] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVal(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return ( 
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo} />
          <h1>RideMate</h1>
        </div>
        <nav className={styles.nav}>
          <a>Dashboard</a>
          <a>Rides</a>
          <a>Drivers</a>
          <a>Account</a>
        </nav>
        <div className={styles.cta}>Sign In</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h2 className={styles.h2}>Share rides. Save money. Ride together.</h2>
          <p className={styles.lead}>
            RideMate connects riders headed the same way, letting you split costs,
            reduce emissions, and enjoy smarter commutes.
          </p>

          <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Pickup location" />
            <input placeholder="Destination" />
            <button className={styles.primary}>Find Rides</button>
          </form>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.mediaPlaceholder} aria-hidden>
            {/* image / video placeholder */}
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>120k+</div>
          <div className={styles.statLabel}>Rides Shared</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>32k+</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>4.9★</div>
          <div className={styles.statLabel}>Avg. Rating</div>
        </div>
      </section>

      <section className={styles.features}>
        <h3 className={styles.h3}>Minimal, Elegant Features</h3>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <div className={styles.featureIcon} />
            <h4>Smart Matching</h4>
            <p>Find riders going your way with minimal detours.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon} />
            <h4>Secure Payments</h4>
            <p>Transparent split fares and quick settlements.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon} />
            <h4>Driver Tools</h4>
            <p>Easy ride management and ratings for trusted drivers.</p>
          </div>
        </div>
      </section>

      <section className={styles.dashboardPreview}>
        <h3 className={styles.h3}>Your Dashboard</h3>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h5>Upcoming Rides</h5>
            <div className={styles.emptyList}>No upcoming rides — try searching above.</div>
          </div>
          <div className={styles.card}>
            <h5>Your Earnings</h5>
            <div className={styles.emptyList}>—</div>
          </div>
          <div className={styles.card}>
            <h5>Messages</h5>
            <div className={styles.emptyList}>No new messages</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} RideMate</div>
        <div className={styles.footerLinks}>Terms · Privacy · Help</div>
      </footer>
    </main>
  );
};

export default Home;